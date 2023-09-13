import { JsonRpcProvider, ZeroAddress, keccak256 } from 'ethers'
import type { PostOption, Posts } from '../types'
import {
	type UndefinedOr,
	whenDefined,
	whenDefinedAll,
} from '@devprotocol/util-ts'
import { clientsSTokens, client } from '@devprotocol/dev-kit'

type MaskFactory = (opts: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
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
}: {
	readonly user?: string
	readonly propertyAddress: string
	readonly rpcUrl: string
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
			const payload = await sTokens?.payloadOf(id)
			return payload
		}),
	)

	return (post: Posts) => {
		const requireOneOf =
			(post.options.find((opt) => opt.key === 'require-one-of')
				?.value as UndefinedOr<readonly Uint8Array[]>) ?? []
		const requiredPayloads = requireOneOf.map((v) =>
			keccak256(new Uint8Array([...v])),
		)
		const verified =
			requiredPayloads.length > 0
				? requiredPayloads.some((payload) =>
						allMembershipPayloadsUserHave.includes(payload),
				  )
				: true

		return verified ? post : mask(post)
	}
}
