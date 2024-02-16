<script lang="ts" setup>
import type { PropType } from 'vue'
import type { OptionsDatabase } from '../../types.ts'

const props = defineProps({
	options: {
		type: Array as PropType<any>,
		required: true,
	},
})

// Todo feedsの値受け取る
const feeds: OptionsDatabase[] =
	props.options.find(({ key }: { key: string }) => key === 'feeds')?.value || []

// clickしたら/admin/posts/edit/:idに遷移する
const onClickEdit = (id: string) => {}
</script>

<template>
	<div class="container mx-auto px-4">
		<h1 class="mb-4 text-3xl font-bold">Feed List</h1>

		<ul class="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
			<li
				v-for="feed in feeds"
				class="flex justify-between items-center pb-3 sm:pb-4"
			>
				<p class="text-xl font-medium">
					{{ feed.slug }}
				</p>
				<button class="hs-button is-medium is-filled">Edit</button>
			</li>
		</ul>
	</div>
</template>
