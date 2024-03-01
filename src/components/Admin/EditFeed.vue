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
	slug: {
		type: String as PropType<string>,
		required: true,
	},
	title: {
		type: String as PropType<string>,
		required: true,
	},
})

const currentPluginIndex = ref(props.clubs?.currentPluginIndex || 0)
const slug = ref(props.slug)
const title = ref(props.title)

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
				title: title.value,
			}
		}
		return feed
	})

	setOptions([{ key: 'feeds', value: feeds }], currentPluginIndex.value)
}
</script>
<template>
	<div class="py-4">
		<h1 class="mb-2 text-3xl font-bold">Edit Feeds</h1>
		<p class="mb-6">You can change the settings of the Feed</p>
		<div class="flex flex-col gap-2">
			<label class="hs-form-field is-filled flex flex-col">
				<span class="hs-form-field__label"> Slug </span>
				<input
					v-model="slug"
					class="hs-form-field__input"
					placeholder="slug"
					@change="onChange"
				/>
			</label>

			<label class="hs-form-field is-filled flex flex-col">
				<span class="hs-form-field__label"> Title </span>
				<input
					v-model="title"
					class="hs-form-field__input"
					placeholder="title"
					@change="onChange"
				/>
			</label>
		</div>
	</div>
</template>
