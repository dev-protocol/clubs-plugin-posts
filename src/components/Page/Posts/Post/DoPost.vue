<script setup lang="ts">
import {ref} from 'vue';
import {selectImagesFile} from './PostStore';

const contents = ref('')
const onClickPost = async () => {
	// 画像アップロード
	const uploadedImageURLs = []
	const storeSelectImagesFile = selectImagesFile.get()
	if (storeSelectImagesFile.value.length > 0) {
		for (const image of storeSelectImagesFile.value) {
			const imgurURL = await uploadImageToImgur(image)
			console.log('imgurURL', imgurURL)
			uploadedImageURLs.push(imgurURL)
		}
	}

	// fetchで /message.jsonをpostしてasync/awaitでレスポンスを取得する
	const response = await fetch('/api/message.json', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			contents: contents.value,
		}),
	})

	// レスポンスをjsonに変換する
	const json = await response.json()

	// レスポンスのjsonをコンソールに表示する
	console.log(json)
}

async function uploadImageToImgur(image: File) {
	const formData = new FormData();
	formData.append('image', image);

	const response = await fetch('https://api.imgur.com/3/image', {
		method: 'POST',
		headers: {
			Authorization: `Client-ID ${import.meta.env.PUBLIC_IMGUR_CLIENT_ID}`, // Imgur APIのクライアントIDをここに追加してください
		},
		body: formData,
	})

	const json = await response.json()
	return json.data.link
}
</script>
<template>
  <div class="flex items-center">
	<button
	  class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none"
	  @click="onClickPost"
	>
	  Post
	</button>
  </div>
</template>
