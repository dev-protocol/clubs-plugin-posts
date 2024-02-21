<script setup lang="ts">
import { type PropType, ref } from 'vue'
import { type ClubsPropsAdminPages, setOptions } from '@devprotocol/clubs-core'
import type { OptionsDatabase } from '../../types.ts'

const props = defineProps({
	options: {
		type: Array as PropType<any>,
		required: true,
	},
	clubs: {
		type: Object as PropType<ClubsPropsAdminPages['clubs']>,
		required: true,
	},
	url: {
		type: String as PropType<string>,
		required: true,
	},
	feedId: {
		type: String as PropType<string>,
		required: true,
	},
})

const currentPluginIndex = ref(props.clubs?.currentPluginIndex || 0)
const slug = ref(props.feedId)

const onChange = () => {
	if (currentPluginIndex.value === 0) {
		return
	}

	if (slug.value === '') {
		return
	}

	let feeds: OptionsDatabase[] =
		props.options.find(({ key }: { key: string }) => key === 'feeds')?.value ||
		[]

	feeds = feeds.map((feed) => {
		if (feed.id === props.feedId) {
			return {
				...feed,
				slug: slug.value,
			}
		}
		return feed
	})

	setOptions([{ key: 'feeds', value: feeds }], currentPluginIndex.value)
}
</script>
<template>
	<div class="py-4">
		<h1 class="mb-8 text-3xl font-bold">Edit Feeds</h1>
		<label class="hs-form-field is-filled mb-10 flex flex-col">
			<span class="hs-form-field__label"> Slug </span>
			<input
				v-model="slug"
				class="hs-form-field__input"
				placeholder="slug"
				@change="onChange"
			/>
		</label>
	</div>
</template>
