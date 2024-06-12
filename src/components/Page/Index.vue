<script lang="ts" setup>
import { i18nFactory } from '@devprotocol/clubs-core'
import Post from './Posts/Post.vue'
import Reactions from './Posts/Reactions.vue'
import Contents from './Contents/Contents.vue'
import Media from './Posts/Media.vue'
import Comment from './Posts/Comment.vue'
import { Event, type Option, type Posts } from '../../types'
import { onMounted, ref } from 'vue'
import Line from '../Common/Line.vue'
import { type ClubsProfile, decode } from '@devprotocol/clubs-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import type { Membership } from '../../types'
import { type ContractRunner, type Signer } from 'ethers'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { emojiAllowList } from '../../constants'
import { clientsProperty } from '@devprotocol/dev-kit'
import EncodedPostData from '../../components/Common/EncodedPostData.vue'
import {
	handleRegisterOnUpdateHandler,
	handleRegisterOnSetupHandler,
} from '../../plugin-helper'
import {
	filterRequiredMemberships,
	hasWritePermission,
} from '../../fixtures/memberships'
import { JsonRpcProvider } from 'ethers'
import {
	getSignature,
	getMessage,
	checkSession,
	consoleWarn,
} from '../../fixtures/session'
import { Strings } from '../../i18n'

type Props = {
	options: Option[]
	feedId: string
	propertyAddress: string
	memberships?: readonly Membership[]
	adminRolePoints: number
	emojiAllowList?: string[]
	postId?: string
	rpcUrl: string
}

const props = defineProps<Props>()
const IS_SINGLE = props.postId !== undefined
const i18nBase = i18nFactory(Strings)
let i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

let isLoading = ref<boolean>(true)
let error = ref<string>('')
let posts = ref<Posts[]>([])
let profiles = ref<{ [address: string]: ClubsProfile | undefined }>({})
let walletSigner: Signer | undefined = undefined

const walletAddress = ref<string | undefined>('')
const hasEditableRole = ref(false)
const connection = ref<typeof Connection>()

const MULTIPLY = 1000000n

const writePermission = async (
	user: string,
	provider: ContractRunner,
): Promise<boolean> => {
	const { roles } =
		props.options[0].value.find((option) => option.id === props.feedId) || {}

	return hasWritePermission({
		account: user,
		provider,
		propertyAddress: props.propertyAddress,
		memberships: props.memberships,
		roles,
	})
}

const hasAdminRole = async (
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

const testPermission = async (
	user: string,
	provider: ContractRunner,
): Promise<boolean> => {
	const membership = await writePermission(user, provider)
	const admin =
		membership === false ? await hasAdminRole(user, provider) : false

	return membership || admin
}

const handleConnection = async (signer: UndefinedOr<Signer>) => {
	let newSigner: Signer = signer as Signer
	console.log({ signer })
	if (!signer) {
		const { connection: conct } = await import(
			'@devprotocol/clubs-core/connection'
		)
		connection.value = conct
		newSigner = conct().signer.value
		console.log({ newSigner })
	}
	console.log('inside Handle Connection')
	// get wallet address
	const connectedAddress = signer
		? await signer.getAddress()
		: await newSigner.getAddress()

	walletAddress.value = connectedAddress

	if (isVerified.value) {
		const walletAddres = (await walletSigner?.getAddress()) as string
		const hash = getMessage(walletAddres)
		let sig = await getSignature(walletAddres, walletSigner as Signer)
		fetchPosts({ hash, sig })
		hasEditableRole.value = await testPermission(
			walletAddress.value,
			new JsonRpcProvider(props.rpcUrl),
		)
	}
}

const fetchPosts = async ({ hash, sig }: { hash?: string; sig?: string }) => {
	
	console.log('fetching posts')
	const query =
		hash && sig ? new URLSearchParams({ hash, sig }) : new URLSearchParams()
	const url = new URL(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/message${props.postId ? `/${props.postId}` : ''}?${query}`,
		window.location.origin,
	)

	fetch(url.toString())
		.then(async (res) => {
			if (res.status === 200) {
				console.log('post success')
				const json = (await res.json()) as {
					contents: string
					profiles: { [address: string]: ClubsProfile | undefined }
				}
				console.log({json})
				posts.value = decode<Posts[]>(json.contents)
				profiles.value = json.profiles
			}
		})
		.catch((err) => {
			console.error(err)
			error.value = i18n.value('NoPostsOnTimelineTryAgain')
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
	document.addEventListener(
		Event.RegisterOnSetupHandler,
		handleRegisterOnSetupHandler,
	)
	fetchPosts({})
	consoleWarn()
	const { connection: conct } = await import(
		'@devprotocol/clubs-core/connection'
	)
	connection.value = conct
	conct().signer.subscribe(async (signer: UndefinedOr<Signer>) => {
		if (signer) {
			const connectedAddress = await signer.getAddress()
			walletAddress.value = connectedAddress
			isVerified.value = await checkSession(connectedAddress)
			console.log('isverfied', isVerified.value)
			walletSigner = signer
			handleConnection(signer)
		}
	})
	i18n.value = i18nBase(navigator.languages)
})

const isVerified = ref(false)

const handleVerify = async () => {
	const walletAddres = (await walletSigner?.getAddress()) as string
	const hash = getMessage(walletAddres)
	let sig = await getSignature(walletAddres, walletSigner as Signer)
	fetchPosts({ hash, sig })
	//
	if (connection.value?.().signer.value) {
		isVerified.value = true
	}

	handleConnection(walletSigner)
}

const handlePostSuccess = (post: Posts) => {
	// add new post to list of posts
	posts.value = [post, ...posts.value]
	console.log(post)
}

const onPostDeleted = (id: string) => {
	posts.value = (posts.value as Posts[]).filter((post: Posts) => post.id !== id)
}
</script>

<style>
.tooltip {
	position: relative;
	display: inline-block;
}

.tooltip .tooltiptext {
	visibility: hidden;
	width: max-content;
	max-width: 200%;
	background-color: #555;
	color: #fff;
	text-align: center;
	padding: 12px 6px;
	border-radius: 16px;
	position: absolute;
	z-index: 1;
	bottom: 120%;
	left: 50%;
	margin-left: -100%;
	opacity: 0;
	transition: opacity 0.3s;
	word-wrap: break-word;
}

.tooltip .tooltiptext::after {
	content: '';
	position: absolute;
	top: 100%;
	left: 50%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
	opacity: 1;
	visibility: visible;
}
</style>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<section
			v-if="IS_SINGLE === false && hasEditableRole && walletAddress"
			class="mb-5 rounded-2xl bg-white p-5"
		>
			<Post
				:feedId="props.feedId"
				:address="walletAddress"
				:memberships="[...props.memberships]"
				:profiles="profiles"
				@post:success="handlePostSuccess"
			>
				<template v-slot:after-content-form>
					<slot name="edit:after:content-form" />
				</template>
				<template v-slot:toolbar-button>
					<slot name="edit:toolbar:button" />
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
				{{ i18n('NoPostsOnTimeline') }}
			</p>
		</div>

		<div
			v-if="isVerified === false"
			class="sticky top-0 z-10 px-5 py-5 text-right"
		>
			<button
				class="rounded-full bg-blue-600 px-6 py-2 text-white shadow-xl focus:outline-none tooltip"
				@click="handleVerify"
			>
				{{ i18n('SignIn') }}
				<span class="tooltiptext">{{ i18n('SignInExplanatoryMsg') }}</span>
			</button>
		</div>

		<!-- Timeline -->
		<article
			v-if="posts.length > 0"
			v-for="(post, key) in posts"
			:key="post.id"
			class="mb-5 grid gap-3 rounded bg-white p-5 text-black"
			:class="IS_SINGLE ? '' : 'shadow'"
		>
			<Contents
				:postId="post.id"
				:feedId="props.feedId"
				:createdBy="post.created_by"
				:date="post.created_at"
				:contents="post.content"
				:masked="post.masked ?? false"
				:memberships="
					filterRequiredMemberships({
						post: post as Posts,
						memberships: [...props.memberships] ?? [],
					})
				"
				:title="post.title"
				:profiles="profiles"
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
				:profiles="profiles"
			/>

			<EncodedPostData :post="post" />
		</article>
	</div>
</template>
