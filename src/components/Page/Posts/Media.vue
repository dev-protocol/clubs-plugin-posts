<script lang="ts" setup>
import requireImage01 from '../../../assets/images/required/img01.png'
import requireImage02 from '../../../assets/images/required/img02.png'
import requireImage03 from '../../../assets/images/required/img03.png'
import Images from './Media/Images.vue'

type Props = {
	images?: {
		value: string[]
	}
	required?: boolean
}

const props = defineProps<Props>()
</script>

<template>
	<div class="mb-2 flex flex-wrap gap-x-1 gap-y-1">
		<div
			v-if="props.required"
			class="overflow-hidden bg-gray-100"
			style="width: calc(100% - 2px)"
		>
			<div
				class="max-h-96 w-full rounded bg-[url('/images/required.png')] bg-center pb-14 pt-10"
			>
				<p class="mb-8 w-full text-center text-base text-white">
					Unlock this post by becoming a member
				</p>
				<div class="flex justify-center gap-x-5">
					<img :src="requireImage01.src" class="w-32" alt="Nature" />
					<img :src="requireImage02.src" class="w-32" alt="Nature" />
					<img :src="requireImage03.src" class="w-32" alt="Nature" />
				</div>
			</div>
		</div>
		<Images v-if="props.images" :images="props.images.value" />
	</div>
</template>

<style scoped></style>
