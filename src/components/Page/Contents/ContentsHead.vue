<script lang="ts" setup>
import dayjs from 'dayjs';


type Props = {
	date: Date
	avatar: string
	name: string
}

const props = defineProps<Props>()

</script>

<template>
		<div class="flex items-center justify-between mb-1">
		<div class="flex items-center">
			<div
				v-if="avatar"
				class="w-12 h-12 rounded-full mr-3 bg-center bg-cover bg-no-repeat"
				:style="`background-image: url(${avatar})`"
			/>
			<p class="text-black text-base font-bold">{{ name }}</p>
		</div>
		<p class="text-base text-gray-400">
			{{ dayjs(props.date).format('DD MMM HH:mm') }}
		</p>
	</div>
</template>
