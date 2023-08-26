<script lang="ts" setup>
import Post from './Posts/Post.vue'
import Reactions from './Posts/Reactions.vue'
import Contents from './Contents/Contents.vue'
import Media from './Posts/Media.vue'
import Comment from './Posts/Comment.vue'
import type { Option, Posts } from '../../types'
import { onMounted, ref } from 'vue'
import Line from '../Common/Line.vue'
import { decode } from '@devprotocol/clubs-core'
import { connection } from '@devprotocol/clubs-core/connection'
import type { Membership } from '../../types'
import { hashMessage, Signer } from 'ethers'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { emojiAllowList } from '../../constants'

type Props = {
	options: Option[]
	propertyAddress: string
	memberships?: Membership[]
}

const props = defineProps<Props>()

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

let isLoading = ref<boolean>(true)
let error = ref<string>('')
let posts = ref<Posts[]>([])

const walletAddress = ref<string | undefined>('')

const handleConnection = async (signer: UndefinedOr<Signer>) => {
	if (!signer) {
		return
	}

	// get wallet address
	const connectedAddress = await signer.getAddress()
	// const connectedAddress = '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526'
	walletAddress.value = connectedAddress

	// sign message
	const message = connectedAddress
	const sig = await signer.signMessage(message)

	// hash message
	const hash = hashMessage(message)

	fetchPosts({ hash, sig })
}

const fetchPosts = async ({ hash, sig }: { hash?: string; sig?: string }) => {
	const query =
		hash && sig ? new URLSearchParams({ hash, sig }) : new URLSearchParams()
	const url = new URL(
		`/api/clubs-plugin-posts/${props.propertyAddress}/message?${query}`,
		window.location.origin,
	)

	fetch(url.toString())
		.then(async (res) => {
			if (res.status === 200) {
				const json = await res.json()
				posts.value = decode<Posts[]>(json.contents)
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
}

onMounted(() => {
	fetchPosts({})
	connection().signer.subscribe(handleConnection)
})

const handlePostSuccess = (post: Posts) => {
	// add new post to list of posts
	posts.value = [post, ...posts.value]
	console.log(post)
}
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<section v-if="walletAddress" class="mb-5 p-5 rounded bg-white">
			<Post
				:propertyAddress="props.propertyAddress"
				:address="walletAddress"
				:memberships="props.memberships"
				@post:success="handlePostSuccess"
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
			<Contents
				:propertyAddress="props.propertyAddress"
				:createdBy="post.created_by"
				:date="post.created_at"
				:contents="post.content"
				:masked="post.masked ?? false"
				:memberships="props.memberships ?? []"
			/>
			<Media
				v-if="!post?.masked"
				:images="post.options.find((item) => item.key === '#images')"
			/>
			<Reactions
				:comments="post.comments"
				:reactions="post.reactions"
				:post-id="post.id"
				:emoji-allow-list="emojiAllowList"
			/>
			<Line v-if="!post?.masked" class="mb-5" />
			<Comment
				v-if="!post?.masked"
				:postId="post.id"
				avatar="https://source.unsplash.com/100x100/?face"
				name="Roxy"
				:comments="post.comments"
			/>
		</article>
	</div>
</template>
