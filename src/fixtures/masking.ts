import { JsonRpcProvider, ZeroAddress, keccak256 } from 'ethers'
import type { PostOption, Posts } from '../types'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { clientsSTokens, client } from '@devprotocol/dev-kit'

type MaskFactory = (
	user: string,
	propertyAddress: string,
	rpcUrl: string,
) => Promise<(post: Posts) => Posts>

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
	}
}

export const maskFactory: MaskFactory = async (
	user: string,
	propertyAddress: string,
	rpcUrl: string,
) => {
	const provider = new JsonRpcProvider(rpcUrl)
	const [c1, c2] = await clientsSTokens(provider)
	const sTokens = c1 ?? c2
	const isValidProperty = propertyAddress !== ZeroAddress
	const allSTokenIDsUserHave = isValidProperty
		? (await whenDefined(sTokens, (contract) =>
				client.createDetectSTokens(contract)(propertyAddress, user),
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
		const requiredPayloads = requireOneOf.map(keccak256)

		const verified = requiredPayloads.some((payload) =>
			allMembershipPayloadsUserHave.includes(payload),
		)

		return verified ? post : mask(post)
	}
}
