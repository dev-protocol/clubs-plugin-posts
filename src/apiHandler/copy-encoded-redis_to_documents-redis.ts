import { type ClubsConfiguration } from '@devprotocol/clubs-core'
import { isNotError, whenNotErrorAll } from '@devprotocol/util-ts'
import { getAllPosts } from '../db'
import { getDefaultClient, type RedisDefaultClient } from '../db/redis'
import { generatePrefixOf, setPost } from '../db/redis-documents'
import { Prefix } from '../constants/redis'
import { always } from 'ramda'

const deleteExistingRecords = async (
	client: RedisDefaultClient,
	prefix: Prefix,
	scope: string,
) => {
	// eslint-disable-next-line functional/no-loop-statement
	for await (const key of client.scanIterator({
		MATCH: `${generatePrefixOf(prefix, scope)}:*`,
		COUNT: 100,
	})) {
		// eslint-disable-next-line functional/no-expression-statement
		client.del(key).then(always(console.log('deleted', key)))
	}
	return { result: 'OK', prefix, scope }
}

export const copyPostFromEncodedRedisToDocumentsRedisHandler =
	({
		config,
		srcDatabaseKey,
		distDatabaseKey: scope,
	}: {
		readonly config: ClubsConfiguration
		readonly srcDatabaseKey: string
		readonly distDatabaseKey: string
	}) =>
	async ({ request }: { readonly request: Request }) => {
		const allPosts = await getAllPosts('encoded:redis', {
			key: srcDatabaseKey,
		}).catch((err: any) => new Error(err))

		const client = await getDefaultClient()

		const deleted = await Promise.all([
			deleteExistingRecords(client, Prefix.Comment, scope),
			deleteExistingRecords(client, Prefix.Option, scope),
			deleteExistingRecords(client, Prefix.Post, scope),
			deleteExistingRecords(client, Prefix.Reaction, scope),
		])

		const copied = await whenNotErrorAll([allPosts, deleted], ([posts]) =>
			Promise.all(
				posts.map((post) =>
					setPost({
						post,
						scope,
						url: config.url,
						client,
					})
						.then((result) => ({ result, post }))
						.catch((result: Error) => ({ result, post })),
				),
			),
		)

		const finish = await client.quit().catch((err: Error) => err)

		const result = whenNotErrorAll([copied, finish], ([res]) => res)

		return isNotError(result)
			? new Response(
					JSON.stringify({
						data: result,
						message: 'Success',
					}),
					{ status: 200 },
				)
			: new Response(
					JSON.stringify({
						data: result,
						message: result.message,
					}),
					{ status: 400 },
				)
	}
