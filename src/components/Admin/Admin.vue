<script lang="ts" setup>
import Icon from '../../assets/images/plugin-icon.svg'
import AddFeed from './AddFeed.vue'
import type { PropType } from 'vue'
import type { ClubsPropsAdminPages } from '@devprotocol/clubs-core'

const props = defineProps({
	options: {
		type: Array as PropType<any>,
		required: true,
	},
	clubs: {
		type: Object as PropType<ClubsPropsAdminPages['clubs']>,
		required: true,
	},
})
</script>

<template>
	<div class="container mx-auto px-4">
		<h1 class="mb-4 text-3xl font-bold">Posts</h1>

		<div
			class="min-h-2xl mx-auto grid w-max justify-items-center gap-3 rounded-md bg-dp-blue-grey-300 p-3"
		>
			<p>There's nothing here yet, but will be more fun things to come...</p>
			<img
				class="rounded-md opacity-20"
				:src="Icon.src"
				:width="Icon.width"
				:height="Icon.height"
			/>
		</div>

		<AddFeed :options="props.options" />
	</div>
</template>
