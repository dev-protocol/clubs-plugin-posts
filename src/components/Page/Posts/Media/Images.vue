<script setup lang="ts">
type Props = {
	images: any
}

const { images } = defineProps<Props>()

</script>

<template>
  <div
	v-if="images"
	v-for="image in images" :key="image"
	class="bg-gray-100 overflow-hidden"
	:style="{ width: images.length === 1 ? '100%' : 'calc(50% - 2px)' }"
  >
		<img
	  	class="w-full rounded"
	  	:src="image"
	  	alt="Nature"
		/>
  </div>
</template>

<style scoped>

</style>
