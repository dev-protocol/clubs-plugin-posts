import { encode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import { getAllPosts, setAllPosts } from '../db'
import type { Posts } from '../types'
import { whenDefinedAll } from '@devprotocol/util-ts'

export const addPostEncodedRedis = async ({
	conf,
	data,
	dbQueryKey,
}: {
	readonly conf: ClubsConfiguration
	readonly data: Posts
	readonly dbQueryKey: string
}) => {
	try {
		const allPosts = await getAllPosts('encoded:redis', { key: dbQueryKey })

		const merged =
			allPosts && !(allPosts instanceof Error) ? [data, ...allPosts] : []

		const saved = await setAllPosts('encoded:redis', {
			key: dbQueryKey,
			posts: merged,
		})

		return saved instanceof Error
			? new Response(
					JSON.stringify({
						error: saved,
						data: null,
					}),
					{
						status: 500,
					},
			  )
			: saved
			  ? new Response(
						JSON.stringify({
							message: saved,
							data: encode(data),
						}),
						{
							status: 200,
						},
			    )
			  : new Response(
						JSON.stringify({
							error: 'Some data is missing',
							data: null,
						}),
						{
							status: 400,
						},
			    )
	} catch (e: any) {
		return new Response(
			JSON.stringify({
				error: e.message,
				data: null,
			}),
			{
				status: 500,
			},
		)
	}
}
