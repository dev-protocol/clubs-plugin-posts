import { JsonRpcProvider, ZeroAddress } from 'ethers'
import type { PostOption, Posts } from '../types'
import {
	type UndefinedOr,
	whenDefined,
	whenDefinedAll,
} from '@devprotocol/util-ts'
import { clientsSTokens, client } from '@devprotocol/dev-kit'
import {
	bytes32Hex,
	membershipVerifierFactory,
	type Membership,
} from '@devprotocol/clubs-core'
import pQueue from 'p-queue'

const queue = new pQueue({ concurrency: 3 })

type MaskFactory = (opts: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
	readonly memberships: readonly Membership[]
}) => Promise<(post: Posts) => Posts>

const maskOptions = (options: readonly PostOption[]): readonly PostOption[] => {
	return options
		.map((opt) => (opt.key.startsWith('#') ? undefined : opt))
		.filter((x) => x !== undefined) as readonly PostOption[]
}

export const mask = (post: Posts): Posts => {
	return {
		...post,
		content: '',
		options: maskOptions(post.options),
		comments: post.comments.map((comment) => ({
			...comment,
			options: maskOptions(comment.options),
		})),
		masked: true,
	}
}

export const maskFactory: MaskFactory = async ({
	user,
	propertyAddress,
	rpcUrl,
	memberships,
}: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
	readonly memberships: readonly Membership[]
}) => {
	const provider = new JsonRpcProvider(rpcUrl)
	const sTokens = await whenDefined(user, async () =>
		(([a, b]) => a ?? b)(await clientsSTokens(provider)),
	)
	const isValidProperty = propertyAddress !== ZeroAddress
	const allSTokenIDsUserHave = isValidProperty
		? (await whenDefinedAll([sTokens, user], ([contract, account]) =>
				client.createDetectSTokens(contract)(propertyAddress, account),
			)) ?? []
		: []
	const allMembershipPayloadsUserHave = await Promise.all(
		allSTokenIDsUserHave.map(async (id) => {
			const payload = await queue.add(async () => sTokens?.payloadOf(id))
			return payload
		}),
	)

	return async (post: Posts) => {
		// Do not Mask : post.created_by === user
		if (post.created_by === user) {
			return post
		}

		const requireOneOf =
			(post.options.find((opt) => opt.key === 'require-one-of')
				?.value as UndefinedOr<readonly Uint8Array[]>) ?? []

		const membershipVerifier = await membershipVerifierFactory({
			provider,
			propertyAddress,
			memberships: requireOneOf,
		})

		const verified = user ? membershipVerifier(user) : false

		return verified ? post : mask(post)
	}
}
