import theme from './src/theme'
import sTokensViewer from '../src/index'
import type { ClubsPlugins } from '@devprotocol/clubs-core'

export default [
	theme,
	sTokensViewer,
	{ meta: { id: 'devprotocol:clubs:simple-memberships' } },
] as ClubsPlugins
