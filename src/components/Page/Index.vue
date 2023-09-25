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
import { type ContractRunner, hashMessage, type Signer } from 'ethers'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { emojiAllowList } from '../../constants'
import { clientsProperty } from '@devprotocol/dev-kit'

type Props = {
	options: Option[]
	feedId: string
	propertyAddress: string
	memberships?: Membership[]
	adminRolePoints: number
}

const props = defineProps<Props>()

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

let isLoading = ref<boolean>(true)
let error = ref<string>('')
let posts = ref<Posts[]>([])

const walletAddress = ref<string | undefined>('')
const hasEditableRole = ref(false)

const MULTIPLY = 1000000n
const testPermission = async (
	user: string,
	provider: ContractRunner,
): Promise<boolean> => {
	const [a, b] = await clientsProperty(provider, props.propertyAddress)
	const [balance, totalSupply] = await Promise.all([
		whenDefined(a ?? b, (client) => client.balanceOf(user)),
		whenDefined(a ?? b, (client) => client.totalSupply()),
	])
	const share =
		(BigInt(balance ?? 0) * MULTIPLY) /
		BigInt(totalSupply ?? '10000000000000000000000000')
	const expected = (BigInt(props.adminRolePoints) * MULTIPLY) / 100n
	return share >= expected
}

const handleConnection = async (signer: UndefinedOr<Signer>) => {
	if (!signer) {
		return
	}

	// get wallet address
	const connectedAddress = await signer.getAddress()
	// const connectedAddress = '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526'
	walletAddress.value = connectedAddress

	// sign message
	const hash = hashMessage(connectedAddress)
	const sig = await signer.signMessage(hash)

	fetchPosts({ hash, sig })

	hasEditableRole.value = await testPermission(walletAddress.value, signer)
}

const fetchPosts = async ({ hash, sig }: { hash?: string; sig?: string }) => {
	const query =
		hash && sig ? new URLSearchParams({ hash, sig }) : new URLSearchParams()
	const url = new URL(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/message?${query}`,
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
})

const isVerified = ref(false)

const handleVerify = async () => {
	connection().signer.subscribe(handleConnection)
	//
	if (connection().signer.value) {
		isVerified.value = true
	}
}

const handlePostSuccess = (post: Posts) => {
	// add new post to list of posts
	posts.value = [post, ...posts.value]
	console.log(post)
}
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<section
			v-if="hasEditableRole && walletAddress"
			class="mb-5 p-5 rounded-2xl bg-white"
		>
			<Post
				:feedId="props.feedId"
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
			<p class="text-center text-black">
				Sorry, but there are no posts on this timeline yet
			</p>
		</div>

		<div
			v-if="posts.length > 0 && isVerified === false"
			class="sticky top-0 py-5 px-5 text-right z-10"
		>
			<button
				class="py-2 px-6 text-white bg-blue-600 rounded-full shadow-xl focus:outline-none"
				@click="handleVerify"
			>
				Sign in
			</button>
		</div>

		<!-- Timeline -->
		<article
			v-if="posts.length > 0"
			v-for="(post, key) in posts"
			:key="post.id"
			class="mb-5 p-5 rounded bg-white shadow"
		>
			<Contents
				:feedId="props.feedId"
				:createdBy="post.created_by"
				:date="post.created_at"
				:contents="post.content"
				:masked="post.masked ?? false"
				:memberships="props.memberships ?? []"
				:title="post.title"
			/>
			<Media
				v-if="!post?.masked"
				:images="post.options.find((item) => item.key === '#images')"
			/>
			<Reactions
				:feedId="props.feedId"
				:comments="post.comments"
				:reactions="post.reactions"
				:post-id="post.id"
				:emoji-allow-list="emojiAllowList"
			/>
			<Line v-if="!post?.masked" class="my-5" />
			<Comment
				v-if="!post?.masked"
				:feedId="props.feedId"
				:postId="post.id"
				:comments="post.comments"
			/>
		</article>
	</div>
</template>
