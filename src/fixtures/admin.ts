import { clientsProperty } from '@devprotocol/dev-kit'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { type ContractRunner, type Signer } from 'ethers'
import { type ClubsConfiguration } from '@devprotocol/clubs-core'

const MULTIPLY = 1000000n

export const hasAdminRole = async (
	user: string,
	config: ClubsConfiguration,
	provider: ContractRunner,
): Promise<boolean> => {
	const [a, b] = await clientsProperty(provider, config.propertyAddress)

	const [balance, totalSupply] = await Promise.all([
		whenDefined(a ?? b, (client) => client.balanceOf(user)),
		whenDefined(a ?? b, (client) => client.totalSupply()),
	])

	const share =
		(BigInt(balance ?? 0) * MULTIPLY) /
		BigInt(totalSupply ?? '10000000000000000000000000')

	const expected = (BigInt(config.adminRolePoints) * MULTIPLY) / 100n

	return share >= expected
}
