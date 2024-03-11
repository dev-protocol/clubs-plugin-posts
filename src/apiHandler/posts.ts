import { ZeroAddress, getDefaultProvider, verifyMessage } from 'ethers'
import {
	decode,
	type ClubsConfiguration,
	authenticate,
	encode,
} from '@devprotocol/clubs-core'
import type { Comment, PostPrimitives, Reactions } from '../types'
import {
	whenDefined,
	whenDefinedAll,
	whenNotError,
	whenNotErrorAll,
} from '@devprotocol/util-ts'
import { uuidFactory } from '../db/uuidFactory'
import { addPostEncodedRedis } from './posts-encoded-redis'
import { addPostDocumentsRedis } from './posts-documents-redis'
import { fetchSinglePost, getDefaultClient } from '../db/redis'
import { deletePost } from '../db/redis-documents'
import { aperture, tryCatch } from 'ramda'
import { maskFactory } from '../fixtures/masking'

export type AddCommentRequestJson = Readonly<{
	readonly contents: string
	readonly hash: string
	readonly sig: string
	readonly postId: string
}>

export const addPostHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis' | 'documents:redis',
		dbQueryKey: string,
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

		const authenticated =
			!skipAuthentication &&
			(await whenDefinedAll([hash, sig], ([h, s]) =>
				authenticate({
					message: h,
					signature: s,
					previousConfiguration: encode(conf),
					provider: getDefaultProvider(conf.rpcUrl),
				}),
			))
		// const { randomBytes, recoverAddress, hashMessage } = utils
		const id = uuidFactory(conf.url)()

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

		if (!authenticated) {
			return new Response(JSON.stringify({ message: 'not allowed' }), {
				status: 401,
			})
		}

		switch (dbQueryType) {
			case 'encoded:redis':
				return addPostEncodedRedis({
					conf,
					data: composed,
					dbQueryKey,
				})
			case 'documents:redis': {
				// return new Response(JSON.stringify({ message: 'not implemented' }))
				return addPostDocumentsRedis({
					conf,
					data: composed,
					dbQueryKey,
				})
			}
			default:
				return new Response(JSON.stringify({ message: 'not implemented' }))
		}
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
	}: {
		readonly dbQueryKey: string
		readonly config: ClubsConfiguration
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
		const mask = await whenNotError(reader, (user) =>
			maskFactory({
				user,
				propertyAddress: config.propertyAddress,
				rpcUrl: config.rpcUrl,
			}),
		)

		try {
			/**
			 * fetch the post
			 */

			const post =
				(await whenDefined(postId, (id) => fetchSinglePost({ id, client }))) ??
				new Error('Post ID not found')
			const result = whenNotErrorAll([post, mask], ([p, maskFn]) =>
				[p].map(maskFn),
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

			return new Response(
				JSON.stringify({
					contents: encode(result),
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
		// conf: ClubsConfiguration,
		// dbQueryType: 'encoded:redis' | 'documents:redis',
		dbQueryKey: string,
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { postId, hash, sig } = (await request.json()) as {
			readonly postId: string
			readonly hash: string
			readonly sig: string
		}
		const client = await getDefaultClient()

		/** get the parent post id */
		// const splitUrl = url.pathname.split('/')
		// const postId = splitUrl[splitUrl.length - 2]
		const createdBy = verifyMessage(hash, sig)

		const success = await deletePost({
			postId,
			client,
			scope: dbQueryKey,
			userAddress: createdBy,
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
