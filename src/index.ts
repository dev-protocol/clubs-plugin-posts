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
	fetchProfile,
	type ClubsApiPaths,
} from '@devprotocol/clubs-core'
import { default as Admin } from './pages/Admin.astro'
import Posts from './pages/Posts.astro'
import type {
	OptionsDatabase,
	PostPrimitives,
	Comment,
	CommentPrimitives,
	Posts as PostType,
	Reactions,
} from './types'
import { v5 as uuidv5 } from 'uuid'
import {
	ZeroAddress,
	getDefaultProvider,
	randomBytes,
	verifyMessage,
} from 'ethers'
import {
	whenDefinedAll,
	type UndefinedOr,
	whenDefined,
} from '@devprotocol/util-ts'
import { getAllPosts, setAllPosts } from './db'
import { addCommentHandler } from './apiHandler/comment'
import { maskFactory } from './fixtures/masking'
import { addReactionHandler } from './apiHandler/reactions'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
	options,
	{ propertyAddress, adminRolePoints },
	{ getPluginConfigById },
) => {
	const [membershipsPlugin] = getPluginConfigById(
		'devprotocol:clubs:simple-memberships',
	)
	const memberships = membershipsPlugin?.options?.find(
		({ key }) => key === 'memberships',
	)?.value

	const dbs = options.find(
		({ key }: Readonly<{ readonly key: string }>) => key === 'feeds',
	)?.value as UndefinedOr<readonly OptionsDatabase[]>

	return [
		...(dbs?.map(({ id, slug }) => ({
			paths: [slug ?? 'posts'],
			component: Posts,
			props: {
				options,
				feedId: id,
				propertyAddress,
				memberships,
				adminRolePoints,
			},
			// `propertyAddress` is required for calling post API, so passed to the FE here.
		})) ?? []),
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
	id: 'devprotocol:clubs:plugin:posts',
	displayName: 'Clubs Posts',
	description: 'Add an interactive posts feed to your Club',
	category: ClubsPluginCategory.Uncategorized,
}

export const getApiPaths: ClubsFunctionGetApiPaths = async (
	options,
	config,
) => {
	const namespace = uuidv5(config.url, uuidv5.URL)
	const previousConfiguration = encode(config)
	const dbs = options.find(
		({ key }: Readonly<{ readonly key: string }>) => key === 'feeds',
	)?.value as UndefinedOr<readonly OptionsDatabase[]>

	if (!dbs) {
		return []
	}

	return [
		...dbs
			.map(
				(db): ClubsApiPaths => [
					{
						paths: [db.id, 'profile'],
						method: 'GET',
						handler: async ({ url }) => {
							const address = url.searchParams.get('address')

							if (!address) {
								return new Response(
									JSON.stringify({
										error: 'Address is missing',
										data: null,
									}),
									{
										status: 400,
									},
								)
							}

							//
							try {
								const res = await fetchProfile(address)
								if (res.error) {
									return new Response(
										JSON.stringify({
											error: res.error,
											data: null,
										}),
										{
											status: 500,
										},
									)
								}

								return new Response(
									JSON.stringify({
										profile: res.profile,
									}),
									{
										status: 200,
									},
								)
							} catch (e) {
								return new Response(
									JSON.stringify({
										error: e,
										data: null,
									}),
									{
										status: 500,
									},
								)
							}
						},
					},
					{
						paths: [db.id, 'message'],
						// This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/message
						method: 'POST',
						handler: async ({ request }) => {
							const { contents, hash, sig } = (await request.json()) as {
								readonly contents: string
								readonly hash?: string
								readonly sig?: string
							}

							if (!hash || !sig) {
								return new Response(
									JSON.stringify({
										error: 'Hash or Signature are missing',
										data: null,
									}),
									{
										status: 400,
									},
								)
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
							const reactions: Reactions = {}

							const composed = {
								...decodedContents,
								id,
								created_by,
								created_at,
								updated_at,
								comments,
								reactions,
							}

							// eslint-disable-next-line functional/no-try-statement
							try {
								const allPosts = await whenDefinedAll(
									[db.database.type, db.database.key],
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
												[db.database.type, db.database.key, merged],
												([type, key, posts]) =>
													setAllPosts(type, { key, posts }),
										  )
										: undefined

								return saved instanceof Error
									? new Response(
											JSON.stringify({
												error: saved,
												data: null,
											}),
											{
												status: 500,
											},
									  )
									: saved
									? new Response(
											JSON.stringify({
												message: saved,
												data: encode(composed),
											}),
											{
												status: 200,
											},
									  )
									: new Response(
											JSON.stringify({
												error: 'Some data is missing',
												data: null,
											}),
											{
												status: 400,
											},
									  )
							} catch (e: any) {
								return new Response(
									JSON.stringify({
										error: e.message,
										data: null,
									}),
									{
										status: 500,
									},
								)
							}
						},
					},
					{
						paths: [db.id, 'message'],
						method: 'GET',
						handler: async ({ request, url }) => {
							const { hash, sig } = url.searchParams as {
								readonly hash?: string
								readonly sig?: string
							}

							// eslint-disable-next-line functional/no-let
							let reader

							try {
								// eslint-disable-next-line functional/no-expression-statement
								reader = whenDefinedAll([hash, sig], ([h, s]) =>
									verifyMessage(h, s),
								)
							} catch (error) {
								// eslint-disable-next-line functional/no-expression-statement
								console.log(error)
							}

							// eslint-disable-next-line functional/no-let
							let allPosts
							// eslint-disable-next-line
							try {
								const _allPosts = await whenDefinedAll(
									[db.database.type, db.database.key],
									([type, key]) => getAllPosts(type, { key }),
								)

								const mask = await whenDefined(reader, (user) =>
									maskFactory(user, config.propertyAddress, config.rpcUrl),
								)
								// eslint-disable-next-line
								allPosts =
									whenDefinedAll([mask, _allPosts], ([maskFn, posts]) =>
										posts instanceof Error ? posts : posts.map(maskFn),
									) ?? _allPosts
							} catch (error) {
								return new Response(
									JSON.stringify({
										error: error,
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
						paths: [db.id, 'comment'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/comment
						method: 'POST',
						handler: addCommentHandler(
							config,
							db.database.type,
							db.database.key,
						),
					},
					{
						paths: [db.id, 'reactions'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/reactions
						method: 'POST',
						handler: addReactionHandler(
							config,
							db.database.type,
							db.database.key,
						),
					},
				],
			)
			.flat(),
	]
}

export default {
	getPagePaths,
	getAdminPaths,
	getApiPaths,
	meta,
} as ClubsFunctionPlugin
