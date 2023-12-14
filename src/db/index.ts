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
	type: 'encoded:redis' | 'documents:redis',
	opts: {
		readonly key: string
	},
	page?: number,
): ReturnType<GetAllPosts> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'encoded:redis': {
			const client = await getDefaultClient()
			const result = await getAllPostsRedis({ ...opts, client })
			// eslint-disable-next-line functional/no-expression-statement
			await client.quit()
			return result
		}
		case 'documents:redis': {
			// eslint-disable-next-line no-case-declarations
			const client = await getDefaultClient()
			// eslint-disable-next-line no-case-declarations
			const result = await getPaginatedPosts({
				scope: opts.key,
				client,
				page: page ?? 0,
			})
			// eslint-disable-next-line functional/no-expression-statement
			await client.quit()
			return result
		}
		default:
			return new Error('Illegal database type is passed')
	}
}

export const setAllPosts = async (
	type: 'encoded:redis',
	opts: {
		readonly key: string
		readonly posts: readonly Posts[]
	},
): ReturnType<SetAllPosts> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'encoded:redis': {
			const client = await getDefaultClient()
			const result = await setAllPostsRedis({ ...opts, client })
			// eslint-disable-next-line functional/no-expression-statement
			await client.quit()
			return result
		}
		default:
			return new Error('Illegal database type is passed')
	}
}

export const setSinglePost = async (
	type: 'documents:redis',
	opts: {
		readonly key: string
		readonly url: string
		readonly post: Posts
	},
): ReturnType<SetSinglePost> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'documents:redis': {
			const client = await getDefaultClient()
			const result = await setPost({
				scope: opts.key,
				url: opts.url,
				post: opts.post,
				client,
			})
			// eslint-disable-next-line functional/no-expression-statement
			await client.quit()
			return result
		}
		default:
			return new Error('Illegal database type is passed')
	}
}

export const setSingleComment = async (
	type: 'documents:redis',
	opts: {
		readonly key: string
		readonly url: string
		readonly postId: string
		readonly comment: Comment
	},
): ReturnType<SetSingleComment> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'documents:redis': {
			const client = await getDefaultClient()
			const result = await setComment({
				scope: opts.key,
				url: opts.url,
				postId: opts.postId,
				comment: opts.comment,
				client,
			})
			// eslint-disable-next-line functional/no-expression-statement
			await client.quit()
			return result
		}
		default:
			return new Error('Illegal database type is passed')
	}
}
