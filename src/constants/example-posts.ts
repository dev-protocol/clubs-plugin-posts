import { ZeroAddress, toUtf8Bytes } from 'ethers'
import type { Posts } from '../types'

export const examplePosts: readonly Posts[] = [
	{
		id: '1',
		title: 'Hello World',
		content: '#1 This is a sample post.',
		created_by: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
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
		comments: [
			...new Array(100).fill('').map((_, i) => ({
				content: 'abc',
				id: `i-${i}`,
				options: [{ key: 'reaction', value: '👍' }],
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			})),
		],
		reactions: {
			'👍': ['0x1', '0x2'],
			'🦜': ['0x3'],
		},
	},
	{
		id: '2',
		title: 'Hello World',
		content: '#2 This is a sample post.',
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
				options: [],
				content: 'This is a sample comment #2-1.',
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			{
				id: '2',
				options: [],
				content: 'This is a sample comment #2-2.',
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			...new Array(20).fill('').map((_, i) => ({
				id: `i-${i}`,
				content: 'abc',
				options: [{ key: 'reaction', value: '👍' }],
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			})),
		],
		reactions: {
			'👍': ['0x1', '0x2'],
		},
	},
	{
		id: '3',
		title: 'Hi there',
		content: 'Good morning. This is a sample post.#3',
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
				options: [],
				content: 'This is a sample comment.#3-1',
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			...new Array(10).fill('').map((_, i) => ({
				id: `i-${i}`,
				content: 'abc',
				options: [{ key: 'reaction', value: '👍' }],
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			})),
		],
		reactions: {
			'🦜': ['0x3'],
		},
	},
	{
		id: '4',
		title: 'Hey guys',
		content: 'Good evening. This is a sample post.#4',
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
				options: [],
				content: 'This is a sample comment.#4-1',
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			...new Array(80).fill('').map((_, i) => ({
				id: `i-${i}`,
				content: 'abc',
				options: [{ key: 'reaction', value: '👍' }],
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			})),
		],
		reactions: {
			'👍': ['0x1', '0x2'],
			'🦜': ['0x3'],
		},
	},
	{
		id: '5',
		title: 'Secret',
		content: 'Good evening. This is a sample secret pos... #5',
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
				options: [],
				created_by: ZeroAddress,
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
		],
		reactions: {},
	},
]
