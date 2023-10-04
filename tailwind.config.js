import { clubs } from '@devprotocol/clubs-core/tailwind'

export default {
	mode: 'jit',
	presets: [clubs],
	content: [...clubs.content, 'preview/src/**/*'],
}
