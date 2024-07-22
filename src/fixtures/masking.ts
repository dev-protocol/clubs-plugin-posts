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

		const verified = hasLimitedAccessMemberships
			? user
				? (([hasMemberships, hasWritableRole]) =>
						hasMemberships || hasWritableRole)(
						await Promise.all([
							(await membershipVerifier?.(requiredMemberships))?.result,
							hasWritePermission({
								account: user,
								provider,
								propertyAddress,
								memberships,
								roles,
							}),
						]),
					)
				: /* when it has requiredMemberships but the user is missed, it's always false  */ false
			: /* when it has no requiredMemberships, it's always true */ true

		return verified ? post : mask(post)
	}
}
