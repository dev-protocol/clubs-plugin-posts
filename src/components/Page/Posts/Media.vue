<script lang="ts" setup>
import type {PropType} from 'vue';

type Props = {
	images?: {
		value: string[]
	},
	required?: boolean
};

const props = defineProps<Props>()
</script>

<template>
  <div class="mb-5 flex flex-wrap gap-y-1 gap-x-1">
		<div v-if="props.required" class="bg-gray-100 overflow-hidden" style="width: calc(100% - 2px)">
			<img
	  		class="h-96 w-full rounded"
	  		src="../../../assets/images/required.png"
	  		alt="Required"
			/>
		</div>
		<div v-if="images" v-for="image in images.value" :key="image" class="bg-gray-100 overflow-hidden" style="width: calc(50% - 2px)">
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
