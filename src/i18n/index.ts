import type { ClubsI18nParts } from '@devprotocol/clubs-core'

export const Strings = {
	NoPostsOnTimeline: {
		en: 'Sorry, but there are no posts on this timeline yet.',
		ja: '申し訳ありませんが、このタイムラインにはまだ投稿がありません。',
	},
	NoPostsOnTimelineTryAgain: {
		en: 'Sorry, but there was an error loading the timeline. Please try again later.',
		ja: '申し訳ありませんが、タイムラインの読み込み中にエラーが発生しました。後でもう一度試してください。',
	},
	SignIn: {
		en: 'Sign in',
		ja: '投稿に参加する',
	},
	SignInExplanatoryMsg: {
		en: 'Click the Participate in Post button to view and comment on members-only articles.',
		ja: '投稿に参加するボタンをクリックすると、メンバー限定記事の参照やコメントができます',
	},
} satisfies ClubsI18nParts
