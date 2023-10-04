<script lang="ts">
	import { onMount } from 'svelte'
	import { currentPost } from '../../../src/plugin-helper'
	import type { Posts } from '../../../src'

	let self: HTMLElement
	let post: Posts | undefined

	onMount(() => {
		currentPost((data) => {
			console.log('* currentPost', data)
			post = data
		}, self)
	})
</script>

<div bind:this={self} class="rounded bg-black/10 p-2">
	example-plugin added this slot: <b>post id</b> = {post?.id}, <b>masked</b> = {post?.masked}
</div>
