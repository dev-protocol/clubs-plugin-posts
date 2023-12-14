import { type ClubsConfiguration } from '@devprotocol/clubs-core'
import { getAllPosts, setAllPosts } from '../db'
import type { Comment, Posts } from '../types'

export const addCommentEncodedRedis = async ({
	conf,
	data,
	postId,
	dbQueryKey,
}: {
	readonly conf: ClubsConfiguration
	readonly data: Comment
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
		const newPosts: readonly Posts[] = posts.map((post: Posts) =>
			post.id === postId
				? { ...post, comments: [...post.comments, data] }
				: post,
		)

		// === Update DB ===
		const isCommentAdded = await setAllPosts('encoded:redis', {
			key: dbQueryKey,
			posts: newPosts,
		})
		return isCommentAdded instanceof Error
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
						message: isCommentAdded,
						id: data.id,
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
