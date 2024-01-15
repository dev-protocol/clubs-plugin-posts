import { verifyMessage } from 'ethers'
import { decode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import type { CommentPrimitives, Comment } from '../types'
import {
	addCommentEncodedRedis,
	deleteCommentEncodedRedis,
} from './comment-encoded-redis'
import { uuidFactory } from '../db/uuidFactory'
import {
	addCommentDocumentsRedis,
	deleteCommentDocumentsRedis,
} from './comment-documents-redis'
import { fetchComments } from '../db/redis-documents'
import { getDefaultClient } from '../db/redis'

export type AddCommentRequestJson = Readonly<{
	readonly contents: string
	readonly hash: string
	readonly sig: string
	readonly postId: string
}>

export type DeleteCommentRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly postId: string
	readonly commentId: string
}>

export const addCommentHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis' | 'documents:redis',
		dbQueryKey: string,
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { contents, hash, sig, postId } =
			(await request.json()) as AddCommentRequestJson
		if (!contents || !hash || !sig || !postId) {
			return new Response(
				JSON.stringify({
					error: 'Missing data',
				}),
				{
					status: 400,
				},
			)
		}

		// === COMMENTS ===
		const date = new Date()
		const decodedContents = decode<CommentPrimitives>(contents)
		const newComment: Comment = {
			...decodedContents,
			id: uuidFactory(conf.url)(),
			created_by: verifyMessage(hash, sig),
			created_at: date,
			updated_at: date,
		}

		switch (dbQueryType) {
			case 'encoded:redis':
				return addCommentEncodedRedis({
					conf,
					data: newComment,
					postId,
					dbQueryKey,
				})
			case 'documents:redis':
				return addCommentDocumentsRedis({
					conf,
					data: newComment,
					postId,
					dbQueryKey,
				})
			default:
				return new Response(JSON.stringify({ message: 'not implemented' }))
		}
	}

export const deleteCommentHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis' | 'documents:redis',
		dbQueryKey: string,
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { commentId, hash, sig, postId } =
			(await request.json()) as DeleteCommentRequestJson
		if (!commentId || !hash || !sig || !postId) {
			return new Response(
				JSON.stringify({
					error: 'Missing data',
				}),
				{
					status: 400,
				},
			)
		}

		switch (dbQueryType) {
			case 'encoded:redis':
				return deleteCommentEncodedRedis({
					conf,
					commentId,
					postId,
					dbQueryKey,
				})
			case 'documents:redis':
				return deleteCommentDocumentsRedis({
					conf,
					commentId,
					postId,
					dbQueryKey,
				})
			default:
				return new Response(JSON.stringify({ message: 'not implemented' }))
		}
	}

/**
 * This can be used to fetch more paginated post comments by page id
 * @param conf
 * @param dbQueryKey
 * @returns paginated comments
 */
export const fetchCommentsHandler =
	(conf: ClubsConfiguration) =>
	async ({
		request,
		url,
	}: {
		readonly request: Request
		readonly url: URL
	}) => {
		const client = await getDefaultClient()

		/** get the parent post id */
		const splitUrl = url.pathname.split('/')
		const postId = splitUrl[splitUrl.length - 2]

		/** page page number from query params */
		const page = url.searchParams.get('page')

		try {
			/**
			 * fetch the comments
			 */

			const comments = await fetchComments({
				scope: conf.url,
				postId,
				client,
				page: page ? parseInt(page) : 0,
			})

			return new Response(
				JSON.stringify({
					comments,
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
	}
