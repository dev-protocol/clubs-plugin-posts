import { ZeroAddress, getDefaultProvider, verifyMessage } from 'ethers'
import {
	decode,
	type ClubsConfiguration,
	authenticate,
	encode,
	type Membership,
	fetchProfile,
} from '@devprotocol/clubs-core'
import type {
	Comment,
	OptionsDatabase,
	PostPrimitives,
	Reactions,
} from '../types'
import {
	whenDefined,
	whenDefinedAll,
	whenNotErrorAll,
} from '@devprotocol/util-ts'
import { uuidFactory } from '../db/uuidFactory'
import { addPostDocumentsRedis } from './posts-documents-redis'
import { fetchSinglePost, getDefaultClient } from '../db/redis'
import { deletePost } from '../db/redis-documents'
import { aperture, tryCatch } from 'ramda'
import { maskFactory } from '../fixtures/masking'
import { hasWritePermission } from '../fixtures/memberships'

export type AddCommentRequestJson = Readonly<{
	readonly contents: string
	readonly hash: string
	readonly sig: string
	readonly postId: string
}>

export const addPostHandler =
	(
		conf: ClubsConfiguration,
		dbQueryKey: string,
		memberships?: readonly Membership[],
		roles?: OptionsDatabase['roles'],
	) =>
	async ({ request }: { readonly request: Request }) => {
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

		const skipAuthentication = conf.propertyAddress === ZeroAddress

		const created_by = verifyMessage(hash, sig)

		const authenticated =
			!skipAuthentication &&
			((await whenDefinedAll([hash, sig], ([h, s]) =>
				authenticate({
					message: h,
					signature: s,
					previousConfiguration: encode(conf),
					provider: getDefaultProvider(conf.rpcUrl),
				}),
			)) ||
				(await hasWritePermission({
					account: created_by,
					provider: getDefaultProvider(conf.rpcUrl),
					propertyAddress: conf.propertyAddress,
					memberships,
					roles,
				})))
		// const { randomBytes, recoverAddress, hashMessage } = utils
		const id = uuidFactory(conf.url)()

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

		if (!authenticated) {
			return new Response(JSON.stringify({ message: 'not allowed' }), {
				status: 401,
			})
		}

		return addPostDocumentsRedis({
			conf,
			data: composed,
			dbQueryKey,
		})
	}

/**
 * This can be used to fetch a single Post by ID
 * @param options the all options
 * @param options.dbQueryKey the scope of the query
 * @param options.config the ClubsConfigutation
 * @returns a single post
 */
export const fetchPostHandler =
	({
		dbQueryKey,
		config,
		memberships,
		roles,
	}: {
		readonly dbQueryKey: string
		readonly config: ClubsConfiguration
		readonly memberships: readonly Membership[]
		readonly roles: OptionsDatabase['roles']
	}) =>
	async ({
		request,
		url,
	}: {
		readonly request: Request
		readonly url: URL
	}) => {
		const client = await getDefaultClient()

		/** get the parent post id */
		const pathquery = aperture(2, decodeURIComponent(url.pathname).split('/'))
		const [, postId] = pathquery.find(([key]) => key === 'message') ?? []

		const { hash, sig } = {
			hash: url.searchParams.get('hash'),
			sig: url.searchParams.get('sig'),
		} as {
			readonly hash?: string
			readonly sig?: string
		}
		const reader = whenDefinedAll([hash, sig], ([_hash, _sig]) => {
			return tryCatch(
				([_h, _s]: readonly [string, string]) =>
					whenDefinedAll([_h, _s], ([h, s]) => verifyMessage(h, s)),
				(err: Error) => err,
			)([_hash, _sig])
		})

		try {
			/**
			 * fetch the post
			 */

			const post =
				(await whenDefined(postId, (id) =>
					fetchSinglePost({ id, scope: dbQueryKey, client }),
				)) ?? new Error('Post ID not found')
			const mask = await whenNotErrorAll([reader, post], ([user]) =>
				maskFactory({
					user,
					propertyAddress: config.propertyAddress,
					rpcUrl: config.rpcUrl,
					memberships: memberships,
					roles: roles,
				}),
			)
			const result = await whenNotErrorAll([post, mask], ([p, maskFn]) =>
				Promise.all([p].map(maskFn)),
			)

			if (result instanceof Error) {
				return new Response(
					JSON.stringify({
						error: 'Post not found',
						data: null,
					}),
					{
						status: 404,
					},
				)
			}

			/**
			 * get an array of addresses associated with posts comments
			 */
			const commentsAddresses = result[0].comments.map(
				(comment) => comment.created_by,
			)

			/**
			 * combine the two arrays into one and ensure that there are no duplicates
			 */
			const allAddresses = Array.from(
				new Set([result[0].created_by, ...commentsAddresses.flat()]),
			)

			/**
			 * get the profile of each address
			 */
			const profiles = (
				await Promise.all(
					allAddresses.map(async (address) => ({
						[address]: (await fetchProfile(address))?.profile ?? undefined,
					})),
				)
			)
				// turn the array of objects into a single object
				.reduce((acc, profile) => ({ ...acc, ...profile }), {})

			return new Response(
				JSON.stringify({
					contents: encode(result),
					profiles,
				}),
				{
					status: 200,
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
	}

/**
 * Deletes a single post
 * @param dbQueryKey the scope of the query
 * @returns a single post
 */
export const deletePostHandler =
	(
		memberships: readonly Membership[],
		config: ClubsConfiguration,
		dbQueryKey: string,
		roles?: OptionsDatabase['roles'],
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { postId, hash, sig } = (await request.json()) as {
			readonly postId: string
			readonly hash: string
			readonly sig: string
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
		const client = await getDefaultClient()

		const skipAuthentication = config.propertyAddress === ZeroAddress

		/** get the parent post id */
		// const splitUrl = url.pathname.split('/')
		// const postId = splitUrl[splitUrl.length - 2]
		const userAddress = verifyMessage(hash, sig)
		const authenticated =
			!skipAuthentication &&
			((await whenDefinedAll([hash, sig], ([h, s]) =>
				authenticate({
					message: h,
					signature: s,
					previousConfiguration: encode(config),
					provider: getDefaultProvider(config.rpcUrl),
				}),
			)) ||
				(await hasWritePermission({
					account: userAddress,
					provider: getDefaultProvider(config.rpcUrl),
					propertyAddress: config.propertyAddress,
					memberships,
					roles,
				})))
		const success = await deletePost({
			postId,
			client,
			scope: dbQueryKey,
			userAddress: userAddress,
			authenticated,
		})

		// eslint-disable-next-line functional/no-expression-statement
		await client.quit()

		return success
			? new Response(JSON.stringify({ success: true }), {
					status: 200,
				})
			: new Response(JSON.stringify({ success: false }), {
					status: 500,
				})
	}
