<script lang="ts" setup>
import Post from './Posts/Post.vue'
import Reactions from './Posts/Reactions.vue'
import Contents from './Posts/Contents.vue'
import Media from './Posts/Media.vue'
import Comment from './Posts/Comment.vue'
import type { Option, Posts } from '../../types'
import { onMounted, ref } from 'vue'
import Line from '../Common/Line.vue'
import { decode } from '@devprotocol/clubs-core'
import Connect from '../../../preview/src/theme/Connect.vue'
import { connection } from '@devprotocol/clubs-core/connection'

type Props = {
	options: Option[]
	propertyAddress: string
	memberships: {
		id: string
		name: string
		description: string
		price: 3
		currency: string
		imageSrc: string
		payload: Uint8Array
	}[]
}

const props = defineProps<Props>()

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

let isLoading = ref<boolean>(true)
let error = ref<string>('')
let posts = ref<Posts[]>([])

const walletAddress = ref<string | undefined>('')
const handleWalletAddress = (address?: string) => {
	walletAddress.value = address
}

onMounted(() => {
	// Postsの取得
	const params = {
		hash: '0x100000',
		sig: '0x200000',
	}
	const query = new URLSearchParams(params)
	const url = new URL(
		`/api/clubs-plugin-posts/${props.propertyAddress}/message?${query}`,
		window.location.origin,
	)

	fetch(url.toString())
		.then(async (res) => {
			if (res.status === 200) {
				const json = await res.json()
				posts.value = decode(json.contents)
			}
		})
		.catch((err) => {
			console.error(err)
			error.value =
				'Sorry, but there was an error loading the timeline. Please try again later.'
		})
		.finally(() => {
			isLoading.value = false
		})

	connection().account.subscribe(handleWalletAddress)
})
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<section
			v-if="!walletAddress"
			class="flex justify-end p-5 rounded bg-white"
		>
			<Connect />
		</section>
		<section v-else class="mb-5 p-5 rounded bg-white">
			<Post
				avatar="https://source.unsplash.com/100x100/?face"
				name="Aggre"
				:propertyAddress="props.propertyAddress"
			/>
		</section>

		<!-- Loading -->
		<div v-if="isLoading" class="flex justify-center mb-5 p-5 rounded bg-white">
			<div
				class="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"
			></div>
		</div>

		<!-- Error -->
		<div v-if="!isLoading && error" class="mb-5 p-5 rounded bg-white">
			<p class="text-center">{{ error }}</p>
		</div>

		<!-- Timeline empty -->
		<div
			v-if="!isLoading && posts.length === 0"
			class="mb-5 p-5 rounded bg-white"
		>
			<p class="text-center">
				Sorry, but there are no posts on this timeline yet
			</p>
		</div>

		<!-- Timeline -->
		<article
			v-if="posts.length > 0"
			v-for="(post, key) in posts"
			:key="post.id"
			class="mb-5 p-5 rounded bg-white"
		>
			<div
				v-if="
					post.options.find((item) => item.key === 'require-one-of') ===
					undefined
				"
			>
				<Contents
					avatar="https://source.unsplash.com/100x100/?face"
					name="Aggre"
					:date="post.created_at"
					:contents="post.content"
				/>
				<Media :images="post.options.find((item) => item.key === '#images')" />
				<Reactions :comments="post.comments" />
				<Line class="mb-5" />
				<Comment
					avatar="https://source.unsplash.com/100x100/?face"
					name="Roxy"
					:comments="post.comments"
				/>
			</div>
			<div v-else>
				<Contents
					avatar="https://source.unsplash.com/100x100/?face"
					name="Aggre"
					:date="post.created_at"
					:contents="post.content"
				/>
				<Media :required="true" />
				<Reactions :comments="post.comments" />
			</div>
		</article>
	</div>
</template>
