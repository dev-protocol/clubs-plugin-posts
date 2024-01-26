import { describe, it, expect } from 'vitest'
import { Event } from '../types'
import { handleRegisterOnUpdateHandler, onUpdate, onUpdateHandlers } from '.'

describe('onUpdate', () => {
	it('should be calling CustomEvent with posts:event::add_on_update_listener on document', () => {
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
