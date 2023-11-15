import { SchemaFieldTypes, type RediSearchSchema } from 'redis'

export enum Index {
	Post = 'idx::devprotocol:clubs:plugin:posts::post',
	Comment = 'idx::devprotocol:clubs:plugin:posts::comment',
	Reaction = 'idx::devprotocol:clubs:plugin:posts::reaction',
	Option = 'idx::devprotocol:clubs:plugin:posts::option',
}

export enum Prefix {
	Post = 'doc::devprotocol:clubs:plugin:posts::post:',
	Comment = 'doc::devprotocol:clubs:plugin:posts::comment:',
	Reaction = 'doc::devprotocol:clubs:plugin:posts::reaction:',
	Option = 'doc::devprotocol:clubs:plugin:posts::option:',
}

export const _raw = {
	'$._raw': {
		type: SchemaFieldTypes.TEXT,
		AS: '_raw',
	},
} satisfies RediSearchSchema

export const _scope = {
	'$._scope': {
		type: SchemaFieldTypes.TEXT,
		AS: '_scope',
	},
} satisfies RediSearchSchema

export const _post_id = {
	'$.created_by': {
		type: SchemaFieldTypes.TEXT,
		AS: '_post_id',
	},
} satisfies RediSearchSchema

export const _parent_type = {
	'$._parent_type': {
		type: SchemaFieldTypes.TEXT,
		AS: '_parent_type',
	},
} satisfies RediSearchSchema

export const _parent_id = {
	'$._parent_id': {
		type: SchemaFieldTypes.TEXT,
		AS: '_parent_id',
	},
} satisfies RediSearchSchema

export const id = {
	'$.id': {
		type: SchemaFieldTypes.TEXT,
		AS: 'id',
	},
} satisfies RediSearchSchema

export const title = {
	'$.title': {
		type: SchemaFieldTypes.TEXT,
		AS: 'title',
	},
} satisfies RediSearchSchema

export const content = {
	'$.content': {
		type: SchemaFieldTypes.TEXT,
		AS: 'content',
	},
} satisfies RediSearchSchema

export const created_by = {
	'$.created_by': {
		type: SchemaFieldTypes.TEXT,
		AS: 'created_by',
	},
} satisfies RediSearchSchema

export const created_at = {
	'$.created_at': {
		type: SchemaFieldTypes.NUMERIC,
		SORTABLE: true,
		AS: 'created_at',
	},
} satisfies RediSearchSchema

export const updated_at = {
	'$.updated_at': {
		type: SchemaFieldTypes.NUMERIC,
		SORTABLE: true,
		AS: 'updated_at',
	},
} satisfies RediSearchSchema

export const key = {
	'$.key': {
		type: SchemaFieldTypes.TEXT,
		AS: 'key',
	},
} satisfies RediSearchSchema

export const value = {
	'$.value': {
		type: SchemaFieldTypes.TEXT,
		AS: 'value',
	},
} satisfies RediSearchSchema
