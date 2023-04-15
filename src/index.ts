import {
	ClubsFunctionGetAdminPaths,
	ClubsFunctionGetPagePaths,
	ClubsFunctionPlugin,
	ClubsPluginCategory,
	ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Admin } from './pages/Admin.astro'
import Posts from './pages/Posts.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (options) => {
	return [
				{
					paths: [''],
					component: Posts,
					props: { options }
				},
		  ]

}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (options) => {
	return [
		{
			paths: ['posts'],
			component: Admin,
			props: { options }
		}
		]
}

export const meta: ClubsPluginMeta = {
	id: 'clubs-plugin-posts',
	displayName: 'Clubs Posts',
	category: ClubsPluginCategory.Uncategorized,
}

export default {
	getPagePaths,
	getAdminPaths,
	meta,
} as ClubsFunctionPlugin
