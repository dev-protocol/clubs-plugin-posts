import type { ClubsGeneralUnit } from '@devprotocol/clubs-core'

export type Option = {
	readonly key: 'posts'
	readonly value: readonly Posts[]
}

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
	readonly reactions: Reactions
	readonly masked?: boolean
}

export type PostOption = {
	readonly key: string
	readonly value: ClubsGeneralUnit
}

export type CommentPrimitives = {
	readonly content: string
	readonly options: readonly PostOption[]
}

export type Comment = CommentPrimitives & {
	readonly id: string
	readonly created_by: string
	readonly created_at: Date
	readonly updated_at: Date
}

export type OptionsDatabase = {
	readonly id: string
	readonly slug?: string
	readonly database: {
		readonly type: 'encoded:redis'
		readonly key: string
	}
}

export type Membership = {
	readonly id: string
	readonly name: string
	readonly description: string
	readonly price: number
	readonly currency: string
	readonly imageSrc: string
	readonly payload?: Uint8Array
}

/**
 * Reaction is a map of emoji to users who reacted to a post
 * An emoji as the key, and an array of addresses as the users who reacted to the post
 * @example
 * {'🦜': ['0x0', '0x2']}
 */
export type Reactions = {
	readonly [emoji: string]: readonly string[]
}
