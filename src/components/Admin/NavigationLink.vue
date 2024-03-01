<script setup lang="ts">
import { type PropType, ref } from 'vue'

type Navigation = {
	label: string
	link: {
		display: string
		path: string
	}
}

const props = defineProps({
	createNavigation: {
		type: Object as PropType<Navigation>,
		required: true,
	},
})
</script>

<template>
	<a
		class="hs-button is-large is-filled transition is-action-button w-full"
		:href="props.createNavigation.link.path"
		>{{ props.createNavigation.label }}</a
	>
</template>

<style scoped></style>
