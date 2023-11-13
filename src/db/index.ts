import type { Comment, Posts } from '../types'
import {
	getAllPosts as getAllPostsRedis,
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
): ReturnType<GetAllPosts> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'encoded:redis':
			return getAllPostsRedis(opts)
		case 'documents:redis':
			return []
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
		case 'encoded:redis':
			return setAllPostsRedis(opts)
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
		case 'documents:redis':
			return setPost({
				scope: opts.key,
				url: opts.url,
				post: opts.post,
			})
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
		case 'documents:redis':
			return setComment({
				scope: opts.key,
				url: opts.url,
				postId: opts.postId,
				comment: opts.comment,
			})
		default:
			return new Error('Illegal database type is passed')
	}
}
