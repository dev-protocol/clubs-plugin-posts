import { verifyMessage } from 'ethers'
import type { ClubsConfiguration } from '@devprotocol/clubs-core'
import { emojiAllowList } from '../constants'
import { addReactionDocumentsRedis } from './reactions-documents-redis'

export type AddReactionRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly postId: string
	readonly data: string
}>

export const addReactionHandler =
	(conf: ClubsConfiguration, dbQueryKey: string) =>
	async ({ request }: { readonly request: Request }) => {
		const { hash, sig, postId, data } =
			(await request.json()) as AddReactionRequestJson
		if (!data || !hash || !sig || !postId) {
			return new Response(
				JSON.stringify({
					error: 'Missing required content',
				}),
				{
					status: 400,
				},
			)
		}

		/**
		 * Emoji validation is now disabled.
		 * Reactions can also be used for voting, not only showing emotes.
		 * Also, restrictions on displayable emojis as reactions are doing on Reactions.vue.
		 */
		// /**
		//  * Check if club has allowListEmojis option
		//  * If not, use default allowListEmojis
		//  */
		// const clubAllowListEmojis =
		// 	(conf.options?.find((item) => item.key === 'allowListEmojis')
		// 		?.value as readonly string[]) ?? emojiAllowList

		// /**
		//  * Only allowlist emojis accepted
		//  */
		// if (!clubAllowListEmojis.includes(emoji)) {
		// 	return new Response(
		// 		JSON.stringify({
		// 			error: 'Emoji not allowed',
		// 		}),
		// 		{
		// 			status: 400,
		// 		},
		// 	)
		// }

		// get user address
		const userAddress = verifyMessage(hash, sig)

		return addReactionDocumentsRedis({
			conf,
			data,
			userAddress,
			postId,
			dbQueryKey,
		})
	}
