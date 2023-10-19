import {
	ClubsPluginCategory,
	type ClubsPluginMeta,
	type ClubsFunctionGetSlots,
	type ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import AfterContentForm from './edit:after:content-form.astro'
import AfterPostContent from './feed:after:post-content.astro'
import { SlotName } from '../../../src'

export const getSlots = (async () => [
	{
		slot: SlotName.PostsEditAfterContentForm,
		component: AfterContentForm,
	},
	{
		slot: SlotName.PostsFeedAfterPostContent,
		component: AfterPostContent,
	},
]) satisfies ClubsFunctionGetSlots

export const meta = {
	id: 'example-plugin',
	displayName: 'Example plugin',
	category: ClubsPluginCategory.Uncategorized,
} satisfies ClubsPluginMeta

export default {
	getSlots,
	meta,
} satisfies ClubsFunctionPlugin
