/* eslint-disable functional/no-expression-statement */
import { decode, encode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'
import { createClient } from 'redis'
import type { Posts } from '../types'
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
