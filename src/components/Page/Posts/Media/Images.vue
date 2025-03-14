<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'
import { solidityPackedKeccak256 } from 'ethers'
import { always } from 'ramda'

type Props = {
	images: (string | null)[]
	isPost?: boolean
}
type ImageData = {
	src: string
	w: number
	h: number
	alt: string
}

interface Emits {
	'delete:image': (index: number) => void
}

const { images } = defineProps<Props>()
const galleryImages = ref<ImageData[]>()
const galleryId = computed<string>(() =>
	solidityPackedKeccak256(
		images.map(always('string')),
		images.map((src) => src ?? ''),
	).replace(/[0-9]/g, ''),
)

const emit = defineEmits<Emits>()
const handleDeleteImage = (index: number) => {
	emit('delete:image', index)
}

let psl: typeof PhotoSwipeLightbox

const initPsl = async () => {
	galleryImages.value = await Promise.all(
		images.map(async (src) => {
			const img = await new Promise<ImageData>((res) => {
				const _img = new Image()
				_img.onload = () =>
					res({ src: _img.src, w: _img.width, h: _img.height, alt: _img.alt })
				_img.src = src
			})
			return img
		}),
	)

	psl && psl.destroy()
	psl = new PhotoSwipeLightbox({
		gallery: `#${galleryId.value}`,
		children: 'a',
		pswpModule: () => import('photoswipe'),
	})
	psl.init()
}

onMounted(() => {
	initPsl()
})

watch(
	() => images,
	() => {
		initPsl()
	},
)
</script>

<template>
	<div :id="galleryId" class="flex w-full flex-wrap gap-x-1 gap-y-1">
		<span
			v-if="galleryImages"
			v-for="(image, index) in galleryImages"
			:key="image.src + image.w + image.h"
			class="relative w-[calc(50%_-_2px)] overflow-hidden bg-gray-100 only:w-full"
		>
			<a
				:data-pswp-width="image.w"
				:data-pswp-height="image.h"
				:href="image.src"
				target="_blank"
				rel="noreferrer"
			>
				<!-- image -->
				<img
					class="h-full w-full rounded object-cover"
					:src="image.src"
					:alt="image.alt"
				/>
				<!-- /image -->
			</a>
			<!-- delete media -->
			<div
				v-if="isPost"
				class="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
				aria-label="delete media"
				role="button"
				style="background-color: rgba(15, 20, 25, 0.75)"
				@click="handleDeleteImage(index)"
			>
				<svg
					viewBox="0 0 24 24"
					aria-hidden="true"
					class="h-4 w-4 fill-current text-white"
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
		</span>

		<span
			v-if="images && !galleryImages"
			v-for="image in images"
			class="block h-48 w-[calc(50%_-_2px)] animate-pulse rounded bg-gray-500/60 only:w-full"
		>
		</span>
	</div>
</template>

<style>
.pswp__item {
	background-color: black;
}
</style>
