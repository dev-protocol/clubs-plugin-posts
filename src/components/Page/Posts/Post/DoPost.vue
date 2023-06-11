<script setup lang="ts">
import {ref} from 'vue';

const contents = ref('')
const onClickPost = async () => {
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
