import { describe, it, expect } from 'vitest'
import { Event } from '../types'
import {
	dispatchPostCreated,
	handleRegisterOnUpdateHandler,
	onPostCreated,
	onUpdate,
	onUpdateHandlers,
	update,
	handleRegisterOnSetupHandler,
	onSetup,
	onSetupHandlers,
	setup,
} from '.'

describe('onUpdate', () => {
	it('should be calling CustomEvent with posts:event::register_on_update_handler on document', () => {
		const expected = async () => ({
			title: 'title',
			content: 'content',
			options: [],
		})
		let val
		document.addEventListener(Event.RegisterOnUpdateHandler, async (e) => {
			val = e.detail.handler
		})
		onUpdate(expected)

		expect(Event.RegisterOnUpdateHandler).toBe(
			'posts:event::register_on_update_handler',
		)
		expect(val).toEqual(expected)
	})

	describe('update', () => {
		it('should modify the post object by calling all the onUpdateHandlers', async () => {
			onUpdateHandlers.clear()
			const post = {
				title: 'title',
				content: 'content',
				options: [],
			}
			document.addEventListener(
				Event.RegisterOnUpdateHandler,
				handleRegisterOnUpdateHandler,
			)

			onUpdate((post) => ({
				...post,
				options: [...post.options, { key: 'key1', value: 'value1' }],
			}))
			onUpdate(async (post) => ({
				...post,
				options: [...post.options, { key: 'key2', value: 'value2' }],
			}))
			const res = await update(post)
			expect(res).toEqual({
				title: 'title',
				content: 'content',
				options: [
					{ key: 'key1', value: 'value1' },
					{ key: 'key2', value: 'value2' },
				],
			})
		})
	})
})

describe('onSetup', () => {
	it('should be calling CustomEvent with posts:event::register_on_setup_handler on document', () => {
		const expected = async () => ({
			title: 'title',
			content: 'content',
			options: [],
		})
		let val
		document.addEventListener(Event.RegisterOnSetupHandler, async (e) => {
			val = e.detail.handler
		})
		onSetup(expected)

		expect(Event.RegisterOnSetupHandler).toBe(
			'posts:event::register_on_setup_handler',
		)
		expect(val).toEqual(expected)
	})

	describe('setup', () => {
		it('should modify the post object by calling all the onSeupHandlers', async () => {
			onSetupHandlers.clear()
			const post = {
				title: 'title',
				content: 'content',
				options: [],
			}
			document.addEventListener(
				Event.RegisterOnSetupHandler,
				handleRegisterOnSetupHandler,
			)

			onSetup((post) => ({
				...post,
				options: [...post.options, { key: 'key1', value: 'value1' }],
			}))
			onSetup(async (post) => ({
				...post,
				options: [...post.options, { key: 'key2', value: 'value2' }],
			}))
			const res = await setup(post)
			expect(res).toEqual({
				title: 'title',
				content: 'content',
				options: [
					{ key: 'key1', value: 'value1' },
					{ key: 'key2', value: 'value2' },
				],
			})
		})
	})
})

describe('handleAddOnUpdateListener', () => {
	it('should be adding handler function to onUpdateHandlers', () => {
		const expected = async () => ({
			title: 'title',
			content: 'content',
			options: [],
		})
		document.addEventListener(
			Event.RegisterOnUpdateHandler,
			handleRegisterOnUpdateHandler,
		)
		onUpdate(expected)

		expect(onUpdateHandlers.has(expected)).toBeTruthy()
	})
})

describe('handleRegisterOnSeupHandler', () => {
	it('should be adding handler function to onSetupHandlers', () => {
		const expected = async () => ({
			title: 'title',
			content: 'content',
			options: [],
		})
		document.addEventListener(
			Event.RegisterOnSetupHandler,
			handleRegisterOnSetupHandler,
		)
		onSetup(expected)

		expect(onSetupHandlers.has(expected)).toBeTruthy()
	})
})

describe('onPostCreated', () => {
	it('should be add the given handler to CustomEvent listener for posts:event::post_created on document', () => {
		const expected = {
			title: 'title',
			content: 'content',
			options: [],
		}
		let val
		onPostCreated((post) => {
			val = post
		})
		document.dispatchEvent(
			new CustomEvent(Event.PostCreated, { detail: { post: expected } }),
		)

		expect(val).toEqual(expected)
	})
})

describe('dispatchPostCreated', () => {
	it('should be dispatching posts:event::post_created event with the given post object', () => {
		const expected = {
			title: 'title',
			content: 'content',
			options: [],
		}
		let val
		document.addEventListener(Event.PostCreated, (e) => {
			val = e.detail.post
		})
		dispatchPostCreated(expected as any)

		expect(Event.PostCreated).toBe('posts:event::post_created')
		expect(val).toEqual(expected)
	})
})
