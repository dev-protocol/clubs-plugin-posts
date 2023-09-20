/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable functional/no-let */
import { getDefaultProvider, toUtf8Bytes } from 'ethers'
import type { Posts } from '../types'
import { Wallet } from 'ethers'
import { sentence as genSentence } from 'txtgen'

const randomAddress = () => Wallet.createRandom(getDefaultProvider(1)).address

let lastSentence = ''
const sentence = () => {
	let txt = genSentence()
	while (
		txt.split(' ')[0] === lastSentence.split(' ')[0] ||
		txt.includes('However')
	) {
		txt = genSentence()
	}
	lastSentence = txt
	return txt
}

export const examplePosts: readonly Posts[] = [
	{
		id: '1',
		title: 'Hello World',
		content: sentence(),
		created_by: randomAddress(),
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
			...new Array(12).fill('').map((_, i) => ({
				content: sentence(),
				id: `i-${i}`,
				options: [{ key: 'reaction', value: '👍' }],
				created_by: randomAddress(),
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			})),
		],
		reactions: {
			'👍': ['0x1', '0x2'],
			'🦜': ['0x3'],
		},
		masked: true,
	},
	{
		id: '2',
		title: 'Hey guys!',
		content: sentence(),
		created_by: randomAddress(),
		created_at: new Date('2021-01-01T01:34:56Z'),
		updated_at: new Date('2021-01-01T01:34:56Z'),
		options: [
			{
				key: '#images',
				value: [
					'https://source.unsplash.com/1200x1024/?nature',
					'https://source.unsplash.com/800x400/?water',
					'https://source.unsplash.com/800x400/?sky',
				],
			},
		],
		comments: [
			{
				id: '1',
				options: [],
				content: sentence(),
				created_by: randomAddress(),
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			{
				id: '2',
				options: [],
				content: sentence(),
				created_by: randomAddress(),
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			...new Array(20).fill('').map((_, i) => ({
				id: `i-${i}`,
				content: sentence(),
				options: [{ key: 'reaction', value: '👍' }],
				created_by: randomAddress(),
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
		content: sentence(),
		created_by: randomAddress(),
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
				content: sentence(),
				created_by: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			...new Array(10).fill('').map((_, i) => ({
				id: `i-${i}`,
				content: sentence(),
				options: [{ key: 'reaction', value: '👍' }],
				created_by: randomAddress(),
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
		content: sentence(),
		created_by: randomAddress(),
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
				content: sentence(),
				created_by: randomAddress(),
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
			...new Array(80).fill('').map((_, i) => ({
				id: `i-${i}`,
				content: sentence(),
				options: [{ key: 'reaction', value: '👍' }],
				created_by: randomAddress(),
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
		content: sentence(),
		created_by: randomAddress(),
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
				created_by: randomAddress(),
				created_at: new Date('2021-01-01T01:34:56Z'),
				updated_at: new Date('2021-01-01T01:34:56Z'),
			},
		],
		reactions: {},
		masked: true,
	},
]
