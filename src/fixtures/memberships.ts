import { bytes32Hex, type Membership } from '@devprotocol/clubs-core'
import type { Posts } from '..'
import type { UndefinedOr } from '@devprotocol/util-ts'

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
	return requiredMemberships
		.map(
			(key) =>
				memberships?.find(
					(mem) => bytes32Hex(mem.payload ?? []) === bytes32Hex(key),
				) ?? [],
		)
		.flat()
}
