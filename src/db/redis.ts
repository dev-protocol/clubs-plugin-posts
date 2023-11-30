/* eslint-disable functional/no-expression-statement */
import { decode, encode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'
import { createClient } from 'redis'
import type { Comment, Posts } from '../types'
import { Prefix } from '../constants/redis'
import { fetchComments, type PostDocument } from './redis-documents'
// import { examplePosts } from '../constants/example-posts'

const defaultClient = createClient({
	url: import.meta.env.REDIS_URL,
	username: import.meta.env.REDIS_USERNAME ?? '',
	password: import.meta.env.REDIS_PASSWORD ?? '',
	socket: {
		keepAlive: 1,
		reconnectStrategy: 1,
	},
})

export type RedisDefaultClient = typeof defaultClient

export const getDefaultClient = async () => {
	if (defaultClient.isOpen === false) {
		await defaultClient.connect()
	}
	return defaultClient
}

export const getAllPosts = async ({
	key,
	client,
}: {
	readonly key: string
	readonly client: RedisDefaultClient
}) => {
	try {
		const encodedData = await client.get(key)
		const decodedData = whenDefined(encodedData, (d) =>
			decode<readonly Posts[]>(d),
		)
		return decodedData
			? decodedData // examplePosts
			: []
	} catch (e) {
		return e as Error
	}
}

/**
 * Fetches the paginated posts from Redis
 * @param scope - The scope of the posts
 * @param client - The Redis client
 * @param page - The page number
 * @returns The paginated posts
 */
export const getPaginatedPosts = async ({
	scope,
	client,
	page,
}: {
	readonly scope: string
	readonly client: RedisDefaultClient
	readonly page: number
}): Promise<readonly Posts[]> => {
	const limit = 10

	const fetchPostKeys = await client.keys(`${Prefix.Post}:${scope}:*`)
	const slicedPostKeys = fetchPostKeys.slice(page * limit, (page + 1) * limit)
	const fetchPosts = await client.mGet(slicedPostKeys)

	const posts: readonly Posts[] = fetchPosts
		// JSON parse each post
		.map((post) => (post ? (JSON.parse(post) as PostDocument) : null))
		// filter out null values from the array
		.filter((post): post is PostDocument => post !== null)
		// decode post data (get post data without document db related keys)
		.map(({ _raw }) => decode<Posts>(_raw))

	/**
	 * Create fetch promises for each post
	 */
	const fetchCommentsPromises = posts.map(async (post) => {
		const list = await fetchComments({ scope, postId: post.id, client })
		// decode each comment data (get comment data without document db related keys)
		return list.map(({ _raw }) => decode<Comment>(_raw))
	})

	/**
	 * Fetch all comments for each post
	 */
	const postsComments = await Promise.all(fetchCommentsPromises)

	/**
	 * Map the comments to the posts
	 */
	const postsWithComments = posts.map((post, index) => ({
		...post,
		comments: postsComments[index],
	}))

	return postsWithComments
}

export const setAllPosts = async ({
	key,
	posts,
	client,
}: {
	readonly key: string
	readonly posts: readonly Posts[]
	readonly client: RedisDefaultClient
}) => {
	const encodedData = encode<readonly Posts[]>(posts)
	await client.set(key, encodedData)

	return true
}
