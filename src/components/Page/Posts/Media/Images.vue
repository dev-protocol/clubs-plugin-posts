<script setup lang="ts">
import type { Ref } from 'vue'

type Props = {
	images: string[]
	isPost: {
		type: BooleanConstructor
		default: false
	}
}

interface Emits {
	'delete:image': (index: number) => void
}

const { images } = defineProps<Props>()
const emit = defineEmits<Emits>()
const handleDeleteImage = (index: number) => {
	emit('delete:image', index)
}
</script>

<template>
	<div
		v-if="images"
		v-for="(image, index) in images"
		:key="image"
		class="relative bg-gray-100 overflow-hidden"
		:style="{ width: images.length === 1 ? '100%' : 'calc(50% - 2px)' }"
	>
		<!-- image -->
		<img class="w-full rounded" :src="image" alt="Nature" />
		<!-- /image -->
		<!-- delete media -->
		<div
			v-if="isPost"
			class="rounded-full absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer"
			aria-label="delete media"
			role="button"
			style="background-color: rgba(15, 20, 25, 0.75)"
			@click="handleDeleteImage(index)"
		>
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				class="w-4 h-4 text-white fill-current"
			>
				<g>
					<path
						class="text-white"
						d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"
					></path>
				</g>
			</svg>
		</div>
		<!-- /delete media -->
	</div>
</template>

<style scoped></style>
