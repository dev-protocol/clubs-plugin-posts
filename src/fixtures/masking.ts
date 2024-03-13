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
import { filterRequiredMemberships } from './memberships'

const queue = new pQueue({ concurrency: 3 })

type MaskFactory = (opts: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
	readonly memberships: readonly Membership[]
}) => Promise<(post: Posts) => Promise<Posts>>

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

	return async (post: Posts) => {
		// Do not Mask : post.created_by === user
		if (post.created_by === user) {
			return post
		}

		const requiredMemberships = filterRequiredMemberships({
			post,
			memberships: [...memberships],
		})

		const membershipVerifier = await membershipVerifierFactory({
			provider,
			propertyAddress,
			memberships: requiredMemberships,
		})

		const verified = user ? membershipVerifier(user) : false

		return verified ? post : mask(post)
	}
}
