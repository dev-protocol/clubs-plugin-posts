import {
	type ClubsFunctionThemePlugin,
	ClubsPluginCategory,
	type ClubsPluginMeta,
	type ClubsFunctionGetSlots,
} from '@devprotocol/clubs-core'
import Component from './index.astro'
import { SlotName } from '../../../src'

export const getSlots: ClubsFunctionGetSlots = async () => [
	{
		slot: SlotName.PostsEditAfterContentForm,
		component: Component,
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
