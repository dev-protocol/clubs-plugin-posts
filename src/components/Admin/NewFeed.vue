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

const onChange = () => {
	if (currentPluginIndex.value === 0) {
		return
	}

	if (slug.value === '') {
		return
	}

	// Todo onChangeでfeedsを取得すれば、setOptionsで上書きされることはないかを確認する
	let feeds: OptionsDatabase[] =
		props.options.find(({ key }: { key: string }) => key === 'feeds')?.value ||
		[]

	// Todo urlが空の確認をする
	const uuid = uuidFactory(props.url)
	feeds = feeds.concat([
		{
			id: uuid(),
			slug: slug.value,
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
		<h1 class="mb-4 text-3xl font-bold">Create New Feeds</h1>
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
