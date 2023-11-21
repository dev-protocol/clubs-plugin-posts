import { encode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import { setComment } from '../db/redis-documents'
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
