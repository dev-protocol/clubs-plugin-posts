/* eslint-disable functional/no-loop-statement */
import { always, tryCatch } from 'ramda'
import type { PostPrimitives } from '../types'

export type OnUpdateHandler = (
	post: PostPrimitives,
) => PostPrimitives | Promise<PostPrimitives>

const onUpdateHandlers = new Set<OnUpdateHandler>()

// eslint-disable-next-line functional/no-return-void
export const onUpdate = (handler: OnUpdateHandler) =>
	onUpdateHandlers.add(handler)

export const update = async (
	_post: PostPrimitives,
): Promise<PostPrimitives> => {
	// eslint-disable-next-line functional/no-let
	let post = _post
	// eslint-disable-next-line functional/no-loop-statement
	for await (const handler of onUpdateHandlers) {
		// eslint-disable-next-line functional/no-expression-statement
		post = await tryCatch(handler, always(post))(post)
	}
	return post
}
