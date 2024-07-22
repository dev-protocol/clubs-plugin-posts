import { JsonRpcProvider } from 'ethers'
import type { OptionsDatabase, PostOption, Posts } from '../types'
import {
	membershipVerifierFactory,
	type Membership,
	bytes32Hex,
} from '@devprotocol/clubs-core'
import { filterRequiredMemberships, hasWritePermission } from './memberships'
import { whenDefined } from '@devprotocol/util-ts'

type MaskFactory = (opts: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
	readonly memberships: readonly Membership[]
	readonly roles?: OptionsDatabase['roles']
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
	roles,
}: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
	readonly memberships: readonly Membership[]
	readonly roles?: OptionsDatabase['roles']
}) => {
	const provider = new JsonRpcProvider(rpcUrl)

	const membershipVerifier = await whenDefined(user, (account) =>
		membershipVerifierFactory({
			provider,
			propertyAddress,
			account,
		}),
	)

	return async (post: Posts) => {
		// Do not Mask : post.created_by === user
		if (post.created_by === user) {
			return post
		}

		const requiredMemberships = filterRequiredMemberships({
			post,
			memberships: [...memberships],
		})

		// limited_access_status
		const hasLimitedAccessMemberships = requiredMemberships.length > 0

		// don't mask if the post isn't having limited access memberships
		if (!hasLimitedAccessMemberships) {
			return post
		}

		if (!user) {
			return mask(post)
		}

		const hasWritableMemberships = await hasWritePermission({
			account: user,
			provider,
			propertyAddress,
			memberships,
			roles,
		})

		// don't mask if it has write permission
		if (hasWritableMemberships) {
			return post
		}

		// mask if user doesn't connect to wallet
		if (membershipVerifier === undefined) {
			return mask(post)
		}

		const membershipVerifierResult = (
			await membershipVerifier(requiredMemberships)
		).result
		if (!membershipVerifierResult) {
			return mask(post)
		}

		return post
	}
}
