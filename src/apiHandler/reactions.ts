import { verifyMessage } from 'ethers'
import type { ClubsConfiguration } from '@devprotocol/clubs-core'
import { emojiAllowList } from '../constants'
import { addReactionDocumentsRedis } from './reactions-documents-redis'

export type AddReactionRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly postId: string
	readonly emoji: string
}>

export const addReactionHandler =
	(conf: ClubsConfiguration, dbQueryKey: string) =>
	async ({ request }: { readonly request: Request }) => {
		const { hash, sig, postId, emoji } =
			(await request.json()) as AddReactionRequestJson
		if (!emoji || !hash || !sig || !postId) {
			return new Response(
				JSON.stringify({
					error: 'Missing data',
				}),
				{
					status: 400,
				},
			)
		}

		/**
		 * Check if club has allowListEmojis option
		 * If not, use default allowListEmojis
		 */
		const clubAllowListEmojis =
			(conf.options?.find((item) => item.key === 'allowListEmojis')
				?.value as readonly string[]) ?? emojiAllowList

		/**
		 * Only allowlist emojis accepted
		 */
		if (!clubAllowListEmojis.includes(emoji)) {
			return new Response(
				JSON.stringify({
					error: 'Emoji not allowed',
				}),
				{
					status: 400,
				},
			)
		}

		// get user address
		const userAddress = verifyMessage(hash, sig)

		return addReactionDocumentsRedis({
			conf,
			data: emoji,
			userAddress,
			postId,
			dbQueryKey,
		})
	}
