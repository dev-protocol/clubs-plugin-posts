import theme from './src/theme'
import plugin from './src/plugin'
import posts from '../src/index'
import type { ClubsPlugins } from '@devprotocol/clubs-core'

export default [
	theme,
	plugin,
	posts,
	{ meta: { id: 'devprotocol:clubs:simple-memberships' } },
] as ClubsPlugins
