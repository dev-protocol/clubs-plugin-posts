<script lang="ts" setup>
import requireImage01 from '../../../assets/images/required/img01.png'
import requireImage02 from '../../../assets/images/required/img02.png'
import requireImage03 from '../../../assets/images/required/img03.png'

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
			<div
				class="pt-10 pb-14 max-h-96 w-full rounded bg-[url('/images/required.png')] bg-center"
			>
				<p class="mb-8 w-full text-center text-white text-base">Unlock this post by becoming a member</p>
				<div class="flex justify-center gap-x-5">
					<img :src="requireImage01" class="w-32" alt="Nature" />
					<img :src="requireImage02" class="w-32" alt="Nature" />
					<img :src="requireImage03" class="w-32" alt="Nature" />
				</div>
			</div>
		</div>
		<div
			v-if="images"
			v-for="image in images.value" :key="image"
			class="bg-gray-100 overflow-hidden"
			:style="{ width: images.value.length === 1 ? '100%' : 'calc(50% - 2px)' }"
		>
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
