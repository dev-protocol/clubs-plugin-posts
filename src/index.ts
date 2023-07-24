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
import type {
	OptionsDatabase,
	PostPrimitives,
	Comment,
	CommentPrimitives,
	Posts as PostType,
} from './types'
import { v5 as uuidv5 } from 'uuid'
import {
	ZeroAddress,
	getDefaultProvider,
	randomBytes,
	verifyMessage,
} from 'ethers'
import { whenDefinedAll, type UndefinedOr } from '@devprotocol/util-ts'
import { getAllPosts, setAllPosts } from './db'
import { addCommentsHandler } from './apiHandler/comment'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
	options,
	{ propertyAddress },
	{ getPluginConfigById },
) => {
	const [membershipsPlugin] = getPluginConfigById(
		'devprotocol:clubs:simple-memberships',
	)
	const memberships = membershipsPlugin?.options?.find(
		({ key }) => key === 'memberships',
	)?.value

	return [
		{
			paths: [''],
			component: Posts,
			props: { options, propertyAddress, memberships },
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
	config,
) => {
	const namespace = uuidv5(config.url, uuidv5.URL)
	const previousConfiguration = encode(config)
	const db = (
		options.find(
			({ key }: Readonly<{ readonly key: string }>) => key === 'database',
		) as UndefinedOr<OptionsDatabase>
	)?.value
	const dbType = db?.type || 'encoded:redis'
	const dbKey = db?.key || ''

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

				const skipAuthentication = config.propertyAddress === ZeroAddress

				const authenticated =
					!skipAuthentication &&
					(await whenDefinedAll([hash, sig], ([h, s]) =>
						authenticate({
							message: h,
							signature: s,
							previousConfiguration,
							provider: getDefaultProvider(config.rpcUrl),
						}),
					))

				// const { randomBytes, recoverAddress, hashMessage } = utils
				const id = uuidv5(randomBytes(32), namespace)

				const created_by = verifyMessage(hash, sig)

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

				// eslint-disable-next-line functional/no-try-statement
				try {
					const allPosts = await whenDefinedAll(
						[dbType, dbKey],
						([type, key]) => {
							return getAllPosts(type, { key })
						},
					)

					const merged =
						allPosts && !(allPosts instanceof Error)
							? [composed, ...allPosts]
							: undefined

					// Todo: このsaveは何を保存している？
					const saved =
						skipAuthentication === true || authenticated === true
							? await whenDefinedAll(
									[dbType, dbKey, merged],
									([type, key, posts]) => setAllPosts(type, { key, posts }),
							  )
							: undefined

					return saved instanceof Error
						? new Response(
								JSON.stringify({
									error: saved,
								}),
								{
									status: 500,
								},
						  )
						: saved
						? new Response(
								JSON.stringify({
									message: saved,
								}),
								{
									status: 200,
								},
						  )
						: new Response(
								JSON.stringify({
									error: 'Some data is missing',
								}),
								{
									status: 400,
								},
						  )
				} catch (e: any) {
					return new Response(
						JSON.stringify({
							error: e.memssage,
						}),
						{
							status: 500,
						},
					)
				}
			},
		},
		{
			paths: [config.propertyAddress, 'message'],
			method: 'GET',
			handler: async ({ request }) => {
				// Todo 現在はコメントアウトしているが、GET の場合でも認証必要で、ポストアイテムの読み取り可否を判断するために使います。
				/*
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
				 */

				// eslint-disable-next-line functional/no-let
				let allPosts
				// eslint-disable-next-line
				try {
					// eslint-disable-next-line
					allPosts = await whenDefinedAll([dbType, dbKey], ([type, key]) =>
						getAllPosts(type, { key }),
					)
				} catch (error) {
					return new Response(
						JSON.stringify({
							error,
						}),
						{
							status: 500,
						},
					)
				}

				return allPosts instanceof Error
					? new Response(
							JSON.stringify({
								error: allPosts,
							}),
							{
								status: 500,
							},
					  )
					: allPosts
					? new Response(
							JSON.stringify({
								contents: encode(allPosts),
							}),
							{
								status: 200,
							},
					  )
					: new Response(
							JSON.stringify({
								error: 'Some data is missing',
							}),
							{
								status: 400,
							},
					  )
			},
		},
		{
			paths: ['comment'], // This will be [POST] /api/clubs-plugin-posts/comment
			method: 'POST',
			handler: addCommentsHandler(previousConfiguration, config, dbType, dbKey),
		},
	]
}

export default {
	getPagePaths,
	getAdminPaths,
	getApiPaths,
	meta,
} as ClubsFunctionPlugin
