<script setup lang="ts">
import { onMounted, type PropType, ref } from 'vue'
import { type ClubsPropsAdminPages, setOptions } from '@devprotocol/clubs-core'
import { v5 as uuidv5 } from 'uuid'
import { ethers, toUtf8Bytes } from 'ethers'
import { uuidFactory } from '../../db/uuidFactory.ts'

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

console.log('url', props)

const currentPluginIndex = ref(props.clubs?.currentPluginIndex || 0)

const slug = ref('')

const onChange = () => {
	if (currentPluginIndex.value === 0) {
		return
	}

	if (slug.value === '') {
		return
	}

	// props.linksの値受け取る
	let feeds: {
		id: string
		slug: string
		database: {
			type: string
			key: string
		}
	}[] =
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
		<h1 class="mb-4 text-3xl font-bold">New Feeds</h1>
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
