import { verifyMessage } from 'ethers'
import { decode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import type { CommentPrimitives, Comment } from '../types'
import { addCommentEncodedRedis } from './comment-encoded-redis'
import { uuidFactory } from '../db/uuidFactory'

export type AddCommentRequestJson = Readonly<{
	readonly contents: string
	readonly hash: string
	readonly sig: string
	readonly postId: string
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
			default:
				return new Response(JSON.stringify({ message: 'not implemented' }))
		}
	}
