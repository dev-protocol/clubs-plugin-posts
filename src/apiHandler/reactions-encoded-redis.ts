import { type ClubsConfiguration } from '@devprotocol/clubs-core'
import { getAllPosts, setAllPosts } from '../db'
import type { Posts, Reactions } from '../types'

export const addReactionEncodedRedis = async ({
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
		// === Fetch from DB and calculate ===
		const posts = await getAllPosts('encoded:redis', { key: dbQueryKey })
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
			return reactions[data].filter((i) => i !== userAddress)
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
							[data]: !post.reactions[data]
								? // if emoji doesn't exist, add user address
								  [userAddress]
								: // emoji exists, check if emoji includes user address
								post.reactions[data].includes(userAddress)
								? // if user address already associated with this emoji, remove user address
								  // post.reactions[emoji].filter((i) => i !== userAddress)
								  removeUser(post.reactions)
								: // if user address not associated with this emoji, add user address
								  [...post.reactions[data], userAddress],
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
