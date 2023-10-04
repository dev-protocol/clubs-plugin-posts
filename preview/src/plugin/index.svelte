<script lang="ts">
	import { onMount } from 'svelte'
	import { onUpdate } from '../../../src/plugin-helper'

	onUpdate((post) => {
		console.log('***', post)
		return {
			...post,
			options: [
				...post.options.filter((o) => o.key !== 'x'),
				{ key: 'x', value: 'this option was added by example-plugin.' },
			],
		}
	})
	onMount(async () => {
		console.log('MOUNTED')
	})
</script>

<div class="rounded bg-black/10 p-2">example-plugin added this slot</div>
