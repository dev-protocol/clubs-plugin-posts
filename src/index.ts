import {
	type ClubsFunctionGetAdminPaths,
	type ClubsFunctionGetApiPaths,
	type ClubsFunctionGetPagePaths,
	type ClubsFunctionPlugin,
	type ClubsPluginMeta,
	ClubsPluginCategory,
	encode,
	fetchProfile,
	type ClubsApiPaths,
	type ClubsFunctionGetSlots,
	type ClubsApiPath,
	SinglePath,
	type Membership,
	ClubsSlotName,
} from '@devprotocol/clubs-core'
import {
	addCommentHandler,
	deleteCommentHandler,
	fetchCommentsHandler,
} from './apiHandler/comment'
import { maskFactory } from './fixtures/masking'
import {
	addReactionHandler,
	deleteReactionHandler,
} from './apiHandler/reactions'
import {
	addPostHandler,
	deletePostHandler,
	fetchPostHandler,
} from './apiHandler/posts'
import { v5 as uuidv5 } from 'uuid'
import { verifyMessage } from 'ethers'
import {
	isNotError,
	whenDefinedAll,
	type UndefinedOr,
} from '@devprotocol/util-ts'
import Screenshot1 from './assets/images/posts-1.jpg'
import Screenshot2 from './assets/images/posts-2.jpg'
import Screenshot3 from './assets/images/posts-3.jpg'
import Icon from './assets/images/plugin-icon.svg'
import { createIndex } from './db/redis-documents'
import { getAllPosts } from './db'
import { getDefaultClient, getPaginatedPosts } from './db/redis'
import { headers } from './fixtures/json'
import { CreateNavigationLink } from '@devprotocol/clubs-core/layouts'
import {
	type Option,
	type TokenURIWithId,
	type PostPrimitives,
	type Posts,
	type PostOption,
	type CommentPrimitives,
	type Comment,
	type OptionsDatabase,
	type Reactions,
	SlotName,
	Event,
} from './types'
import { fetchPostHas } from './apiHandler/search'
import { default as Feed } from './pages/Feed.astro'
import { default as ListFeed } from './pages/ListFeed.astro'
import { default as Layout } from './pages/Layout.astro'
import NavigationLink from './slots/NavigationLink.astro'
import Posts_ from './pages/Posts.astro'
import Readme from './readme.astro'
import News from './pages/News.astro'

export type {
	Option,
	TokenURIWithId,
	PostPrimitives,
	Posts,
	PostOption,
	CommentPrimitives,
	Comment,
	OptionsDatabase,
	Reactions,
}
export { SlotName, Event }

export const getPagePaths = (async (
	options,
	config,
	{ getPluginConfigById },
) => {
	const [membershipsPlugin] = getPluginConfigById(
		'devprotocol:clubs:simple-memberships',
	)
	const memberships = [
		...(config.offerings ?? []),
		...((membershipsPlugin?.options?.find(({ key }) => key === 'memberships')
			?.value as UndefinedOr<readonly Membership[]>) ?? []),
	]

	const dbs = options.find(
		({ key }: Readonly<{ readonly key: string }>) => key === 'feeds',
	)?.value as UndefinedOr<readonly OptionsDatabase[]>

	const avatarImgSrc: UndefinedOr<string> = config.options?.find(
		(option) => option.key === 'avatarImgSrc',
	)?.value as string

	const emojiAllowList = options?.find((item) => item.key === 'emojiAllowList')
		?.value as UndefinedOr<readonly string[]>

	const props = {
		name: config.name,
		options,
		propertyAddress: config.propertyAddress,
		memberships,
		adminRolePoints: config.adminRolePoints,
		emojiAllowList,
		rpcUrl: config.rpcUrl,
		avatarImgSrc,
		base: config.url,
	}
	return dbs
		? [
				...dbs.map(({ id, slug }) => {
					return {
						paths: [slug ?? 'posts'],
						component: Posts_,
						props: { ...props, feedId: id },
						// `propertyAddress` is required for calling post API, so passed to the FE here.
					}
				}),
				...dbs.map(({ id, database, slug, title }) => {
					return {
						paths: ['posts', id, SinglePath],
						component: Posts_,
						props: {
							...props,
							feedId: id,
							scope: database.key,
							slug: slug ?? 'posts',
							title,
						},
						layout: Layout,
					}
				}),
			]
		: []
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (
	options,
	config,
	{ getPluginConfigById },
) => {
	const [membershipsPlugin] = getPluginConfigById(
		'devprotocol:clubs:simple-memberships',
	)
	const memberships = membershipsPlugin?.options?.find(
		({ key }) => key === 'memberships',
	)?.value

	const feeds =
		(options.find(({ key }) => key === 'feeds')
			?.value as readonly OptionsDatabase[]) ?? []

	return [
		{ paths: ['posts'], component: ListFeed, props: { options } },
		{
			paths: ['posts', 'new'],
			component: Feed,
			props: { feeds, url: config.url, memberships },
		},
		...feeds.map((feed) => ({
			paths: ['posts', 'edit', feed.id],
			component: Feed,
			props: { feeds, url: config.url, edit: feed, memberships },
		})),
	]
}) satisfies ClubsFunctionGetAdminPaths

export const meta = {
	id: 'devprotocol:clubs:plugin:posts',
	displayName: 'Posts',
	description: 'Add an interactive posts feed to your Club',
	category: ClubsPluginCategory.Uncategorized,
	previewImages: [Screenshot1.src, Screenshot2.src, Screenshot3.src],
	readme: Readme,
	icon: Icon.src,
} satisfies ClubsPluginMeta

export const getApiPaths = (async (
	options,
	config,
	{ getPluginConfigById },
) => {
	const namespace = uuidv5(config.url, uuidv5.URL)
	const previousConfiguration = encode(config)
	const dbs = options.find(
		({ key }: Readonly<{ readonly key: string }>) => key === 'feeds',
	)?.value as UndefinedOr<readonly OptionsDatabase[]>

	const [membershipsPlugin] = getPluginConfigById(
		'devprotocol:clubs:simple-memberships',
	)
	const memberships = [
		...(config.offerings ?? []),
		...((membershipsPlugin?.options?.find(({ key }) => key === 'memberships')
			?.value as UndefinedOr<readonly Membership[]>) ?? []),
	]

	if (!dbs) {
		return []
	}

	return [
		{
			paths: ['indexing', 'documents:redis'],
			method: 'POST',
			handler: async () => {
				const client = await getDefaultClient()
				const res = await createIndex(client)
				await client.quit()
				return new Response(JSON.stringify(res))
			},
		},
		{
			paths: ['options', 'feeds'],
			method: 'GET',
			handler: async () => {
				return new Response(JSON.stringify(dbs), { headers })
			},
		},
		...dbs
			.map(
				(db) =>
					[
						/**
						 * delete post
						 */
						{
							paths: [db.id, 'message', 'delete'],
							method: 'POST',
							handler: deletePostHandler(
								memberships ?? [],
								config,
								db.database.key,
								db.roles,
							),
						},
						{
							paths: [db.id, 'message'],
							// This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/message
							method: 'POST',
							handler: addPostHandler(
								config,
								db.database.key,
								memberships ?? [],
								db.roles,
							),
						},

						/**
						 * For fetching paginated posts
						 */
						{
							paths: [db.id, 'message'],
							method: 'GET',
							handler: async ({ url }) => {
								const { hash, sig, page } = {
									hash: url.searchParams.get('hash'),
									sig: url.searchParams.get('sig'),
									page: url.searchParams.get('page'),
								} as {
									readonly hash?: string
									readonly sig?: string
									readonly page?: string
								}

								const parsedPage = parseInt(page ?? '0')

								// eslint-disable-next-line functional/no-let
								let reader

								try {
									reader = whenDefinedAll([hash, sig], ([h, s]) =>
										verifyMessage(h, s),
									)
								} catch (error) {
									console.log(error)
								}

								// eslint-disable-next-line functional/no-let
								let allPosts

								try {
									const _allPosts = await whenDefinedAll(
										[db.database.key],
										([key]) => getAllPosts({ key }, parsedPage),
									)

									const mask = await maskFactory({
										user: reader,
										propertyAddress: config.propertyAddress,
										rpcUrl: config.rpcUrl,
										memberships: memberships ?? [],
										roles: db.roles,
									})

									allPosts =
										(await whenDefinedAll(
											[mask, _allPosts],
											([maskFn, posts]) =>
												posts instanceof Error
													? posts
													: Promise.all(posts.map(maskFn)),
										)) ?? _allPosts
								} catch (error) {
									return new Response(JSON.stringify({ error: error }), {
										status: 500,
									})
								}

								/**
								 * If there is an error, return the error
								 */
								if (allPosts instanceof Error) {
									return new Response(JSON.stringify({ error: allPosts }), {
										status: 500,
									})
								}

								/**
								 * If there is no data, return 400
								 */
								if (!allPosts) {
									return new Response(
										JSON.stringify({ error: 'Some data is missing' }),
										{ status: 400 },
									)
								}

								/**
								 * get an array of addresses associated with the author of each post
								 */
								const createdByAddresses = allPosts.map(
									(post) => post.created_by,
								)

								/**
								 * get an array of addresses associated with posts comments
								 */
								const commentsAddresses = allPosts.map((post) =>
									post.comments.map((comment) => comment.created_by),
								)

								/**
								 * combine the two arrays into one and ensure that there are no duplicates
								 */
								const allAddresses = Array.from(
									new Set([...createdByAddresses, ...commentsAddresses.flat()]),
								)

								/**
								 * get the profile of each address
								 */
								const profiles = (
									await Promise.all(
										allAddresses.map(async (address) => ({
											[address]:
												(await fetchProfile(address))?.profile ?? undefined,
										})),
									)
								)
									// turn the array of objects into a single object
									.reduce((acc, profile) => ({ ...acc, ...profile }), {})

								return new Response(
									JSON.stringify({ contents: encode(allPosts), profiles }),
									{ status: 200 },
								)
							},
						},
						/**
						 * Fetch individual post
						 */
						{
							paths: [db.id, 'message', /((?!\/).)+/],
							method: 'GET',
							handler: fetchPostHandler({
								dbQueryKey: db.database.key,
								config,
								memberships: memberships ?? [],
								roles: db.roles,
							}),
						},
						/**
						 * Fetch paginated comments by post id
						 */
						{
							paths: [db.id, 'message', /((?!\/).)+/, 'comments'],
							method: 'GET',
							handler: fetchCommentsHandler(config),
						},
						{
							paths: [db.id, 'comment'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/comment
							method: 'POST',
							handler: addCommentHandler(config, db.database.key),
						},
						{
							paths: [db.id, 'comment', 'delete'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/comment
							method: 'POST',
							handler: deleteCommentHandler(config, db.database.key),
						},
						{
							paths: [db.id, 'reactions'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/reactions
							method: 'POST',
							handler: addReactionHandler(config, db.database.key),
						},
						{
							paths: [db.id, 'reactions'], // This will be [DELETE] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/reactions
							method: 'DELETE',
							handler: deleteReactionHandler(config),
						},
					] satisfies ClubsApiPaths,
			)
			.flat(),
		...dbs.map(
			(db) =>
				({
					paths: [db.id, 'search', /.*/],
					method: 'GET',
					handler: fetchPostHas(
						db.database.key,
						config,
						memberships ?? [],
						db.roles,
					),
				}) satisfies ClubsApiPath,
		),
	]
}) satisfies ClubsFunctionGetApiPaths

export const getSlots = (async (options, __, { paths, factory }) => {
	const [path1, path2, path3] = paths
	const feeds =
		(options.find(({ key }) => key === 'feeds')
			?.value as readonly OptionsDatabase[]) ?? []
	const newsFeeds = feeds.filter(
		(feed) =>
			feed.slots?.[ClubsSlotName.PageContentHomeBeforeContent] !== undefined &&
			feed.slots[ClubsSlotName.PageContentHomeBeforeContent].enabled,
	)
	const newsSlots =
		newsFeeds.length > 0 && factory === 'page'
			? newsFeeds
					.map((feed) => {
						return [
							{
								slot: ClubsSlotName.PageContentHomeBeforeContent,
								component: News,
								props: {
									scope: feed.database.key,
									feedId: feed.id,
									slots: feed.slots,
								},
							},
						]
					})
					.flat()
			: []

	return [
		...(factory === 'page' // == The public feed page with PageContentHomeBeforeContent slot
			? newsSlots
			: []),
		...(factory === 'admin' && path1 === 'posts' && path2 === undefined // == The feeds list page
			? [
					{
						slot: 'admin:aside:after-built-in-buttons',
						component: NavigationLink,
						props: {
							navigation: {
								display: 'Create a new feed',
								path: '/admin/posts/new',
							},
						},
					},
				]
			: []),
		...((feed) =>
			feed &&
			factory === 'admin' &&
			path1 === 'posts' &&
			path2 === 'edit' &&
			path3 // == The feed edit page
				? [
						{
							slot: 'admin:aside:after-built-in-buttons',
							component: CreateNavigationLink,
							props: {
								createNavigation: {
									label: `Add '${feed.title ?? 'Posts'}' to the menu`,
									link: {
										display: feed.title ?? 'Posts',
										path: `/${feed.slug ?? 'posts'}`,
									},
								},
							},
						},
					]
				: [])(feeds.find((feed) => feed.id === path3)),
	]
}) satisfies ClubsFunctionGetSlots

export default {
	getPagePaths,
	getAdminPaths,
	getApiPaths,
	getSlots,
	meta,
} satisfies ClubsFunctionPlugin
