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
} from '@devprotocol/clubs-core'
import {
	addCommentHandler,
	deleteCommentHandler,
	fetchCommentsHandler,
} from './apiHandler/comment'
import { maskFactory } from './fixtures/masking'
import { addReactionHandler } from './apiHandler/reactions'
import {
	addPostHandler,
	deletePostHandler,
	fetchPostHandler,
} from './apiHandler/posts'
import { v5 as uuidv5 } from 'uuid'
import { verifyMessage } from 'ethers'
import { whenDefinedAll, type UndefinedOr } from '@devprotocol/util-ts'
import Screenshot1 from './assets/images/posts-1.jpg'
import Screenshot2 from './assets/images/posts-2.jpg'
import Screenshot3 from './assets/images/posts-3.jpg'
import Icon from './assets/images/plugin-icon.svg'
import { copyPostFromEncodedRedisToDocumentsRedisHandler } from './apiHandler/copy-encoded-redis_to_documents-redis'
import { xprod } from 'ramda'
import { createIndex } from './db/redis-documents'
import { getAllPosts } from './db'
import { getDefaultClient } from './db/redis'
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
import NavigationLink from './slots/NavigationLink.astro'
import Posts_ from './pages/Posts.astro'
import Readme from './readme.astro'

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

	const emojiAllowList = options?.find((item) => item.key === 'emojiAllowList')
		?.value as UndefinedOr<readonly string[]>

	const props = {
		options,
		propertyAddress,
		memberships,
		adminRolePoints,
		emojiAllowList,
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
				...dbs.map(({ id }) => {
					return {
						paths: ['posts', id, SinglePath],
						component: Posts_,
						props: { ...props, feedId: id },
					}
				}),
			]
		: []
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (options, config) => {
	const feeds =
		(options.find(({ key }) => key === 'feeds')
			?.value as readonly OptionsDatabase[]) ?? []

	return [
		{
			paths: ['posts'],
			component: ListFeed,
			props: { options },
		},
		{
			paths: ['posts', 'new'],
			component: Feed,
			props: { feeds, url: config.url },
		},
		...feeds.map((feed) => ({
			paths: ['posts', 'edit', feed.id],
			component: Feed,
			props: { feeds, url: config.url, edit: feed },
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

export const getApiPaths = (async (options, config) => {
	const namespace = uuidv5(config.url, uuidv5.URL)
	const previousConfiguration = encode(config)
	const dbs = options.find(
		({ key }: Readonly<{ readonly key: string }>) => key === 'feeds',
	)?.value as UndefinedOr<readonly OptionsDatabase[]>

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
				// eslint-disable-next-line functional/no-expression-statement
				await client.quit()
				return new Response(JSON.stringify(res))
			},
		},
		{
			paths: ['options', 'feeds'],
			method: 'GET',
			handler: async () => {
				return new Response(JSON.stringify(dbs), {
					headers,
				})
			},
		},
		...dbs
			.map(
				(db) =>
					[
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

						/**
						 * delete post
						 */
						{
							paths: [db.id, 'message', 'delete'],
							method: 'POST',
							handler: deletePostHandler(db.database.key),
						},
						{
							paths: [db.id, 'message'],
							// This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/message
							method: 'POST',
							handler: addPostHandler(
								config,
								db.database.type,
								db.database.key,
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
										([type, key]) => getAllPosts(type, { key }, parsedPage),
									)

									const mask = await maskFactory({
										user: reader,
										propertyAddress: config.propertyAddress,
										rpcUrl: config.rpcUrl,
									})
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
						/**
						 * Fetch individual post
						 */
						{
							paths: [db.id, 'message', /((?!\/).)+/],
							method: 'GET',
							handler: fetchPostHandler({
								dbQueryKey: db.database.key,
								config,
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
							handler: addCommentHandler(
								config,
								db.database.type,
								db.database.key,
							),
						},
						{
							paths: [db.id, 'comment', 'delete'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/comment
							method: 'POST',
							handler: deleteCommentHandler(
								config,
								db.database.type,
								db.database.key,
							),
						},
						{
							paths: [db.id, 'reactions'], // This will be [POST] /api/devprotocol:clubs:plugin:posts/{FEED_ID}/reactions
							method: 'POST',
							handler: addReactionHandler(config, db.database.key),
						},
					] satisfies ClubsApiPaths,
			)
			.flat(),
		...xprod(
			dbs.filter(({ database: { type } }) => type === 'encoded:redis'),
			dbs.filter(({ database: { type } }) => type === 'documents:redis'),
		).map(
			([encodedRedis, documentsRedis]) =>
				({
					paths: [encodedRedis.id, 'copy', 'to', documentsRedis.id],
					method: 'POST',
					handler: copyPostFromEncodedRedisToDocumentsRedisHandler({
						config,
						srcDatabaseKey: encodedRedis.database.key,
						distDatabaseKey: documentsRedis.database.key,
					}),
				}) satisfies ClubsApiPath,
		),
		...dbs
			.filter(({ database: { type } }) => type === 'documents:redis')
			.map(
				(db) =>
					({
						paths: [db.id, 'search', /.*/],
						method: 'GET',
						handler: fetchPostHas(db.database.key, config),
					}) satisfies ClubsApiPath,
			),
	]
}) satisfies ClubsFunctionGetApiPaths

export const getSlots = (async (options, __, { paths, factory }) => {
	const [path1, path2, path3] = paths

	if (factory === 'admin' && path1 === 'posts' && path2 === undefined) {
		const addSlotsValue = {
			slot: 'admin:aside:after-built-in-buttons',
			component: NavigationLink,
			props: {
				navigation: {
					display: 'Create a new feed',
					path: '/admin/posts/new',
				},
			},
		}

		return [addSlotsValue]
	}

	if (factory === 'admin' && path1 === 'posts' && path2 === 'edit' && path3) {
		const feeds =
			(options.find(({ key }) => key === 'feeds')
				?.value as readonly OptionsDatabase[]) ?? []
		const feed = feeds.find((feed) => feed.id === path3)

		const label = feed?.title
			? `Add '${feed.title}' to the menu`
			: `Add 'Posts' to the menu`
		const display = feed?.title ? feed.title : 'Posts'
		const path = feed?.slug ? `/${feed.slug}` : '/posts'

		const addSlotsValue = {
			slot: 'admin:aside:after-built-in-buttons',
			component: CreateNavigationLink,
			props: {
				createNavigation: {
					label,
					link: {
						display,
						path,
					},
				},
			},
		}

		return [addSlotsValue]
	}

	return []
}) satisfies ClubsFunctionGetSlots

export default {
	getPagePaths,
	getAdminPaths,
	getApiPaths,
	getSlots,
	meta,
} satisfies ClubsFunctionPlugin
