<script setup lang="ts">
import { Ref, ref } from 'vue'
import { connection } from '@devprotocol/clubs-core/connection'
import { keccak256 } from 'ethers'

type Props = {
	propertyAddress: string
	images: string[]
	text: string
}

const props = defineProps<Props>()

const contents = ref('')

const onClickPost = async () => {
	const signer = connection().signer.value
	if (!signer) return
	const signerAddress = await signer.getAddress()

	const hash = await keccak256(signerAddress)
	const sig = await signer.signMessage(hash)

	// 画像アップロード
	const uploadedImageURLs = []
	const storeSelectImagesFile = props.images
	if (storeSelectImagesFile.length > 0) {
		for (const image of storeSelectImagesFile) {
			console.log('image', image)
			const imgurURL = await uploadImageToImgur(image)
			console.log('imgurURL', imgurURL)
			uploadedImageURLs.push(imgurURL)
		}
	}

	// fetchで /message.jsonをpostしてasync/awaitでレスポンスを取得する
	const response = await fetch(
		`/api/clubs-plugin-posts/${props.propertyAddress}/message`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: contents.value,
				hash,
				sig,
			}),
		},
	)

	// レスポンスをjsonに変換する
	const json = await response.json()

	// レスポンスのjsonをコンソールに表示する
	console.log(json)
}

async function uploadImageToImgur(image: File) {
	const formData = new FormData()
	formData.append('image', image)

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
