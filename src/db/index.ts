import type { Posts } from '../types'
import {
	getAllPosts as getAllPostsRedis,
	setAllPosts as setAllPostsRedis,
} from './redis'

export type GetAllPosts = (opts: {
	readonly key: string
}) => Promise<readonly Posts[] | Error>

export type SetAllPosts = (opts: {
	readonly key: string
	readonly posts: readonly Posts[]
}) => Promise<boolean | Error>

export const getAllPosts = async (
	type: 'encoded:redis',
	opts: {
		readonly key: string
	}
): ReturnType<GetAllPosts> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'encoded:redis':
			return getAllPostsRedis(opts)
		default:
			return new Error('Illegal database type is passed')
	}
}

export const setAllPosts = async (
	type: 'encoded:redis',
	opts: {
		readonly key: string
		readonly posts: readonly Posts[]
	}
): ReturnType<SetAllPosts> => {
	// eslint-disable-next-line functional/no-conditional-statement
	switch (type) {
		case 'encoded:redis':
			return setAllPostsRedis(opts)
		default:
			return new Error('Illegal database type is passed')
	}
}
