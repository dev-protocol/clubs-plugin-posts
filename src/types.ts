import type { ClubsGeneralUnit } from '@devprotocol/clubs-core'

export type Option = { readonly key: 'posts'; readonly value: readonly Posts[] }

export type TokenURIWithId = {
	readonly id: number
	readonly image: string
}

export type PostPrimitives = {
	readonly title: string
	readonly content: string
	readonly options: readonly PostOption[]
}

export type Posts = PostPrimitives & {
	readonly id: string
	readonly created_by: string
	readonly created_at: Date
	readonly updated_at: Date
	readonly comments: readonly Comment[]
}

export type PostOption = {
	readonly key: string
	readonly value: ClubsGeneralUnit
}

export type Comment = {
	readonly id: string
	readonly content: string
	readonly created_by: string
	readonly created_at: Date
	readonly updated_at: Date
}

export type OptionsDatabase = {
	readonly key: 'database'
	readonly value: {
		readonly type: 'encoded:redis'
		readonly key: string
	}
}
