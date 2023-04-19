import { encode } from '@devprotocol/clubs-core'

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
					{ key: 'posts', value: [
							{
								id: '1',
								title: 'Hello World',
								content: 'This is a sample post.',
								created_by: '0x00000000',
								created_at: '2021-01-01T00:00:00Z',
								updated_at: '2021-01-01T00:00:00Z',
								options: [
									{
										key: '#images',
										value: [
											'https://source.unsplash.com/800x400/?nature',
											'https://source.unsplash.com/800x400/?water',
											'https://source.unsplash.com/800x400/?sky'
										]
									}
								],
								comments: [
									{
										id: '1',
										content: 'This is a sample comment.',
										created_by: '0x00000000',
										created_at: '2021-01-01T00:00:00Z',
										updated_at: '2021-01-01T00:00:00Z',
									}
								],
								reactions: [],
							}
						] },
				],
			},
		],
	})
