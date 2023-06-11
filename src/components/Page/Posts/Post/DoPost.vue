<script setup lang="ts">
import {ref} from 'vue';

const contents = ref('')
const onClickPost = async () => {
	// 除隊管理はnanostoresを使う
	// https://docs.astro.build/ja/core-concepts/sharing-state/

	// 画像アップロード
	/*
	selectedImage.value = event.target.files[0];

const formData = new FormData();
formData.append('image', selectedImage.value);

fetch('https://api.imgur.com/3/image', {
	method: 'POST',
	headers: {
		Authorization: `Client-ID ${import.meta.env.PUBLIC_IMGUR_CLIENT_ID}`, // Imgur APIのクライアントIDをここに追加してください
	},
	body: formData,
})
	.then((response) => response.json())
	.then((data) => {
		imageUrl.value = data.data.link;
		console.log('imagurのレスポンス', data.data);
		console.info(imageUrl.value)
	})
	.catch((error) => {
		console.error(error);
	});

 */

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
