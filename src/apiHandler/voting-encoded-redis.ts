import { type ClubsConfiguration } from '@devprotocol/clubs-core'
import { getAllPosts, setAllPosts } from '../db'
import type { Posts, Reactions, Voting } from '../types'

export const addVotingEncodedRedis = async ({
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

		const removeUser = (reactions: Voting) => {
			return reactions[data].filter((i) => i !== userAddress)
		}

		/**
		 * Resets posts to toggle user voting
		 */
		const newPosts: readonly Posts[] = posts.map((post: Posts) =>
			post.id === postId
				? {
						...post,
						voting: {
							...post.voting,
							// check if vote exists
							[data]: !post.voting[data]
								? // if vote doesn't exist, add user address
									[userAddress]
								: // vote exists, check if vote includes user address
									post.voting[data].includes(userAddress)
									? // if vote includes user address, remove user address
										removeUser(post.voting)
									: // if emoji doesn't include user address, add user address
										[...post.voting[data], userAddress],
						},
					}
				: post,
		)

		// === Save to DB ===
		const isVotingUpdate = await setAllPosts('encoded:redis', {
			key: dbQueryKey,
			posts: newPosts,
		})

		return isVotingUpdate instanceof Error
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
						message: isVotingUpdate,
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
