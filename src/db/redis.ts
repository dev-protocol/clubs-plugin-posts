/* eslint-disable functional/no-expression-statement */
import { decode, encode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'
import { createClient } from 'redis'
import type { Comment, PostOption, Posts, Reactions } from '../types'
import { Index } from '../constants/redis'
import {
	fetchAllOptions,
	fetchAllReactions,
	fetchComments,
	type PostDocument,
	type PostRawDocument,
	type ReactionDocument,
} from './redis-documents'
import { reduceBy } from 'ramda'

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

	const fetchPosts = await client.ft.search(Index.Post, '*', {
		LIMIT: { from: page, size: limit },
	})

	const posts: readonly PostRawDocument[] = fetchPosts.documents
		// JSON parse each post
		.map((post) => post.value as PostDocument)
		// filter out null values from the array
		.filter((post): post is PostDocument => post !== null)
		// decode post data (get post data without document db related keys)
		.map(({ _raw }) => decode<PostRawDocument>(_raw))

	/**
	 * Create fetch promises for each post
	 */
	const fetchCommentsPromises = posts.map(async (post) => {
		const comments = await fetchComments({ scope, postId: post.id, client })
		const options = await Promise.all(
			comments.map((comment) =>
				fetchAllOptions({
					scope,
					parentType: 'comment',
					parentId: comment.id,
					client,
				}),
			),
		)
		const commentsWithOpts = comments.map((comment, i) => ({
			...comment,
			options: options[i],
		}))
		// decode each comment data (get comment data without document db related keys)
		return commentsWithOpts.map(({ _raw, options }) => ({
			...decode<Comment>(_raw),
			options: options.map(({ _raw: _rawOpt }) => decode<PostOption>(_rawOpt)),
		}))
	})

	/**
	 * Create fetch options promises for each post
	 */
	const fetchOptionsPromises = posts.map(async (post) => {
		const options = await fetchAllOptions({
			scope,
			parentType: 'post',
			parentId: post.id,
			client,
		})
		// decode each option data
		return options.map(({ _raw }) => decode<PostOption>(_raw))
	})

	/**
	 * Create fetch reactions promises for each post
	 */
	const fetchReactionsPromises: readonly Promise<Reactions>[] = posts.map(
		async (post) => {
			const reactions = await fetchAllReactions({
				scope,
				postId: post.id,
				client,
			})
			const groupCreatedBy = (
				acc: readonly string[],
				{ created_by }: ReactionDocument,
			) => acc.concat(created_by)
			const toEmoji = ({ content }: ReactionDocument) => content
			return reduceBy(groupCreatedBy, [], toEmoji, reactions)
		},
	)

	/**
	 * Fetch all comments/options/reactoins for each post
	 */
	const [postsComments, postsOptions, postsReactions] = await Promise.all([
		Promise.all(fetchCommentsPromises),
		Promise.all(fetchOptionsPromises),
		Promise.all(fetchReactionsPromises),
	])

	/**
	 * Map the comments to the posts
	 */
	const results = posts.map((post, index) => ({
		...post,
		comments: postsComments[index],
		options: postsOptions[index],
		reactions: postsReactions[index],
	}))

	return results
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
