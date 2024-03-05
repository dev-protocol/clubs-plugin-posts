<script lang="ts" setup>
import type { PropType } from 'vue'
import type { OptionsDatabase } from '../../types.ts'

const props = defineProps({
	options: {
		type: Array as PropType<any>,
		required: true,
	},
})

const feeds: OptionsDatabase[] =
	props.options.find(({ key }: { key: string }) => key === 'feeds')?.value || []
</script>

<template>
	<div class="container mx-auto px-4">
		<h1 class="mb-4 text-3xl font-bold">Feed List</h1>

		<ul class="flex flex-col gap-3 max-w-md">
			<li
				v-for="feed in feeds"
				class="flex justify-between items-center p-3 rounded bg-surface-400"
			>
				<p class="text-xl font-medium">
					{{ feed.slug }}
				</p>
				<a
					class="hs-button is-medium is-filled"
					:href="`/admin/posts/edit/${feed.id}`"
					>Edit</a
				>
			</li>
		</ul>
	</div>
</template>
