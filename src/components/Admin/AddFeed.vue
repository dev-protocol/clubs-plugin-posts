<script setup lang="ts">
import { type PropType, ref } from 'vue'
import type { ClubsPropsAdminPages } from '@devprotocol/clubs-core'
import { v5 as uuidv5 } from 'uuid'
import { toUtf8Bytes } from 'ethers'

const props = defineProps({
	options: {
		type: Array as PropType<any>,
		required: true,
	},
})

// props.linksの値受け取る
const feeds = ref<
	{
		id: string
		slug: string
		database: {
			type: string
			key: string
		}
	}[]
>(
	props.options.find(({ key }: { key: string }) => key === 'feeds')?.value ||
		[],
)

const slug = ref('')
const onClick = () => {
	feeds.value = feeds.value.concat([
		{
			id: '1',
			slug: slug.value,
			database: {
				type: 'documents:redis',
				key: uuidv5(
					toUtf8Bytes(slug.value),
					uuidv5('EXAMPLE_NAMESPACE', uuidv5.URL),
				), // > 16be5315-0e57-5139-bba9-71d05675856b
			},
		},
	])

	console.log('feeds', feeds.value)
}
</script>
<template>
	<div class="py-4">
		<h2 class="mb-4 text-3xl font-bold">Add Feeds</h2>
		<label class="hs-form-field is-filled mb-10 flex flex-col">
			<span class="hs-form-field__label"> Slug </span>
			<input v-model="slug" class="hs-form-field__input" placeholder="slug" />
		</label>
		<button class="hs-button bg-accent-200" @click="onClick">Add Feed</button>
	</div>
</template>
