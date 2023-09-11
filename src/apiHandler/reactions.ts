import { verifyMessage, getDefaultProvider } from 'ethers'
import { authenticate, ClubsConfiguration } from '@devprotocol/clubs-core'

import { getAllPosts, setAllPosts } from '../db'
import type { Posts, Reactions } from '../types'
import { emojiAllowList } from '../constants'

export type AddReactionRequestJson = Readonly<{
	readonly hash: string
	readonly sig: string
	readonly postId: string
	readonly emoji: string
}>

export const addReactionHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis',
		dbQueryKey: string,
	) =>
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

		try {
			// get user address
			const userAddress = verifyMessage(hash, sig)

			// === Fetch from DB and calculate ===
			const posts = await getAllPosts(dbQueryType, { key: dbQueryKey })
			if (!posts || posts instanceof Error) {
				return new Response(
					JSON.stringify({
						error: 'Error fetching post',
					}),
					{
						status: 401,
					},
				)
			}
			const postIndex = posts.findIndex((post: Posts) => post.id === postId)
			if (postIndex === -1) {
				return new Response(
					JSON.stringify({
						error: 'Error fetching post',
					}),
					{
						status: 401,
					},
				)
			}

			const removeUser = (reactions: Reactions) => {
				return reactions[emoji].filter((i) => i !== userAddress)
			}

			/**
			 * Resets posts to toggle user reaction
			 */
			const newPosts: readonly Posts[] = posts.map((post: Posts) =>
				post.id === postId
					? {
							...post,
							reactions: {
								...post.reactions,
								// check if emoji exists
								[emoji]: !post.reactions[emoji]
									? // if emoji doesn't exist, add user address
									  [userAddress]
									: // emoji exists, check if emoji includes user address
									post.reactions[emoji].includes(userAddress)
									? // if user address already associated with this emoji, remove user address
									  // post.reactions[emoji].filter((i) => i !== userAddress)
									  removeUser(post.reactions)
									: // if user address not associated with this emoji, add user address
									  [...post.reactions[emoji], userAddress],
							},
					  }
					: post,
			)

			// === Update DB ===
			const isReactionUpdated = await setAllPosts('encoded:redis', {
				key: dbQueryKey,
				posts: newPosts,
			})
			return isReactionUpdated instanceof Error
				? new Response(
						JSON.stringify({
							error: 'Update failed',
						}),
						{
							status: 500,
						},
				  )
				: new Response(
						JSON.stringify({
							message: isReactionUpdated,
						}),
						{
							status: 200,
						},
				  )
		} catch (err) {
			return new Response(
				JSON.stringify({
					error: (err as Error)?.message || 'Error occured',
				}),
				{
					status: 500,
				},
			)
		}
	}
