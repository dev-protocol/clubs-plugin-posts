import { encode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import { deleteComment, setComment } from '../db/redis-documents'
import { getDefaultClient } from '../db/redis'
import type { Comment } from '../types'

export const addCommentDocumentsRedis = async ({
	conf,
	data,
	dbQueryKey,
	postId,
}: {
	readonly conf: ClubsConfiguration
	readonly data: Comment
	readonly postId: string
	readonly dbQueryKey: string
}) => {
	try {
		const client = await getDefaultClient()

		const saved = await setComment({
			scope: dbQueryKey,
			comment: data,
			postId,
			url: conf.url,
			client,
		})

		return saved
			? new Response(
					JSON.stringify({
						message: saved,
						data: encode(data),
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
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: (e as Error)?.message,
				data: null,
			}),
			{
				status: 500,
			},
		)
	}
}

export const deleteCommentDocumentsRedis = async ({
	conf,
	commentId,
	dbQueryKey,
	postId,
}: {
	readonly conf: ClubsConfiguration
	readonly commentId: string
	readonly postId: string
	readonly dbQueryKey: string
}) => {
	try {
		const client = await getDefaultClient()

		const deleted = await deleteComment({
			scope: dbQueryKey,
			commentId: commentId,
			parentType: 'comment',
			client,
		})

		return deleted
			? new Response(
					JSON.stringify({
						message: deleted,
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
	} catch (e) {
		return new Response(
			JSON.stringify({
				error: (e as Error)?.message,
				data: null,
			}),
			{
				status: 500,
			},
		)
	}
}
