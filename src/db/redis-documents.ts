/* eslint-disable functional/no-expression-statement */
import { encode } from '@devprotocol/clubs-core'
import { type RediSearchSchema } from 'redis'
import type { Comment, PostOption, Posts } from '../types'
import * as schema from '../constants/redis'
import { uuidFactory } from './uuidFactory'
import { getDefaultClient, type RedisDefaultClient } from './redis'
import { uuidToQuery } from '../fixtures/search'

export type PostRawDocument = {
	readonly id: string
	readonly title: string
	readonly content: string
	readonly created_by: string
	readonly created_at: Date
	readonly updated_at: Date
}
export type PostDocument = Omit<
	PostRawDocument,
	'created_at' | 'updated_at'
> & {
	readonly created_at: number
	readonly updated_at: number
	readonly _raw: string
	readonly _scope: string
}
export type CommentRawDocument = {
	readonly id: string
	readonly content: string
	readonly created_by: string
	readonly created_at: Date
	readonly updated_at: Date
}
export type CommentDocument = Omit<
	CommentRawDocument,
	'created_at' | 'updated_at'
> & {
	readonly created_at: number
	readonly updated_at: number
	readonly _raw: string
	readonly _scope: string
	readonly _post_id: string
}
export type ReactionRawDocument = {
	readonly content: string
	readonly created_by: string
}
export type ReactionDocument = ReactionRawDocument & {
	readonly _scope: string
	readonly _post_id: string
}

export type ReactionDocumentWithId = ReactionDocument & {
	readonly id: string
}

export type OptionRawDocument = PostOption
export type OptionDocument = Omit<OptionRawDocument, 'value'> & {
	readonly value: string
	readonly _raw: string
	readonly _parent_type: 'post' | 'comment'
	readonly _parent_id: string
	readonly _scope: string
}

export const postDocument = ({
	data,
	scope,
}: {
	readonly data: PostRawDocument
	readonly scope: string
}): PostDocument => ({
	id: data.id,
	title: data.title,
	content: data.content,
	created_by: data.created_by,
	created_at: data.created_at.getTime(),
	updated_at: data.updated_at.getTime(),
	_raw: encode(data),
	_scope: scope,
})
export const commentDocument = ({
	data,
	scope,
	postId,
}: {
	readonly data: CommentRawDocument
	readonly scope: string
	readonly postId: string
}): CommentDocument => ({
	id: data.id,
	content: data.content,
	created_by: data.created_by,
	created_at: data.created_at.getTime(),
	updated_at: data.updated_at.getTime(),
	_raw: encode(data),
	_scope: scope,
	_post_id: postId,
})
export const reactionDocument = ({
	data,
	scope,
	postId,
}: {
	readonly data: ReactionRawDocument
	readonly scope: string
	readonly postId: string
}): ReactionDocument => ({
	content: data.content,
	created_by: data.created_by,
	_scope: scope,
	_post_id: postId,
})
export const optionDocument = ({
	data,
	scope,
	parentType,
	parentId,
}: {
	readonly data: OptionRawDocument
	readonly scope: string
	readonly parentType: OptionDocument['_parent_type']
	readonly parentId: string
}): OptionDocument => ({
	key: data.key,
	value: JSON.stringify(data.value),
	_scope: scope,
	_raw: encode(data),
	_parent_type: parentType,
	_parent_id: parentId,
})
export const generatePrefixOf = (prefix: schema.Prefix, scope: string) =>
	`${prefix}:${scope}`
export const generateKeyOf = (
	prefix: schema.Prefix,
	scope: string,
	id: string,
) => `${generatePrefixOf(prefix, scope)}:${id}`

const createOrSkip = async (
	name: string,
	prefix: string,
	scm: RediSearchSchema,
) => {
	const client = await getDefaultClient()

	return client.ft
		.create(name, scm, {
			ON: 'JSON',
			PREFIX: prefix,
		})
		.then((result) => ({ result, name }))
		.catch((err: Error) => ({ result: err.message, name }))
}

export const createIndex = async (client: RedisDefaultClient) => {
	const schemaPost = {
		...schema.id,
		...schema.title,
		...schema.content,
		...schema.created_by,
		...schema.created_at,
		...schema.updated_at,
		...schema._raw,
		...schema._scope,
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

	return res
}

export const setPost = async ({
	scope,
	post,
	url,
	client,
}: {
	readonly scope: string
	readonly post: Posts
	readonly url: string
	readonly client: RedisDefaultClient
}) => {
	const uuid = uuidFactory(url)

	const _post: PostRawDocument = {
		id: post.id,
		title: post.title,
		content: post.content,
		created_by: post.created_by,
		created_at: post.created_at,
		updated_at: post.updated_at,
	}

	const newPostData: PostDocument = postDocument({ data: _post, scope })
	const newReactionsData: readonly ReactionDocument[] = Object.keys(
		post.reactions,
	)
		.map((key) => {
			const reactions = post.reactions[key]
			return reactions.map((reaction) =>
				reactionDocument({
					data: {
						content: key,
						created_by: reaction.createdBy,
						// created_by,
					},
					scope: scope,
					postId: post.id,
				}),
			)
		})
		.flat()
	const newPostOptionsData: readonly OptionDocument[] = post.options.map(
		(data) =>
			optionDocument({
				data: {
					key: data.key,
					value: data.value,
				},
				scope,
				parentType: 'post',
				parentId: post.id,
			}),
	)

	await client.json.set(
		generateKeyOf(schema.Prefix.Post, scope, _post.id),
		'$',
		newPostData,
	)
	await Promise.all(
		post.comments.map((data) =>
			setComment({
				scope,
				url,
				comment: data,
				postId: post.id,
				client,
			}),
		),
	)
	await Promise.all(
		newReactionsData.map((data) =>
			client.json.set(
				generateKeyOf(schema.Prefix.Reaction, scope, uuid()),
				'$',
				data,
			),
		),
	)
	await Promise.all(
		newPostOptionsData.map((data) =>
			client.json.set(
				generateKeyOf(schema.Prefix.Option, scope, uuid()),
				'$',
				data,
			),
		),
	)

	return true
}

export const deletePost = async ({
	postId,
	client,
	scope,
	userAddress,
}: {
	readonly scope: string
	readonly postId: string
	readonly client: RedisDefaultClient
	readonly userAddress: string
}) => {
	// first fetch the post
	const doc = await client.json.get(`${schema.Prefix.Post}:${scope}:${postId}`)

	if (!doc) {
		return false
	}

	const post = doc?.valueOf() as Posts

	// ensure the user is the owner of the post
	if (post.created_by !== userAddress) {
		return false
	}

	// delete by id
	const success = await client.del(`${schema.Prefix.Post}:${scope}:${postId}`)
	// return success === 1

	// @todo: delete comments
	// @todo: delete reactions

	const deleteAllComments = async (
		scope: string,
		postId: string,
		client: RedisDefaultClient,
	) => {
		// eslint-disable-next-line functional/no-let
		let page = 0
		// eslint-disable-next-line functional/no-let
		let comments

		// eslint-disable-next-line functional/no-loop-statement
		do {
			comments = await fetchComments({ scope, postId, client, page })
			const deleteCommentPromises = comments.map((comment) =>
				deleteComment({
					scope,
					commentId: comment.id,
					parentType: 'post',
					client,
				}),
			)

			await Promise.all(deleteCommentPromises)
			page++
		} while (comments.length > 0)
		return true
	}

	const commentsDeleted = deleteAllComments(scope, postId, client)

	const reactions = await fetchAllReactions({ scope, postId, client })

	// delete all reactions with postId
	const deleteReactionsPromises = reactions.map((reaction) => {
		return client.del(reaction.id)
	})

	await Promise.all(deleteReactionsPromises)

	return success === 1 && commentsDeleted
}

export const setReaction = async ({
	scope,
	reaction,
	postId,
	url,
	client,
	createdBy,
}: {
	readonly scope: string
	readonly reaction: string
	readonly postId: string
	readonly url: string
	readonly client: RedisDefaultClient
	readonly createdBy: string
}) => {
	return await implSetReaction({
		scope,
		reaction,
		postId,
		url,
		client,
		createdBy,
	})
}

export const implSetReaction = async ({
	scope,
	reaction,
	postId,
	url,
	client,
	createdBy,
}: {
	readonly scope: string
	readonly reaction: string
	readonly postId: string
	readonly url: string
	readonly client: RedisDefaultClient
	readonly createdBy: string
}) => {
	const uuid = uuidFactory(url)
	const newReactionData = reactionDocument({
		data: {
			content: reaction,
			created_by: createdBy,
		},
		scope: scope,
		postId,
	})

	const id = uuid()

	await client.json.set(
		generateKeyOf(schema.Prefix.Reaction, scope, id),
		'$',
		newReactionData,
	)

	return id
}

export const setComment = async ({
	scope,
	comment,
	postId,
	url,
	client,
}: {
	readonly scope: string
	readonly comment: Comment
	readonly postId: string
	readonly url: string
	readonly client: RedisDefaultClient
}) => {
	const uuid = uuidFactory(url)
	const { options, ..._comment } = comment

	const newCommentData: CommentDocument = commentDocument({
		data: _comment,
		scope,
		postId,
	})

	const newCommentOptionsData: readonly OptionDocument[] = options.map((opt) =>
		optionDocument({
			data: {
				key: opt.key,
				value: opt.value,
			},
			scope,
			parentType: 'comment',
			parentId: comment.id,
		}),
	)

	await client.json.set(
		generateKeyOf(schema.Prefix.Comment, scope, comment.id),
		'$',
		newCommentData,
	)
	await Promise.all(
		newCommentOptionsData.map((data) =>
			client.json.set(
				generateKeyOf(schema.Prefix.Option, scope, uuid()),
				'$',
				data,
			),
		),
	)

	return true
}

export const deleteComment = async ({
	scope,
	parentType,
	commentId,
	client,
}: {
	readonly scope: string
	readonly commentId: string
	readonly parentType: OptionDocument['_parent_type']
	readonly client: RedisDefaultClient
}) => {
	const query = `@${schema._parent_type['$._parent_type'].AS}:${parentType} @${
		schema._parent_id['$._parent_id'].AS
	}:{${uuidToQuery(commentId)}}`
	const commentOptionsDataRecord = await client.ft.search(
		schema.Index.Option,
		query,
	)

	const commentKey = generateKeyOf(schema.Prefix.Comment, scope, commentId)
	try {
		await client.del(commentKey) // Delete the comment.
		await Promise.all(
			commentOptionsDataRecord.documents.map(
				async (record) => await client.del(record.id),
			),
		)
		return true
	} catch (err) {
		return false
	}
}

/**
 * Fetch paginated comments related to the parent post
 * @param scope - the associated db scope
 * @param postId - the parent post id
 * @param client - the redis client
 * @param page - the page number
 * @returns the comments
 */
export const fetchComments = async ({
	scope,
	postId,
	client,
	page,
}: {
	readonly scope: string
	readonly postId: string
	readonly client: RedisDefaultClient
	readonly page?: number
}) => {
	// eslint-disable-next-line no-param-reassign
	page = page || 1
	const limit = 10

	const start = (page - 1) * limit

	/**
	 * Search comments where parent id is postId
	 */
	const result = await client.ft.search(
		schema.Index.Comment,
		`@${schema._post_id['$._post_id'].AS}:{${uuidToQuery(postId)}}`,
		{
			LIMIT: {
				from: start,
				size: limit,
			},
		},
	)

	/**
	 * Convert the result to CommentDocument[]
	 */
	const comments = result.documents.map((doc) => doc.value as CommentDocument)
	return comments
}

/**
 * Fetch all options related to the parent post/comment
 * @param scope - the associated db scope
 * @param parentId - the parent post/comment id
 * @param parentType - post or comment
 * @param client - the redis client
 * @param page - the page number
 * @returns the comments
 */
export const fetchAllOptions = async ({
	scope,
	parentId,
	parentType,
	client,
}: {
	readonly scope: string
	readonly parentId: OptionDocument['_parent_id']
	readonly parentType: OptionDocument['_parent_type']
	readonly client: RedisDefaultClient
}): Promise<readonly OptionDocument[]> => {
	const limit = 10

	/**
	 * Search options where parent id is parentId
	 */
	const query = `@${schema._parent_type['$._parent_type'].AS}:${parentType} @${
		schema._parent_id['$._parent_id'].AS
	}:{${uuidToQuery(parentId)}}`
	const loop = async (
		start: number,
		list: readonly OptionDocument[],
	): Promise<readonly OptionDocument[]> => {
		const result = await client.ft.search(schema.Index.Option, query, {
			LIMIT: {
				from: start,
				size: limit,
			},
		})
		const docs: readonly OptionDocument[] = [
			...list,
			...result.documents.map(({ value }) => value as OptionDocument),
		]
		const isAll: boolean = result.total <= start + limit

		return isAll ? docs : await loop(start + limit + 1, docs)
	}
	const result = await loop(0, [])

	return result
}

/**
 * Fetch all reactions related to the parent post
 * @param scope - the associated db scope
 * @param postId - the parent post id
 * @param client - the redis client
 * @param page - the page number
 * @returns the comments
 */
export const fetchAllReactions = async ({
	scope,
	postId,
	client,
}: {
	readonly scope: string
	readonly postId: string
	readonly client: RedisDefaultClient
}): Promise<readonly ReactionDocumentWithId[]> => {
	const limit = 10

	/**
	 * Search options where parent id is parentId
	 */
	const query = `@${schema._post_id['$._post_id'].AS}:{${uuidToQuery(postId)}}`
	const loop = async (
		start: number,
		list: readonly ReactionDocumentWithId[],
	): Promise<readonly ReactionDocumentWithId[]> => {
		const result = await client.ft.search(schema.Index.Reaction, query, {
			LIMIT: {
				from: start,
				size: limit,
			},
		})
		const docs: readonly ReactionDocumentWithId[] = [
			...list,
			...result.documents.map(({ value, id }) => {
				return { ...value, id } as ReactionDocumentWithId
			}),
		]
		const isAll: boolean = result.total <= start + limit

		return isAll ? docs : await loop(start + limit + 1, docs)
	}
	const result = await loop(0, [])

	return result
}
