<script lang="ts" setup>
const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<header class="mb-1 flex items-center justify-between">
		<div class="flex items-center">
			<img
				class="mr-3 h-12 w-12 rounded-full"
				:src="props.avatar"
				alt="Avatar of Aggre"
			/>
			<p class="text-base font-bold text-black">{{ props.name }}</p>
		</div>
		<p class="text-base text-gray-400">{{ props.date }}</p>
	</header>
</template>

<style scoped></style>
