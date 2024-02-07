import { describe, it, expect } from 'vitest'
import { Event } from '../types'
import {
	dispatchPostCreated,
	handleRegisterOnUpdateHandler,
	onPostCreated,
	onUpdate,
	onUpdateHandlers,
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
