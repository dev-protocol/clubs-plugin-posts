/* eslint-disable functional/no-expression-statement */
import type { GetAllPosts, SetAllPosts } from '.'
import { decode, encode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'
import { createClient } from 'redis'
import type { Posts } from '../types'
import { examplePosts } from '../constants/example-posts'

const client = createClient({
	url: import.meta.env.REDIS_URL,
	username: import.meta.env.REDIS_USERNAME ?? '',
	password: import.meta.env.REDIS_PASSWORD ?? '',
	socket: {
		keepAlive: 1,
		reconnectStrategy: 1,
	},
})

export const getAllPosts: GetAllPosts = async ({ key }) => {
	await client.connect()

	const encodedData = await client.get(key)
	const decodedData = whenDefined(encodedData, (d) =>
		decode<readonly Posts[]>(d),
	)

	await client.quit()

	return key === 'posts::694666bb-b2ec-542b-a5d6-65b470e5c494'
		? examplePosts
		: decodedData
		? decodedData
		: new Error('Data not found')
}

export const setAllPosts: SetAllPosts = async ({ key, posts }) => {
	await client.connect()

	const encodedData = encode<readonly Posts[]>(posts)
	await client.set(key, encodedData)
	await client.quit()

	return true
}
