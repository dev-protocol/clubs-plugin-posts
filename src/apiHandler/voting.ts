import type { ClubsConfiguration } from '@devprotocol/clubs-core'
import { verifyMessage } from 'ethers'
import { addVotingEncodedRedis } from './voting-encoded-redis.ts'
import { addVotingDocumentsRedis } from './voting-documents-redis.ts'

export type AddVotingRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly postId: string
	readonly vote: string
}>

export const addVotingHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis' | 'documents:redis',
		dbQueryKey: string,
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { hash, sig, postId, vote } =
			(await request.json()) as AddVotingRequestJson
		if (!vote || !hash || !sig || !postId) {
			return new Response(
				JSON.stringify({
					error: 'Missing data',
				}),
				{
					status: 400,
				},
			)
		}

		// get user address
		const userAddress = verifyMessage(hash, sig)

		switch (dbQueryType) {
			case 'encoded:redis':
				return addVotingEncodedRedis({
					conf,
					data: vote,
					userAddress,
					postId,
					dbQueryKey,
				})
			case 'documents:redis':
				return addVotingDocumentsRedis({
					conf,
					data: vote,
					userAddress,
					postId,
					dbQueryKey,
				})
			default:
				return new Response(
					JSON.stringify({
						error: 'Invalid dbQueryType',
					}),
					{
						status: 400,
					},
				)
		}
	}
