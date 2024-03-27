<script lang="ts">
	import { onSetup, onUpdate, onClickToolbar } from '../../../src/plugin-helper'

	let show = false

	onClickToolbar('edit', () => {
		show = !show
	})

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

{#if show}
	<div class="rounded bg-black/10 p-2">example-plugin added this slot</div>
{/if}
