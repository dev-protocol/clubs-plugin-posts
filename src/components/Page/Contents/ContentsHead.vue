<script lang="ts" setup>
import dayjs from 'dayjs'
import Profile from '../../Common/Profile.vue'

type Props = {
	date: Date
	address: string
	feedId: string
	title?: string
}

const { date, address, feedId, title } = defineProps<Props>()
</script>

<template>
	<div class="flex items-center justify-between mb-3">
		<Profile :address="address" :feedId="feedId" />
		<p class="text-base text-gray-400">
			{{ dayjs(date).format('DD MMM HH:mm') }}
		</p>
	</div>
	<div v-if="title" class="mb-3 text-3xl font-bold text-black">
		{{ title }}
	</div>
</template>
