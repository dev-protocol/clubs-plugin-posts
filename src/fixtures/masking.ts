import { JsonRpcProvider } from 'ethers'
import type { PostOption, Posts } from '../types'
import {
	membershipVerifierFactory,
	type Membership,
} from '@devprotocol/clubs-core'
import { filterRequiredMemberships } from './memberships'

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

		const verified = user ? (await membershipVerifier(user)).result : false

		return verified ? post : mask(post)
	}
}
