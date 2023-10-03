<script lang="ts" setup>
const props = defineProps({
	class: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<div :class="props.class">
		<hr class="border-gray-300" />
	</div>
</template>
