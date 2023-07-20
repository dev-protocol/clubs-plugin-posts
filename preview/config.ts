import { encode } from '@devprotocol/clubs-core'
import { ZeroAddress, toUtf8Bytes } from 'ethers'
import { v5 as uuidv5 } from 'uuid'
import type { OptionsDatabase } from '../src/types'

const payloads: readonly Uint8Array[] = [
	toUtf8Bytes('tier-1'),
	toUtf8Bytes('tier-2'),
	toUtf8Bytes('tier-3'),
]

export default () =>
	encode({
		name: 'Debug',
		twitterHandle: '@debug',
		description: '',
		url: '',
		propertyAddress: ZeroAddress,
		chainId: 137,
		rpcUrl: 'https://polygon-rpc.com/',
		adminRolePoints: 50,
		plugins: [
			{
				id: 'example-theme',
				options: [],
			},
			{
				id: 'clubs-plugin-posts',
				options: [
					{
						key: 'database',
						value: {
							type: 'encoded:redis',
							key: `posts::${uuidv5(
								toUtf8Bytes('EXAMPLE'),
								uuidv5('EXAMPLE_NAMESPACE', uuidv5.URL),
							)}`, // > posts::694666bb-b2ec-542b-a5d6-65b470e5c494
						},
					} as OptionsDatabase,
				],
			},
			{
				id: 'devprotocol:clubs:simple-memberships',
				options: [
					{
						key: 'memberships',
						value: [
							{
								id: 'tier-3',
								name: 'Tier 3',
								description: 'lorem ipsum',
								price: 3,
								currency: 'ETH',
								imageSrc: 'https://i.imgur.com/wwJ2rBf.png',
								payload: payloads[2],
							},
							{
								id: 'tier-2',
								name: 'Tier 2',
								description: 'lorem ipsum',
								price: 2,
								currency: 'ETH',
								imageSrc: 'https://i.imgur.com/YaNNZ2F.png',
								payload: payloads[1],
							},
							{
								id: 'tier-1',
								name: 'Tier 1',
								description: 'lorem ipsum',
								price: 1,
								currency: 'ETH',
								imageSrc: 'https://i.imgur.com/sznqcmL.png',
								payload: payloads[0],
							},
						],
					},
				],
			},
		],
	})
