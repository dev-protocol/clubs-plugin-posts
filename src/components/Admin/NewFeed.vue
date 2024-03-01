<script setup lang="ts">
import { type PropType, ref } from 'vue'
import { type ClubsPropsAdminPages, setOptions } from '@devprotocol/clubs-core'
import { uuidFactory } from '../../db/uuidFactory.ts'
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
})

const currentPluginIndex = ref(props.clubs?.currentPluginIndex || 0)

const slug = ref('')
const title = ref('')

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

	// feedsに同じslugがある場合は登録できない
	// Todo: 引っかかった時の処理を追加する
	if (feeds.some((feed) => feed.slug === slug.value)) {
		return
	}

	const uuid = uuidFactory(props.url)
	feeds = feeds.concat([
		{
			id: uuid(),
			slug: slug.value,
			title: title.value,
			database: {
				type: 'documents:redis',
				key: uuid(),
			},
		},
	])

	setOptions([{ key: 'feeds', value: feeds }], currentPluginIndex.value)
}
</script>
<template>
	<div class="py-4">
		<h1 class="mb-2 text-3xl font-bold">Create New Feeds</h1>
		<p class="mb-6">Please enter the following to add a new feed</p>
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
