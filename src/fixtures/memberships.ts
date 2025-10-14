import {
	bytes32Hex,
	membershipVerifierFactory,
	type Membership,
} from '@devprotocol/clubs-core'
import type { Option, OptionsDatabase, Posts } from '..'
import {
	whenDefined,
	whenNotError,
	type UndefinedOr,
} from '@devprotocol/util-ts'
import type { ContractRunner } from 'ethers'

export const filterRequiredMemberships = ({
	post,
	memberships,
}: {
	readonly post: Posts
	readonly memberships: readonly Membership[]
}): readonly Membership[] => {
	const requiredMemberships =
		(post.options?.find(({ key }) => key === 'require-one-of')
			?.value as UndefinedOr<readonly (string | Uint8Array)[]>) ?? []
	const requireAnyOffered =
		(post.options?.find(({ key }) => key === 'require-any-offered')
			?.value as UndefinedOr<boolean>) ?? false

	return requireAnyOffered
		? memberships
		: requiredMemberships
				.map(
					(key) =>
						memberships?.find(
							(mem) => bytes32Hex(mem.payload ?? []) === bytes32Hex(key),
						) ?? [],
				)
				.flat()
}

export const hasWritePermission = async ({
	account,
	provider,
	propertyAddress,
	memberships = [],
	roles,
}: {
	readonly account: string
	readonly provider: ContractRunner
	readonly propertyAddress: string
	readonly memberships?: readonly Membership[]
	readonly roles?: OptionsDatabase['roles']
}): Promise<boolean> => {
	const membershipVerifier = await membershipVerifierFactory({
		provider,
		propertyAddress,
		account,
	}).catch((err: Error) => err)

	const requireMemberships = roles?.write.memberships
		.map((payload) => {
			return memberships
				?.filter(
					(membership) =>
						bytes32Hex(membership.payload ?? []) === bytes32Hex(payload),
				)
				.flat()
		})
		.flat()
		.filter((x) => x !== undefined)

	const verify =
		requireMemberships && requireMemberships.length > 0
			? await whenNotError(membershipVerifier, (verifier) =>
					verifier(requireMemberships),
				)
			: { result: false }

	console.log({ verify })

	return verify instanceof Error ? false : verify.result
}
