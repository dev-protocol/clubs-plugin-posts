import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
	AddYourThoughts: { en: 'Add your thoughts...', ja: 'コメントを入力' },
	Post: { en: 'Post', ja: '投稿する' },
	Title: { en: 'Title', ja: '件名' },
	WhatsHappening: { en: "What's happening", ja: '本文' },
	LimitedAccess: { en: 'Limited access', ja: '限定アクセス' },
	UnlockInstructions: {
		en: 'Unlock this post by becoming a member',
		ja: 'メンバーになってこの投稿をアンロックする',
	},
	RequireAnyOffered: {
		en: 'Require any offered membership',
		ja: '提供されているメンバーシップのいずれかを必要とする',
	},
	AnyOffered: {
		en: 'Any offered membership',
		ja: 'いずれかのメンバーシップが必要',
	},
} satisfies ClubsI18nParts
