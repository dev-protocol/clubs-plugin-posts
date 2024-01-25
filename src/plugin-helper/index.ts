/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-loop-statement */
import { always, tryCatch } from 'ramda'
import { Event, type PostPrimitives, type Posts } from '../types'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { decode } from '@devprotocol/clubs-core'

export type OnUpdateHandler = (
	post: PostPrimitives,
) => PostPrimitives | Promise<PostPrimitives>

export type EventAddOnUpdateListener = CustomEvent<{
	readonly handler?: OnUpdateHandler
}>

export const onUpdateHandlers = new Set<OnUpdateHandler>()

export const handleAddOnUpdateHandler = (e: EventAddOnUpdateListener) => {
	return typeof e.detail.handler === 'function'
		? onUpdateHandlers.add(e.detail.handler)
		: onUpdateHandlers
}

// eslint-disable-next-line functional/no-return-void
export const onUpdate = (handler: OnUpdateHandler) =>
	document.dispatchEvent(
		new CustomEvent(Event.AddOnUpdateHandler, { detail: { handler } }),
	)

export const update = async (
	_post: PostPrimitives,
): Promise<PostPrimitives> => {
	// eslint-disable-next-line functional/no-let
	let post = _post
	for await (const handler of onUpdateHandlers) {
		post = await tryCatch(handler, always(post))(post)
	}
	return post
}

export const EncodedPostClassName = '__input-encoded-post__'

export const currentPost = (
	handler: (post: Posts) => unknown,
	base: Readonly<Element>,
) => {
	let current: UndefinedOr<null | Element> = base
	let input: UndefinedOr<HTMLInputElement>
	let count = 0
	while (count < 30 && !input) {
		input = current?.getElementsByClassName(
			EncodedPostClassName,
		)?.[0] as UndefinedOr<HTMLInputElement>
		current = current?.parentElement
		count = count + 1
	}
	whenDefined(input, (_input) => {
		handler(decode<Posts>(_input.value))
		new MutationObserver((mutationList) => {
			console.log({ mutationList })
			mutationList.some(({ attributeName }) => attributeName === 'value') &&
				handler(decode<Posts>(_input.value))
		}).observe(_input, { attributes: true })
		return _input
	})
	return input
}

const { AddOnUpdateHandler: AddOnUpdateListener } = Event

declare global {
	interface DocumentEventMap {
		readonly [AddOnUpdateListener]: EventAddOnUpdateListener
	}
}
