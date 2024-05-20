import { encode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import { deleteReaction, setReaction } from '../db/redis-documents'
import { getDefaultClient } from '../db/redis'

export const addReactionDocumentsRedis = async ({
	conf,
	data,
	postId,
	userAddress,
	dbQueryKey,
}: {
	readonly conf: ClubsConfiguration
	readonly data: string
	readonly userAddress: string
	readonly postId: string
	readonly dbQueryKey: string
}) => {
	try {
		const client = await getDefaultClient()

		const id = await setReaction({
			scope: dbQueryKey,
			reaction: data,
			postId,
			url: conf.url,
			client,
			createdBy: userAddress,
		})

		return id
			? new Response(
					JSON.stringify({
						id,
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

export const removeReactionDocumentsRedis = async ({
	reactionKey,
	userAddress,
}: {
	readonly reactionKey: string
	readonly userAddress: string
}) => {
	try {
		const client = await getDefaultClient()

		const success = await deleteReaction({
			reactionKey,
			client,
			userAddress,
		})

		return success
			? new Response(
					JSON.stringify({
						success,
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
