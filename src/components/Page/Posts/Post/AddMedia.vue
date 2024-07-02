<script setup lang="ts">
import IconPic from '../../../../assets/images/icon-pic.svg'

interface Emits {
	(e: 'upload:image', image: string): void
}

const emit = defineEmits<Emits>()
const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement

	const file = target.files ? target.files[0] : null
	if (file) {
		const reader = new FileReader()
		reader.onload = (_event) => {
			if (_event.currentTarget === null) return
			const reader = _event.currentTarget as FileReader
			const base64Text = reader.result as string
			emit('upload:image', base64Text)
		}
		reader.readAsDataURL(file)
	}

	target.value = ''
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
			class="mr-3 h-5 w-5"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="#C4C4C4"
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
			class="inline-flex cursor-pointer items-center justify-center rounded-full shadow-sm"
			type="button"
			@click="onClickImage"
		>
			<img class="w-7" :src="IconPic.src" alt="paper-airplane" />
		</button>
	</div>
</template>
