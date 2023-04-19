<script lang="ts" setup>
import type {PropType} from 'vue';

const props = defineProps({
	images: {
		type: Object as PropType<{
			value: string[]
		}>,
		required: true,
	},
})
</script>

<template>
  <div class="mb-5 flex flex-wrap gap-y-1 gap-x-1">
		<div v-for="image in images.value" :key="image" class="bg-gray-100 overflow-hidden" style="width: calc(50% - 2px)">
			<img
	  		class="w-full rounded"
	  		:src="image"
	  		alt="Nature"
			/>
		</div>
  </div>
</template>

<style scoped>

</style>
