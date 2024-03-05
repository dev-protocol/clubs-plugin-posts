import { ZeroAddress, getDefaultProvider, verifyMessage } from 'ethers'
import {
	decode,
	type ClubsConfiguration,
	authenticate,
	encode,
} from '@devprotocol/clubs-core'
import type { Comment, PostPrimitives, Reactions } from '../types'
import {
	whenDefined,
	whenDefinedAll,
	whenNotError,
	whenNotErrorAll,
	type ErrorOr,
} from '@devprotocol/util-ts'
import { uuidFactory } from '../db/uuidFactory'
import { addPostEncodedRedis } from './posts-encoded-redis'
import { addPostDocumentsRedis } from './posts-documents-redis'
import { fetchSinglePost, getDefaultClient } from '../db/redis'
import { Prefix } from '../constants/redis'
import { deletePost, type OptionDocument } from '../db/redis-documents'
import type { APIRoute } from 'astro'
import { aperture, tryCatch } from 'ramda'
import * as schema from '../constants/redis'
import { maskFactory } from '../fixtures/masking'

const REG_ALL_SYMBOL = /[\W_]/
const sanitize = (q: string) =>
	q
		.split('')
		.map((s) => (REG_ALL_SYMBOL.test(s) ? `\\${s}` : s))
		.join('')

/**
 * This can be used to fetch a single Post by ID
 * @param dbQueryKey the scope of the query
 * @param config the ClubsConfiguration
 * @returns a single post
 */
export const fetchPostHas =
	(dbQueryKey: string, config: ClubsConfiguration): APIRoute =>
	async ({ url }: { readonly request: Request; readonly url: URL }) => {
		const pathquery = aperture(2, url.pathname.split('/'))
		const [, hasOption] = pathquery.find(([key]) => key === 'has:option') ?? []
		const limit = 10
		const { hash, sig, _page } = {
			hash: url.searchParams.get('hash'),
			sig: url.searchParams.get('sig'),
			_page: url.searchParams.get('page'),
		} as {
			readonly hash?: string
			readonly sig?: string
			readonly _page?: string
		}
		const page = parseInt(_page ?? '0')
		const start = (page - 1) * limit

		const reader = whenDefinedAll([hash, sig], ([h, s]) =>
			tryCatch(
				([v1, v2]: readonly [string, string]) => verifyMessage(v1, v2),
				(err: Error) => err,
			)([h, s]),
		)

		const query = whenDefined(hasOption, (q) =>
			[
				`@${schema._scope['$._scope'].AS}:{${dbQueryKey}}`,
				`@${schema._parent_type['$._parent_type'].AS}:post`,
				`@${schema.key['$.key'].AS}:${sanitize(q)}`,
			].join(' '),
		)
		const client = await getDefaultClient()
		const optionsResult =
			(await whenDefined(query, (q) =>
				client.ft
					.search(schema.Index.Option, q, {
						LIMIT: {
							from: start,
							size: limit,
						},
					})
					.catch((err: Error) => err),
			)) ?? new Error('Qeury is required')

		const posts = await whenNotError(optionsResult, (opts) =>
			Promise.all(
				opts.documents
					.map((opt) => opt.value)
					.filter((opt): opt is OptionDocument => opt !== null)
					.map((opt) => fetchSinglePost({ id: opt._parent_id, client })),
			),
		)

		const mask = await whenNotError(reader, (user) =>
			maskFactory({
				user,
				propertyAddress: config.propertyAddress,
				rpcUrl: config.rpcUrl,
			}),
		)

		const results = whenNotErrorAll([posts, mask], ([data, maskFn]) =>
			data.map(maskFn),
		)

		return results instanceof Error
			? new Response(
					JSON.stringify({
						error: results,
					}),
					{
						status: 500,
					},
				)
			: new Response(
					JSON.stringify({
						contents: encode(results),
					}),
					{
						status: 200,
					},
				)
	}
