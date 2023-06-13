import {
	type ClubsFunctionGetAdminPaths,
	type ClubsFunctionGetApiPaths,
	type ClubsFunctionGetPagePaths,
	type ClubsFunctionPlugin,
	type ClubsPluginMeta,
	ClubsPluginCategory,
	authenticate,
	decode,
	encode,
} from '@devprotocol/clubs-core'
import { default as Admin } from './pages/Admin.astro'
import Posts from './pages/Posts.astro'
import type { OptionsDatabase, PostPrimitives, Comment } from './types'
import { v5 as uuidv5 } from 'uuid'
import { constants, providers, utils } from 'ethers'
import { whenDefinedAll, type UndefinedOr } from '@devprotocol/util-ts'
import { getAllPosts, setAllPosts } from './db'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
	options,
	{ propertyAddress }
) => {
	return [
		{
			paths: [''],
			component: Posts,
			props: { options, propertyAddress },
			// `propertyAddress` is required for calling post API, so passed to the FE here.
		},
	]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (options) => {
	return [
		{
			paths: ['posts'],
			component: Admin,
			props: { options },
		},
	]
}

export const meta: ClubsPluginMeta = {
	id: 'clubs-plugin-posts',
	displayName: 'Clubs Posts',
	category: ClubsPluginCategory.Uncategorized,
}

export const getApiPaths: ClubsFunctionGetApiPaths = async (
	options,
	config
) => {
	const namespace = uuidv5(config.url, uuidv5.URL)
	const previousConfiguration = encode(config)
	const db = (
		options.find(
			({ key }) => key === 'database'
		) as UndefinedOr<OptionsDatabase>
	)?.value
	const dbType = db?.type
	const dbKey = db?.key

	return [
		{
			paths: [config.propertyAddress, 'message'],
			// This will be [POST] /api/clubs-plugin-posts/0x7sgg...6hfd/message
			method: 'POST',
			handler: async ({ request }) => {
				const { contents, hash, sig } = (await request.json()) as {
					readonly contents: string
					readonly hash?: string
					readonly sig?: string
				}

				const skipAuthentication =
					config.propertyAddress === constants.AddressZero

				const authenticated =
					!skipAuthentication &&
					(await whenDefinedAll([hash, sig], ([h, s]) =>
						authenticate({
							message: h,
							signature: s,
							previousConfiguration,
							provider: providers.getDefaultProvider(config.rpcUrl),
						})
					))

				const { randomBytes, recoverAddress, hashMessage } = utils
				const id = uuidv5(randomBytes(32), namespace)
				const created_by =
					whenDefinedAll([hash, sig], ([h, s]) =>
						recoverAddress(hashMessage(h), s)
					) || constants.AddressZero
				const now = new Date()
				const created_at = now
				const updated_at = now
				const decodedContents = decode<PostPrimitives>(contents)
				const comments: readonly Comment[] = []
				const composed = {
					...decodedContents,
					id,
					created_by,
					created_at,
					updated_at,
					comments,
				}
				const allPosts = await whenDefinedAll([dbType, dbKey], ([type, key]) =>
					getAllPosts(type, { key })
				)
				const merged =
					allPosts && !(allPosts instanceof Error)
						? [composed, ...allPosts]
						: undefined

				const saved =
					skipAuthentication === true || authenticated === true
						? await whenDefinedAll(
								[dbType, dbKey, merged],
								([type, key, posts]) => setAllPosts(type, { key, posts })
						  )
						: undefined

				return saved instanceof Error
					? new Response(
							JSON.stringify({
								error: saved,
							}),
							{
								status: 500,
							}
					  )
					: saved
					? new Response(
							JSON.stringify({
								message: saved,
							}),
							{
								status: 200,
							}
					  )
					: new Response(
							JSON.stringify({
								error: 'Some data is missing',
							}),
							{
								status: 400,
							}
					  )
			},
		},
		{
			paths: [config.propertyAddress, 'message'],
			method: 'GET',
			handler: async ({ request }) => {
				const { hash, sig } = (await request.json()) as {
					readonly hash?: string
					readonly sig?: string
				}

				const authenticated = await whenDefinedAll([hash, sig], ([h, s]) =>
					authenticate({
						message: h,
						signature: s,
						previousConfiguration,
						provider: providers.getDefaultProvider(config.rpcUrl),
					})
				)

				const allPosts = await whenDefinedAll([dbType, dbKey], ([type, key]) =>
					getAllPosts(type, { key })
				)

				return allPosts instanceof Error
					? new Response(
							JSON.stringify({
								error: allPosts,
							}),
							{
								status: 500,
							}
					  )
					: allPosts
					? new Response(
							JSON.stringify({
								contens: encode(allPosts),
							}),
							{
								status: 200,
							}
					  )
					: new Response(
							JSON.stringify({
								error: 'Some data is missing',
							}),
							{
								status: 400,
							}
					  )
			},
		},
	]
}

export default {
	getPagePaths,
	getAdminPaths,
	getApiPaths,
	meta,
} as ClubsFunctionPlugin
