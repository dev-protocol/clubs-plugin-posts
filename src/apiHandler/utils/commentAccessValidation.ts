import { getDefaultProvider, hashMessage, recoverAddress } from 'ethers'
import {
	authenticate,
	encode,
	type ClubsConfiguration,
} from '@devprotocol/clubs-core'

export const canDeleteComment = async (
	config: ClubsConfiguration,
	postOwner: string,
	commentOwner: string,
	hash: string,
	sig: string,
) => {
	// Get who is sending request.
	const requestSenderAddress = recoverAddress(hashMessage(hash), sig)

	// Comment owner can delete.
	if (commentOwner === requestSenderAddress) {
		return true
	}

	// Post owner can delete.
	if (postOwner === requestSenderAddress) {
		return true
	}

	// Club admin.
	const isAuthenticated = await authenticate({
		message: hash,
		signature: sig,
		previousConfiguration: encode(config),
		provider: getDefaultProvider(config.rpcUrl),
	})
	if (isAuthenticated) {
		return true
	}

	return false
}
