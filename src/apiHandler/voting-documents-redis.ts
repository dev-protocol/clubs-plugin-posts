import { encode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import { setReaction } from '../db/redis-documents'
import { getDefaultClient } from '../db/redis'

export const addVotingDocumentsRedis = async ({
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

		const saved = await setVoting({
			scope: dbQueryKey,
			voting: data,
			postId,
			url: conf.url,
			client,
			createdBy: userAddress,
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
