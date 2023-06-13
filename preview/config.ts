import { encode } from '@devprotocol/clubs-core'
import dayjs from 'dayjs'
import { constants, utils } from 'ethers'
import { v5 as uuidv5 } from 'uuid'
import type { OptionsDatabase } from '../src/types'

const payloads: readonly Uint8Array[] = [
	utils.toUtf8Bytes('tier-1'),
	utils.toUtf8Bytes('tier-2'),
	utils.toUtf8Bytes('tier-3'),
]

export default () =>
	encode({
		name: 'Debug',
		twitterHandle: '@debug',
		description: '',
		url: '',
		propertyAddress: constants.AddressZero,
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
								utils.toUtf8Bytes('EXAMPLE'),
								uuidv5('EXAMPLE_NAMESPACE', uuidv5.URL)
							)}`, // > posts::694666bb-b2ec-542b-a5d6-65b470e5c494
						},
					} as OptionsDatabase,
					{
						key: 'posts',
						value: [
							{
								id: '1',
								title: 'Hello World',
								content: 'This is a sample post.',
								created_by: '0x00000000',
								created_at: dayjs('2021-01-01').toString(),
								updated_at: dayjs('2021-01-01').toString(),
								options: [
									{
										key: '#images',
										value: [
											'https://source.unsplash.com/800x400/?nature',
											'https://source.unsplash.com/800x400/?water',
											'https://source.unsplash.com/800x400/?sky',
										],
									},
									{
										key: 'require-one-of',
										value: [payloads[0], payloads[1], payloads[2]],
									},
								],
								comments: [],
								reactions: [],
							},
							{
								id: '2',
								title: 'Hello World',
								content: 'This is a sample post.',
								created_by: '0x00000000',
								created_at: dayjs('2021-01-01').toString(),
								updated_at: dayjs('2021-01-01').toString(),
								options: [
									{
										key: '#images',
										value: [
											'https://source.unsplash.com/800x400/?nature',
											'https://source.unsplash.com/800x400/?water',
											'https://source.unsplash.com/800x400/?sky',
										],
									},
								],
								comments: [
									{
										id: '1',
										content: 'This is a sample comment #1.',
										created_by: '0x00000000',
										created_at: dayjs('2021-01-01').toString(),
										updated_at: dayjs('2021-01-01').toString(),
									},
									{
										id: '2',
										content: 'This is a sample comment #2.',
										created_by: '0x00000000',
										created_at: dayjs('2021-01-11').toString(),
										updated_at: dayjs('2021-01-11').toString(),
									},
								],
								reactions: [],
							},
							{
								id: '3',
								title: 'Hi there',
								content: 'Good morning. This is a sample post.',
								created_by: '0x00000000',
								created_at: dayjs('2021-02-01').toString(),
								updated_at: dayjs('2021-02-01').toString(),
								options: [
									{
										key: '#images',
										value: [
											'https://source.unsplash.com/800x400/?nature',
											'https://source.unsplash.com/800x400/?water',
										],
									},
								],
								comments: [
									{
										id: '1',
										content: 'This is a sample comment.',
										created_by: '0x00000000',
										created_at: dayjs('2021-01-01').toString(),
										updated_at: dayjs('2021-01-01').toString(),
									},
								],
								reactions: [],
							},
							{
								id: '4',
								title: 'Hey guys',
								content: 'Good evening. This is a sample post.',
								created_by: '0x00000000',
								created_at: dayjs('2021-03-01').toString(),
								updated_at: dayjs('2021-03-01').toString(),
								options: [
									{
										key: '#images',
										value: ['https://source.unsplash.com/800x400/?nature'],
									},
								],
								comments: [
									{
										id: '1',
										content: 'This is a sample comment.',
										created_by: '0x00000000',
										created_at: dayjs('2021-01-01').toString(),
										updated_at: dayjs('2021-01-01').toString(),
									},
								],
								reactions: [],
							},
						],
					},
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
