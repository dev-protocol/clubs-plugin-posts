import type {
	ClubsGeneralUnit,
	Membership as MembershipCore,
	ClubsSlotName,
} from '@devprotocol/clubs-core'

export type Option = {
	readonly key: 'posts'
	readonly value: readonly OptionsDatabase[]
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
	readonly title?: string
	readonly roles?: {
		readonly write: {
			readonly memberships: readonly [] | readonly Uint8Array[]
		}
	}
	readonly slots?: {
		readonly [key in ClubsSlotName]?: {
			enable: boolean
			title: string
			items: number
		}
	}
	readonly database:
		| {
				readonly type: 'encoded:redis'
				readonly key: string
		  }
		| {
				readonly type: 'documents:redis'
				readonly key: string
		  }
}

export type Membership = MembershipCore

/**
 * Reaction is a map of emoji to users who reacted to a post
 * An emoji as the key, and an array of addresses as the users who reacted to the post
 * @example
 * {'🦜': ['0x0', '0x2']}
 */
export type Reactions = {
	readonly [emoji: string]: readonly string[]
}

export enum SlotName {
	PostsEditAfterContentForm = 'posts:edit:after:content-form',
	PostsEditToolbarButton = 'posts:edit:toolbar:button',
	PostsFeedAfterPostContent = 'posts:feed:after:post-content',
}

export enum Event {
	PostCreated = 'posts:event::post_created',
	RegisterOnUpdateHandler = 'posts:event::register_on_update_handler',
	RegisterOnSetupHandler = 'posts:event::register_on_setup_handler',
	ClickToolbar = 'posts:event::click_toolbar',
}
