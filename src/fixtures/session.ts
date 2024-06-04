/* eslint-disable functional/no-expression-statement */
import { type UndefinedOr } from '@devprotocol/util-ts'
import { type Signer } from 'ethers'
import { encode, decode } from '@devprotocol/clubs-core'
import { verifyMessage } from 'ethers'

const maxValidity = 1 * 60 * 60 * 1000 // 1 hour

export const getMessage = (connectedAddress: string) => {
	const maths = Math.floor(Date.now() / maxValidity) * maxValidity
	return `Sign in as ${connectedAddress} to access post(s) interactions @ts${maths}`
}

export const getSignature = async (
	connectedAddress: string,
	signer: UndefinedOr<Signer>,
) => {
	if (!signer) return undefined

	const sigKey = `sig-of-${connectedAddress}`
	const hashKey = `hash-of-${connectedAddress}`

	const message = getMessage(connectedAddress)
	const currentHash = message

	const storedHash = sessionStorage.getItem(hashKey)
	// eslint-disable-next-line functional/no-let
	let sig = sessionStorage.getItem(sigKey)

	if (!sig || storedHash !== currentHash) {
		if (storedHash && storedHash !== currentHash) {
			alert('Session Expired! Sign again to reactivate the session.')
		}
		// Sign the message if signature is not present or hash has changed
		sig = encode(await signer.signMessage(message))
		sessionStorage.setItem(sigKey, sig)
		sessionStorage.setItem(hashKey, currentHash)
	}
	return decode(sig) as string
}

export const getSessionAddress = async (hash: string, sig: string) => {
	const address = verifyMessage(hash, sig)
	return address
}

export const consoleWarn = () => {
	console.log('%cWarning!!', 'color: red; font-size: 20px; background: yellow;')
	console.log(
		'%cDo not enter any code or instructions here unless you understand them and know they are safe. If you have been instructed to paste something here to enable a hidden feature or fix an issue, it is likely a scam that could harm your account or compromise your personal data.',
		'font-size: 20px;',
	)
	return null
}
