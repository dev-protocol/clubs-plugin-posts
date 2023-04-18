<script lang="ts" setup>
const props = defineProps({
	likes: {
		type: Number,
		required: true,
	},
})
</script>

<template>
  <div class="flex justify-between mb-5">
		<div class="flex items-center">
	  	<span class="mr-1 text-gray-400 text-4xl">👍</span>{{ props.likes }}
		</div>
  </div>
</template>

<style scoped>

</style>
