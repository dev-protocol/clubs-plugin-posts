/* eslint-disable functional/no-expression-statement */
import { encode } from '@devprotocol/clubs-core'
import { createClient, type RediSearchSchema } from 'redis'
import type { Comment, Posts } from '../types'
import * as schema from '../constants/redis'
import { tryCatch } from 'ramda'
import { uuidFactory } from './uuidFactory'

const client = createClient({
	url: import.meta.env.REDIS_URL,
	username: import.meta.env.REDIS_USERNAME ?? '',
	password: import.meta.env.REDIS_PASSWORD ?? '',
	socket: {
		keepAlive: 1,
		reconnectStrategy: 1,
	},
})

const createOrSkip = (name: string, prefix: string, scm: RediSearchSchema) =>
	client.ft
		.create(name, scm, {
			ON: 'JSON',
			PREFIX: prefix,
		})
		.then((result) => ({ result, name }))
		.catch((err: Error) => ({ result: err.message, name }))

export const createIndex = async () => {
	await client.connect()

	const schemaPost = {
		...schema.id,
		...schema.title,
		...schema.content,
		...schema.created_by,
		...schema.created_at,
		...schema.updated_at,
		...schema._raw,
	}
	const schemaComment = {
		...schema.id,
		...schema.content,
		...schema.created_by,
		...schema.created_at,
		...schema.updated_at,
		...schema._raw,
		...schema._scope,
		...schema._post_id,
	}
	const schemaReaction = {
		...schema.content,
		...schema.created_by,
		...schema._scope,
		...schema._post_id,
	}
	const schemaOption = {
		...schema.key,
		...schema.value,
		...schema._raw,
		...schema._parent_type,
		...schema._parent_id,
		...schema._scope,
	}

	const res = await Promise.all([
		createOrSkip(schema.Index.Post, schema.Prefix.Post, schemaPost),
		createOrSkip(schema.Index.Comment, schema.Prefix.Comment, schemaComment),
		createOrSkip(schema.Index.Reaction, schema.Prefix.Reaction, schemaReaction),
		createOrSkip(schema.Index.Option, schema.Prefix.Option, schemaOption),
	])
	await client.quit()

	return res
}

export const setPost = async ({
	scope,
	post,
	url,
}: {
	readonly scope: string
	readonly post: Posts
	readonly url: string
}) => {
	await client.connect()
	const uuid = uuidFactory(url)

	const _post = {
		id: post.id,
		title: post.title,
		content: post.content,
		created_by: post.created_by,
		created_at: post.created_at,
		updated_at: post.updated_at,
	}

	const newPostData = {
		..._post,
		created_at: _post.created_at.getTime(),
		updated_at: _post.updated_at.getTime(),
		_raw: encode(_post),
		_scope: scope,
	}
	const newReactionsData = Object.keys(post.reactions)
		.map((key) => {
			const users = post.reactions[key]
			return users.map((created_by) => ({
				content: key,
				created_by,
				_scope: scope,
				_post_id: post.id,
			}))
		})
		.flat()
	const newPostOptionsData = post.options.map((data) => {
		const src = {
			key: data.key,
			value: data.value,
		}
		return {
			...src,
			value: JSON.stringify(data.value),
			_raw: encode(src),
			_scope: scope,
			_parent_type: 'post',
			_parent_id: post.id,
		}
	})

	await client.json.set(`${schema.Prefix.Post}${_post.id}`, '$', newPostData)
	await Promise.all(
		post.comments.map((data) =>
			setCommentImpl({
				scope,
				url,
				comment: data,
				postId: post.id,
				db: client,
			}),
		),
	)
	await Promise.all(
		newReactionsData.map((data) =>
			client.json.set(`${schema.Prefix.Reaction}${uuid()}`, '$', data),
		),
	)
	await Promise.all(
		newPostOptionsData.map((data) =>
			client.json.set(`${schema.Prefix.Option}${uuid()}`, '$', data),
		),
	)
	await client.quit()

	return true
}

export const setComment = async ({
	scope,
	comment,
	postId,
	url,
}: {
	readonly scope: string
	readonly comment: Comment
	readonly postId: string
	readonly url: string
}) => {
	await client.connect()
	await setCommentImpl({ scope, url, postId, comment, db: client })
	await client.quit()
	return true
}

export const setCommentImpl = async ({
	scope,
	comment,
	postId,
	url,
	db,
}: {
	readonly scope: string
	readonly comment: Comment
	readonly postId: string
	readonly url: string
	readonly db: typeof client
}) => {
	const uuid = uuidFactory(url)
	const { options, ..._comment } = comment

	const newCommentData = {
		..._comment,
		created_at: comment.created_at.getTime(),
		updated_at: comment.updated_at.getTime(),
		_post_id: postId,
		_raw: encode(comment),
		_scope: scope,
	}

	const newCommentOptionsData = options.map((opt) => {
		const src = {
			key: opt.key,
			value: opt.value,
		}
		return {
			...src,
			value: JSON.stringify(opt.value),
			_raw: encode(src),
			_scope: scope,
			_parent_type: 'comment',
			_parent_id: comment.id,
		}
	})

	await db.json.set(
		`${schema.Prefix.Comment}${comment.id}`,
		'$',
		newCommentData,
	)
	await Promise.all(
		newCommentOptionsData.map((data) =>
			db.json.set(`${schema.Prefix.Option}${uuid()}`, '$', data),
		),
	)

	return true
}
