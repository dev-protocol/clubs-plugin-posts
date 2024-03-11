<script lang="ts" setup>
import Post from './Posts/Post.vue'
import Reactions from './Posts/Reactions.vue'
import Contents from './Contents/Contents.vue'
import Media from './Posts/Media.vue'
import Comment from './Posts/Comment.vue'
import { Event, type Option, type Posts } from '../../types'
import { onMounted, ref } from 'vue'
import Line from '../Common/Line.vue'
import { bytes32Hex, decode } from '@devprotocol/clubs-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import type { Membership } from '../../types'
import { type ContractRunner, hashMessage, type Signer, id } from 'ethers'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { emojiAllowList } from '../../constants'
import { clientsProperty } from '@devprotocol/dev-kit'
import EncodedPostData from '../../components/Common/EncodedPostData.vue'
import { handleRegisterOnUpdateHandler } from '../../plugin-helper'

type Props = {
	options: Option[]
	feedId: string
	propertyAddress: string
	memberships?: Membership[]
	adminRolePoints: number
	emojiAllowList?: string[]
	postId?: string
}

const props = defineProps<Props>()
const IS_SINGLE = props.postId !== undefined

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

let isLoading = ref<boolean>(true)
let error = ref<string>('')
let posts = ref<Posts[]>([])

const walletAddress = ref<string | undefined>('')
const hasEditableRole = ref(false)
const connection = ref<typeof Connection>()

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
	const hash = `Sign in as ${connectedAddress} to access secret post(s). @ts:${new Date().getTime()}`
	const sig = await signer.signMessage(hash)

	fetchPosts({ hash, sig })

	hasEditableRole.value = await testPermission(walletAddress.value, signer)
}

const fetchPosts = async ({ hash, sig }: { hash?: string; sig?: string }) => {
	const query =
		hash && sig ? new URLSearchParams({ hash, sig }) : new URLSearchParams()
	const url = new URL(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/message${props.postId ? `/${props.postId}` : ''}?${query}`,
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

onMounted(async () => {
	document.addEventListener(
		Event.RegisterOnUpdateHandler,
		handleRegisterOnUpdateHandler,
	)
	fetchPosts({})
	const { connection: conct } = await import(
		'@devprotocol/clubs-core/connection'
	)
	connection.value = conct
})

const isVerified = ref(false)

const handleVerify = async () => {
	connection.value?.().signer.subscribe(handleConnection)
	//
	if (connection.value?.().signer.value) {
		isVerified.value = true
	}
}

const handlePostSuccess = (post: Posts) => {
	// add new post to list of posts
	posts.value = [post, ...posts.value]
	console.log(post)
}

const filterRequiredMemberships = (post: Posts): Membership[] => {
	const requiredMemberships =
		(post.options.find(({ key }) => key === 'require-one-of')
			?.value as UndefinedOr<(string | Uint8Array)[]>) ?? []
	return requiredMemberships
		.map(
			(key) =>
				props.memberships?.find(
					(mem) => bytes32Hex(mem.payload ?? []) === bytes32Hex(key),
				) ?? [],
		)
		.flat()
}

const onPostDeleted = (id: string) => {
	posts.value = (posts.value as Posts[]).filter((post: Posts) => post.id !== id)
}
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<section
			v-if="IS_SINGLE === false && hasEditableRole && walletAddress"
			class="mb-5 rounded-2xl bg-white p-5"
		>
			<Post
				:feedId="props.feedId"
				:address="walletAddress"
				:memberships="props.memberships"
				@post:success="handlePostSuccess"
			>
				<template v-slot:after-content-form>
					<slot name="edit:after:content-form" />
				</template>
			</Post>
		</section>

		<!-- Loading -->
		<div v-if="isLoading" class="mb-5 flex justify-center rounded bg-white p-5">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
			></div>
		</div>

		<!-- Error -->
		<div v-if="!isLoading && error" class="mb-5 rounded bg-white p-5">
			<p class="text-center">{{ error }}</p>
		</div>

		<!-- Timeline empty -->
		<div
			v-if="!isLoading && posts.length === 0"
			class="mb-5 rounded bg-white p-5"
		>
			<p class="text-center text-black">
				Sorry, but there are no posts on this timeline yet
			</p>
		</div>

		<div
			v-if="isVerified === false"
			class="sticky top-0 z-10 px-5 py-5 text-right"
		>
			<button
				class="rounded-full bg-blue-600 px-6 py-2 text-white shadow-xl focus:outline-none"
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
			class="mb-5 grid gap-3 rounded bg-white p-5 text-black shadow"
		>
			<Contents
				:postId="post.id"
				:feedId="props.feedId"
				:createdBy="post.created_by"
				:date="post.created_at"
				:contents="post.content"
				:masked="post.masked ?? false"
				:memberships="filterRequiredMemberships(post as Posts)"
				:title="post.title"
				@post-deleted="onPostDeleted"
			>
				<template v-slot:after-post-content>
					<slot name="feed:after:post-content" />
				</template>
			</Contents>
			<Media
				v-if="!post?.masked"
				:images="post.options.find((item) => item.key === '#images')"
			/>
			<Reactions
				:feedId="props.feedId"
				:comments="post.comments"
				:reactions="post.reactions"
				:post-id="post.id"
				:emoji-allow-list="props.emojiAllowList ?? emojiAllowList"
			/>
			<Line v-if="!post?.masked" class="my-2" />
			<Comment
				v-if="!post?.masked"
				:feedId="props.feedId"
				:postId="post.id"
				:comments="post.comments"
				:hashEditableRole="hasEditableRole"
				:postOwnerAddress="post.created_by"
				:walletAddress="walletAddress"
			/>

			<EncodedPostData :post="post" />
		</article>
	</div>
</template>
