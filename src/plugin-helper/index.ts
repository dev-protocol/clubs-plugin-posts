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

export type OnPostCreatedHandler = (post: Posts) => void | Promise<void>

export type EventRegisterOnUpdateHandler = CustomEvent<{
	readonly handler?: OnUpdateHandler
}>

export type EventPostCreated = CustomEvent<{
	readonly post: Posts
}>

export const onUpdateHandlers = new Set<OnUpdateHandler>()

export const handleRegisterOnUpdateHandler = (
	e: EventRegisterOnUpdateHandler,
) => {
	return typeof e.detail.handler === 'function'
		? onUpdateHandlers.add(e.detail.handler)
		: onUpdateHandlers
}

// eslint-disable-next-line functional/no-return-void
export const onUpdate = (handler: OnUpdateHandler) =>
	typeof document !== 'undefined' &&
	document.dispatchEvent(
		new CustomEvent(Event.RegisterOnUpdateHandler, { detail: { handler } }),
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

export const onPostCreated = (handler: OnPostCreatedHandler) =>
	typeof document !== 'undefined' &&
	document.addEventListener(Event.PostCreated, (e) => handler(e.detail.post))

const { PostCreated, RegisterOnUpdateHandler } = Event

// eslint-disable-next-line functional/no-return-void
export const dispatchPostCreated = (post: Posts) =>
	typeof document !== 'undefined' &&
	document.dispatchEvent(
		new CustomEvent(Event.PostCreated, { detail: { post } }),
	)

declare global {
	interface DocumentEventMap {
		readonly [RegisterOnUpdateHandler]: EventRegisterOnUpdateHandler
		readonly [PostCreated]: EventPostCreated
	}
}
