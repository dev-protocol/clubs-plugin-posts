import { encode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import type { Posts } from '../types'
import { setPost } from '../db/redis-documents'
import { getDefaultClient } from '../db/redis'

export const addPostDocumentsRedis = async ({
	conf,
	data,
	dbQueryKey,
}: {
	readonly conf: ClubsConfiguration
	readonly data: Posts
	readonly dbQueryKey: string
}) => {
	try {
		const client = await getDefaultClient()

		const saved = await setPost({
			scope: dbQueryKey,
			post: data,
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
