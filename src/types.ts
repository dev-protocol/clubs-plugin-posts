export type Option =
	| { readonly key: 'posts'; readonly value: Posts[] }

export type TokenURIWithId = {
	readonly id: number
	readonly image: string
}

export type Posts = {
	readonly id: string
	readonly title: string
	readonly content: string
	readonly created_by: string
	readonly created_at: string
	readonly updated_at: string
	readonly options: readonly PostOption[]
	readonly comments: readonly Comment[]
	readonly reactions: readonly any[]
}

export type PostOption = {
	readonly key: string
	readonly value: any[]
}

export type Comment = {
	readonly id: string
	readonly content: string
	readonly created_by: string
	readonly created_at: string
	readonly updated_at: string
}

