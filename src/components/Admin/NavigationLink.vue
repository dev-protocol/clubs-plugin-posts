<script setup lang="ts">
import type { PropType } from 'vue'

type Navigation = {
	display: string
	path: string
}

const props = defineProps({
	navigation: {
		type: Object as PropType<Navigation>,
		required: true,
	},
})
</script>

<template>
	<a
		class="hs-button is-large is-filled transition is-action-button w-full"
		:href="props.navigation.path"
		>{{ props.navigation.display }}</a
	>
</template>

<style scoped></style>
