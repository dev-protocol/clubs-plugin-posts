<script setup lang="ts">
import { Ref, ref } from 'vue'
import { connection } from '@devprotocol/clubs-core/connection'
import { keccak256 } from 'ethers'
import Spinner from '../../../Spinner/Spinner.vue'
import type { Membership } from '../../../../types'
import { encode } from '@devprotocol/clubs-core'

type Props = {
	propertyAddress: string
	images: string[]
	content: string
	title: string
	selectedLimitedAccess: Membership[]
}

const props = defineProps<Props>()
const isPosting = ref(false)

const onClickPost = async () => {
	isPosting.value = true

	const signer = connection().signer.value
	if (!signer) {
		isPosting.value = false
		return
	}

	const signerAddress = await signer.getAddress()

	const hash = await keccak256(signerAddress)
	const sig = await signer.signMessage(hash)

	// 画像アップロード
	const uploadedImageURLs: string[] = []
	const storeSelectImagesFile = props.images
	if (storeSelectImagesFile.length > 0) {
		for (const image of storeSelectImagesFile) {
			const imgurURL = await uploadImageToImgur(image)
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
				contents: encode({
					title: props.title,
					content: props.content,
					options: [
						{ key: '#images', value: uploadedImageURLs },
						{
							key: '#membershipPayloads',
							value: props.selectedLimitedAccess
								.filter(({ payload }) => payload !== undefined)
								.map(({ payload }) => payload as Uint8Array),
						},
					],
				}),
				hash,
				sig,
			}),
		},
	)

	// レスポンスをjsonに変換する
	const json = await response.json()

	isPosting.value = false

	// レスポンスのjsonをコンソールに表示する
	console.log(json)
}

async function uploadImageToImgur(image: File): Promise<string> {
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
			class="flex items-center py-2 px-8 h-12 w-32 justify-center text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none"
			@click="onClickPost"
			:disabled="isPosting"
		>
			<Spinner v-if="isPosting" />
			<span v-if="!isPosting">Post</span>
		</button>
	</div>
</template>
