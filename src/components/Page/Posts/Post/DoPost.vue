<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { keccak256 } from 'ethers'
import Spinner from '../../../Spinner/Spinner.vue'
import type { PostPrimitives, Posts } from '../../../../types'
import { encode, decode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'
import {
	update as callUpdate,
	dispatchPostCreated,
} from '../../../../plugin-helper'
import { Strings } from '../i18n'
import { i18nFactory } from '@devprotocol/clubs-core'

const i18nBase = i18nFactory(Strings)
let i18n = i18nBase(['en'])

type Props = {
	feedId: string
	images: string[]
	post: PostPrimitives
}

interface Emits {
	(e: 'post:success', post: Posts): void
}

onMounted(() => {
	i18n = i18nBase(navigator.languages)
})

const props = defineProps<Props>()
const isPosting = ref(false)

const emit = defineEmits<Emits>()

const onClickPost = async () => {
	isPosting.value = true

	const signer = (
		await import('@devprotocol/clubs-core/connection')
	).connection().signer.value
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

	const IMAGES = '#images'
	const post = {
		...props.post,
		options: [
			...props.post.options.filter(({ key }) => key !== IMAGES),
			{
				key: IMAGES,
				value: uploadedImageURLs,
			},
		],
	}
	const newPost = await callUpdate(post)

	// fetchで /message.jsonをpostしてasync/awaitでレスポンスを取得する
	const response = await fetch(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/message`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: encode(newPost),
				hash,
				sig,
			}),
		},
	)

	// レスポンスをjsonに変換する
	const json = await response.json()
	const composedPost = whenDefined(json.data, (data) => decode<Posts>(data))

	isPosting.value = false

	// レスポンスのjsonをコンソールに表示する
	console.log(json)

	// 終了のemit
	composedPost && emit('post:success', composedPost)
	composedPost && dispatchPostCreated(composedPost)
}

async function uploadImageToImgur(image: string): Promise<string> {
	const formData = new FormData()

	formData.append('image', image.replace(new RegExp('data.*base64,'), ''))
	formData.append('type', 'base64')

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
			class="flex h-12 w-32 items-center justify-center rounded-3xl border border-transparent bg-blue-600 px-8 py-2 text-white shadow-sm focus:outline-none"
			@click="onClickPost"
			:disabled="isPosting"
		>
			<Spinner v-if="isPosting" />
			<span v-if="!isPosting">{{ i18n('Post') }}</span>
		</button>
	</div>
</template>
