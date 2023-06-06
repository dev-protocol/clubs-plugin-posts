import { encode } from '@devprotocol/clubs-core'
import dayjs from 'dayjs';

export default () =>
	encode({
		name: 'Debug',
		twitterHandle: '@debug',
		description: '',
		url: '',
		propertyAddress: '',
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
								id: '2',
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
								id: '1',
								title: 'Hey guys',
								content: 'Good evening. This is a sample post.',
								created_by: '0x00000000',
								created_at: dayjs('2021-03-01').toString(),
								updated_at: dayjs('2021-03-01').toString(),
								options: [
									{
										key: '#images',
										value: [
											'https://source.unsplash.com/800x400/?nature',
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
						],
					},
				],
			},
		],
	})
