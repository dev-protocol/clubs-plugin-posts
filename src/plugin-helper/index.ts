/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable functional/no-loop-statements */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-return-void */
import { always, tryCatch } from 'ramda'
import { Event, type PostPrimitives, type Posts } from '../types'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { decode } from '@devprotocol/clubs-core'

export type OnUpdateHandler = (
	post: PostPrimitives,
) => PostPrimitives | Promise<PostPrimitives>
export type OnSetupHandler = (
	post: PostPrimitives,
) => PostPrimitives | Promise<PostPrimitives>
export type OnPostCreatedHandler = (post: Posts) => void | Promise<void>

export type EventRegisterOnUpdateHandler = CustomEvent<{
	readonly handler?: OnUpdateHandler
}>
export type EventRegisterOnSetupHandler = CustomEvent<{
	readonly handler?: OnSetupHandler
}>
export type EventPostCreated = CustomEvent<{
	readonly post: Posts
}>
export type EventClickToolbar = CustomEvent<{ readonly key: string }>

export const onUpdateHandlers = new Set<OnUpdateHandler>()
export const onSetupHandlers = new Set<OnSetupHandler>()

export const handleRegisterOnUpdateHandler = (
	e: EventRegisterOnUpdateHandler,
) => {
	return typeof e.detail.handler === 'function'
		? onUpdateHandlers.add(e.detail.handler)
		: onUpdateHandlers
}
export const handleRegisterOnSetupHandler = (
	e: EventRegisterOnSetupHandler,
) => {
	return typeof e.detail.handler === 'function'
		? onSetupHandlers.add(e.detail.handler)
		: onSetupHandlers
}

export const onUpdate = (handler: OnUpdateHandler) =>
	typeof document !== 'undefined' &&
	document.dispatchEvent(
		new CustomEvent(Event.RegisterOnUpdateHandler, { detail: { handler } }),
	)
export const onSetup = (handler: OnSetupHandler) =>
	typeof document !== 'undefined' &&
	document.dispatchEvent(
		new CustomEvent(Event.RegisterOnSetupHandler, { detail: { handler } }),
	)
export const onClickToolbar = (
	key: string,
	handler: (ev: EventClickToolbar) => unknown,
) =>
	typeof document !== 'undefined' &&
	document.addEventListener(Event.ClickToolbar, (ev) => {
		ev.detail.key === key && handler(ev)
	})
export const emitClickToolbar = (key: string) =>
	typeof document !== 'undefined' &&
	document.dispatchEvent(
		new CustomEvent(Event.ClickToolbar, { detail: { key } }),
	)

const callHandlers = async (
	_set: ReadonlySet<OnUpdateHandler | OnSetupHandler>,
	_post: PostPrimitives,
): Promise<PostPrimitives> => {
	let post = _post
	for await (const handler of _set) {
		post = await tryCatch(handler, always(post))(post)
	}
	return post
}

export const update = async (
	_post: PostPrimitives,
): Promise<PostPrimitives> => {
	return callHandlers(onUpdateHandlers, _post)
}
export const setup = async (_post: PostPrimitives): Promise<PostPrimitives> => {
	return callHandlers(onSetupHandlers, _post)
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

const {
	PostCreated,
	RegisterOnUpdateHandler,
	RegisterOnSetupHandler,
	ClickToolbar,
} = Event

export const dispatchPostCreated = (post: Posts) =>
	typeof document !== 'undefined' &&
	document.dispatchEvent(
		new CustomEvent(Event.PostCreated, { detail: { post } }),
	)

declare global {
	interface DocumentEventMap {
		readonly [RegisterOnUpdateHandler]: EventRegisterOnUpdateHandler
		readonly [PostCreated]: EventPostCreated
		readonly [RegisterOnSetupHandler]: EventRegisterOnSetupHandler
		readonly [ClickToolbar]: EventClickToolbar
	}
}
