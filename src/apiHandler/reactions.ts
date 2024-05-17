import { getDefaultProvider, verifyMessage } from 'ethers'
import {
	authenticate,
	encode,
	type ClubsConfiguration,
} from '@devprotocol/clubs-core'
import { addReactionDocumentsRedis } from './reactions-documents-redis'

export type AddReactionRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly postId: string
	readonly data: string
}>

export type RemoveReactionRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly id: string
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

const removeReactionHandler =
	(conf: ClubsConfiguration, dbQueryKey: string) =>
	async ({ request }: { readonly request: Request }) => {
		const { hash, sig, id } =
			(await request.json()) as RemoveReactionRequestJson

		const authenticated = await authenticate({
			message: hash,
			signature: sig,
			previousConfiguration: encode(conf),
			provider: getDefaultProvider(conf.rpcUrl),
		})

		if (!authenticated) {
			return new Response(
				JSON.stringify({
					error: 'Authentication failed',
				}),
				{
					status: 401,
				},
			)
		}

		const userAddress = verifyMessage(hash, sig)

		return new Response(
			JSON.stringify({
				error: 'Not implemented',
			}),
			{
				status: 501,
			},
		)
	}
