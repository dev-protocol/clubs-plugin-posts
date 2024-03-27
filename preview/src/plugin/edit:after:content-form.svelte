<script lang="ts">
	import { onSetup, onUpdate } from '../../../src/plugin-helper'

	onUpdate((post) => {
		console.log('onUpdate', post)
		return {
			...post,
			options: [
				...post.options.filter((o) => o.key !== 'x'),
				{ key: 'x', value: 'this option was added by example-plugin.' },
			],
		}
	})

	onSetup((post) => {
		console.log('onSetup', post)
		return {
			...post,
			options: [
				...post.options.filter((o) => o.key !== 'setup'),
				{ key: 'setup', value: 'this option was added by example-plugin.' },
			],
		}
	})
</script>

<div class="rounded bg-black/10 p-2">example-plugin added this slot</div>
