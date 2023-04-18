<script lang="ts" setup>
const props = defineProps({
	images: {
		type: Array,
		required: true,
	},
})
</script>

<template>
  <div v-for="image in images" :key="image" class="mb-5">
		<img
	  	class="w-full rounded"
	  	:src="image"
	  	alt="Nature"
		/>
  </div>
</template>

<style scoped>

</style>
