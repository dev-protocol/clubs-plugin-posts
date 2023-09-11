import { v5 as uuidv5 } from 'uuid'
import { getDefaultProvider, randomBytes, verifyMessage } from 'ethers'
import {
	authenticate,
	decode,
	type ClubsConfiguration,
} from '@devprotocol/clubs-core'

import { getAllPosts, setAllPosts } from '../db'
import type { CommentPrimitives, Comment, Posts } from '../types'

export type AddCommentRequestJson = Readonly<{
	readonly contents: string
	readonly hash: string
	readonly sig: string
	readonly postId: string
}>

export const addCommentHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis',
		dbQueryKey: string,
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { contents, hash, sig, postId } =
			(await request.json()) as AddCommentRequestJson
		if (!contents || !hash || !sig || !postId) {
			return new Response(
				JSON.stringify({
					error: 'Missing data',
				}),
				{
					status: 400,
				},
			)
		}

		try {
			// === COMMENTS ===
			const date = new Date()
			const namespace = uuidv5(conf.url, uuidv5.URL)
			const decodedContents = decode<CommentPrimitives>(contents)
			const newComment: Comment = {
				...decodedContents,
				id: uuidv5(randomBytes(32), namespace),
				created_by: verifyMessage(hash, sig),
				created_at: date,
				updated_at: date,
			}

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
			const newPosts: readonly Posts[] = posts.map((post: Posts) =>
				post.id === postId
					? { ...post, comments: [...post.comments, newComment] }
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
							id: newComment.id,
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
