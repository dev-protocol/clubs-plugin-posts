import { verifyMessage } from 'ethers'
import {
	type ClubsConfiguration,
	encode,
	type Membership,
} from '@devprotocol/clubs-core'
import {
	whenDefined,
	whenDefinedAll,
	whenNotError,
	whenNotErrorAll,
} from '@devprotocol/util-ts'
import { fetchSinglePost, getDefaultClient } from '../db/redis'
import type { APIRoute } from 'astro'
import { aperture, tryCatch } from 'ramda'
import * as schema from '../constants/redis'
import { maskFactory } from '../fixtures/masking'
import { headers } from '../fixtures/json'
import { uuidToQuery } from '../fixtures/search'
import type { OptionDocument } from '../db/redis-documents'

const AVAILABLE_VALUE = /^[\w#-]+$/
const normalize = (q: string) => q.replaceAll('-', ' ')

/**
 * This can be used to fetch a single Post by ID
 * @param dbQueryKey the scope of the query
 * @param config the ClubsConfiguration
 * @returns a single post
 */
export const fetchPostHas =
	(
		dbQueryKey: string,
		config: ClubsConfiguration,
		memberships: readonly Membership[],
	): APIRoute =>
	async ({ url }: { readonly request: Request; readonly url: URL }) => {
		const pathquery = aperture(2, decodeURIComponent(url.pathname).split('/'))
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
		const safeHasOption =
			whenDefined(hasOption, (q) =>
				AVAILABLE_VALUE.test(q) ? q : new Error('Invalid query'),
			) ?? new Error('Query is required')
		const page = ((n) => (n < 0 ? 0 : n))(parseInt(_page ?? '0'))
		const start = page > 0 ? (page - 1) * limit : 0

		const reader = whenDefinedAll([hash, sig], ([h, s]) =>
			tryCatch(
				([v1, v2]: readonly [string, string]) => verifyMessage(v1, v2),
				(err: Error) => err,
			)([h, s]),
		)

		const query = whenNotError(safeHasOption, (q) =>
			[
				`@${schema._scope['$._scope'].AS}:{${uuidToQuery(dbQueryKey)}}`,
				`@${schema._parent_type['$._parent_type'].AS}:post`,
				`@${schema.key['$.key'].AS}:${normalize(q)}`,
			].join(' '),
		)
		const client = await getDefaultClient()
		const optionsResult =
			(await whenNotError(query, (q) =>
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
				memberships,
			}),
		)

		const results = await whenNotErrorAll([posts, mask], ([data, maskFn]) =>
			Promise.all(data.map(maskFn)),
		)

		return results instanceof Error
			? new Response(
					JSON.stringify({
						error: results.message,
					}),
					{
						status: 500,
						headers,
					},
				)
			: new Response(
					JSON.stringify({
						contents: encode(results),
					}),
					{
						status: 200,
						headers,
					},
				)
	}
