import { ZeroAddress, toUtf8Bytes } from 'ethers'
import type { Posts } from '../types'

export const examplePosts: readonly Posts[] = [
	{
		id: '1',
		title: 'Hello World',
		content: 'This is a sample post.',
		created_by: ZeroAddress,
		created_at: new Date('2021-01-01T01:34:56Z'),
		updated_at: new Date('2021-01-01T01:34:56Z'),
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
				value: [
					[toUtf8Bytes('tier-1'), toUtf8Bytes('tier-2'), toUtf8Bytes('tier-3')],
				],
			},
		],
		comments: [],
	},
	{
		id: '2',
		title: 'Hello World',
		content: 'This is a sample post.',
		created_by: ZeroAddress,
		created_at: new Date('2021-01-01T01:34:56Z'),
		updated_at: new Date('2021-01-01T01:34:56Z'),
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
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			{
				id: '2',
				content: 'This is a sample comment #2.',
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
		],
	},
	{
		id: '3',
		title: 'Hi there',
		content: 'Good morning. This is a sample post.',
		created_by: ZeroAddress,
		created_at: new Date('2021-01-01T01:34:56Z'),
		updated_at: new Date('2021-01-01T01:34:56Z'),
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
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
		],
	},
	{
		id: '4',
		title: 'Hey guys',
		content: 'Good evening. This is a sample post.',
		created_by: ZeroAddress,
		created_at: new Date('2021-01-01T01:34:56Z'),
		updated_at: new Date('2021-01-01T01:34:56Z'),
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
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
		],
	},
	{
		id: '5',
		title: 'Secret',
		content: 'Good evening. This is a sample secret pos...',
		created_by: ZeroAddress,
		created_at: new Date('2021-01-01T01:34:56Z'),
		updated_at: new Date('2021-01-01T01:34:56Z'),
		options: [
			{
				key: 'require-one-of',
				value: [
					[toUtf8Bytes('tier-1'), toUtf8Bytes('tier-2'), toUtf8Bytes('tier-3')],
				],
			},
		],
		comments: [
			{
				id: '1',
				content: '',
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
		],
	},
]
