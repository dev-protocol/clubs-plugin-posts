import type { Comment, Posts } from '../types'
import {
	getAllPosts as getAllPostsRedis,
	getDefaultClient,
	getPaginatedPosts,
	setAllPosts as setAllPostsRedis,
} from './redis'
import { setComment, setPost } from './redis-documents'

export type GetAllPosts = (opts: {
	readonly key: string
}) => Promise<readonly Posts[] | Error>

export type SetAllPosts = (opts: {
	readonly key: string
	readonly posts: readonly Posts[]
}) => Promise<boolean | Error>

export type SetSinglePost = (opts: {
	readonly key: string
	readonly url: string
	readonly post: Posts
}) => Promise<boolean | Error>

export type SetSingleComment = (opts: {
	readonly key: string
	readonly url: string
	readonly postId: string
	readonly comment: Comment
}) => Promise<boolean | Error>

export const getAllPosts = async (
	opts: {
		readonly key: string
	},
	page?: number,
): Promise<ReturnType<GetAllPosts>> => {
	const client = await getDefaultClient()

	const result = await getPaginatedPosts({
		scope: opts.key,
		client,
		page: page ?? 0,
	})
	await client.quit()
	return result
}

export const setSinglePost = async (opts: {
	readonly key: string
	readonly url: string
	readonly post: Posts
}): Promise<ReturnType<SetSinglePost>> => {
	const client = await getDefaultClient()
	const result = await setPost({
		scope: opts.key,
		url: opts.url,
		post: opts.post,
		client,
	})
	await client.quit()
	return result
}

export const setSingleComment = async (opts: {
	readonly key: string
	readonly url: string
	readonly postId: string
	readonly comment: Comment
}): Promise<ReturnType<SetSingleComment>> => {
	const client = await getDefaultClient()
	const result = await setComment({
		scope: opts.key,
		url: opts.url,
		postId: opts.postId,
		comment: opts.comment,
		client,
	})
	await client.quit()
	return result
}
