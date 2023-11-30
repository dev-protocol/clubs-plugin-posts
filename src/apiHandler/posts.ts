import { ZeroAddress, getDefaultProvider, verifyMessage } from 'ethers'
import {
	decode,
	type ClubsConfiguration,
	authenticate,
	encode,
} from '@devprotocol/clubs-core'
import type { Comment, PostPrimitives, Reactions } from '../types'
import { whenDefinedAll } from '@devprotocol/util-ts'
import { uuidFactory } from '../db/uuidFactory'
import { addPostEncodedRedis } from './posts-encoded-redis'
import { setPost } from '../db/redis-documents'
import { addPostDocumentsRedis } from './posts-documents-redis'

export type AddCommentRequestJson = Readonly<{
	readonly contents: string
	readonly hash: string
	readonly sig: string
	readonly postId: string
}>

export const addPostHandler =
	(
		conf: ClubsConfiguration,
		dbQueryType: 'encoded:redis' | 'documents:redis',
		dbQueryKey: string,
	) =>
	async ({ request }: { readonly request: Request }) => {
		const { contents, hash, sig } = (await request.json()) as {
			readonly contents: string
			readonly hash?: string
			readonly sig?: string
		}

		if (!hash || !sig) {
			return new Response(
				JSON.stringify({
					error: 'Hash or Signature are missing',
					data: null,
				}),
				{
					status: 400,
				},
			)
		}

		const skipAuthentication = conf.propertyAddress === ZeroAddress

		const authenticated =
			!skipAuthentication &&
			(await whenDefinedAll([hash, sig], ([h, s]) =>
				authenticate({
					message: h,
					signature: s,
					previousConfiguration: encode(conf),
					provider: getDefaultProvider(conf.rpcUrl),
				}),
			))
		// const { randomBytes, recoverAddress, hashMessage } = utils
		const id = uuidFactory(conf.url)()

		const created_by = verifyMessage(hash, sig)

		const now = new Date()
		const created_at = now
		const updated_at = now
		const decodedContents = decode<PostPrimitives>(contents)
		const comments: readonly Comment[] = []
		const reactions: Reactions = {}

		const composed = {
			...decodedContents,
			id,
			created_by,
			created_at,
			updated_at,
			comments,
			reactions,
		}

		if (!authenticated) {
			return new Response(JSON.stringify({ message: 'not allowed' }), {
				status: 401,
			})
		}

		switch (dbQueryType) {
			case 'encoded:redis':
				return addPostEncodedRedis({
					conf,
					data: composed,
					dbQueryKey,
				})
			case 'documents:redis': {
				// return new Response(JSON.stringify({ message: 'not implemented' }))
				return addPostDocumentsRedis({
					conf,
					data: composed,
					dbQueryKey,
				})
			}
			default:
				return new Response(JSON.stringify({ message: 'not implemented' }))
		}
	}
