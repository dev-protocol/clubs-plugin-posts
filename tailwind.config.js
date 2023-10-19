import { tailwindPreset as clubs } from '@devprotocol/clubs-core'
import typography from '@tailwindcss/typography'

export default {
	mode: 'jit',
	presets: [clubs],
	content: [...clubs.content, 'preview/src/**/*'],
	plugins: [typography],
}
