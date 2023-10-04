import {
	type ClubsFunctionThemePlugin,
	ClubsPluginCategory,
	type ClubsPluginMeta,
	type ClubsFunctionGetSlots,
} from '@devprotocol/clubs-core'
import AfterContentForm from './edit:after:content-form.astro'
import AfterPostContent from './feed:after:post-content.astro'
import { SlotName } from '../../../src'

export const getSlots: ClubsFunctionGetSlots = async () => [
	{
		slot: SlotName.PostsEditAfterContentForm,
		component: AfterContentForm,
	},
	{
		slot: SlotName.PostsFeedAfterPostContent,
		component: AfterPostContent,
	},
]

export const meta: ClubsPluginMeta = {
	id: 'example-plugin',
	displayName: 'Example plugin',
	category: ClubsPluginCategory.Uncategorized,
}

export default {
	getSlots,
	meta,
} as ClubsFunctionThemePlugin
