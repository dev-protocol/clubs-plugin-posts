<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
	(e: 'upload:image', image: string): void
}

const imageUrl = ref<string | null>(null)
const emit = defineEmits<Emits>()
const handleFileUpload = (event) => {
	const file = event.target.files[0]
	if (file) {
		const reader = new FileReader()
		reader.onload = () => {
			emit('upload:image', reader.result as string)
		}
		reader.readAsDataURL(file)
	}
}

// 画像ボタンを押した時の処理
const onClickImage = () => {
	// input要素を取得する
	const input = document.getElementById('image') as HTMLInputElement

	// input要素をクリックする
	input.click()
}
</script>
<template>
	<div class="flex items-center">
		<svg
			class="w-5 h-5 mr-3"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z"
				clip-rule="evenodd"
			/>
		</svg>
		<!-- 画像を選択するinput要素 -->
		<input
			id="image"
			type="file"
			accept="image/*"
			class="hidden"
			@change="handleFileUpload"
		/>
		<button
			class="inline-flex items-center justify-center rounded-full shadow-sm cursor-pointer"
			type="button"
			@click="onClickImage"
		>
			<img
				class="w-7"
				src="../../../../assets/images/icon-pic.svg"
				alt="paper-airplane"
			/>
		</button>
	</div>
</template>
