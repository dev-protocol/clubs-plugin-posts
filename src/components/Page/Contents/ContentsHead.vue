<script lang="ts" setup>
import dayjs from 'dayjs'
import Profile from '../../Common/Profile.vue'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { computed, onMounted, ref } from 'vue'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { keccak256, type Signer } from 'ethers'
import { Strings } from './i18n'
import { getSignature, getMessage } from '../../../fixtures/session'
import { i18nFactory, type ClubsProfile } from '@devprotocol/clubs-core'

const i18nBase = i18nFactory(Strings)
let i18n = i18nBase(['en'])

type Props = {
	postId: string
	date: Date
	address: string
	feedId: string
	title?: string
	contents: string
	hasEditableRole: boolean
	profiles: { [address: string]: ClubsProfile | undefined }
}

const { date, address, feedId, title, postId, contents, profiles } =
	defineProps<Props>()
const connection = ref<typeof Connection>()
const signer = ref<UndefinedOr<Signer>>()
const walletAddress = ref<string | undefined>('')
const managePostDropdownOpen = ref(false)
const singlePage = computed(() => `/posts/${feedId}/${postId}`)
const emit = defineEmits<{
	(e: 'postDeleted', id: string): void
}>()

onMounted(async () => {
	i18n = i18nBase(navigator.languages)

	const { connection: conct } = await import(
		'@devprotocol/clubs-core/connection'
	)
	connection.value = conct

	connection
		.value?.()
		.signer.subscribe(async (_signer: UndefinedOr<Signer>) => {
			if (!_signer) {
				signer.value = undefined
				return
			}

			signer.value = _signer
			const _address = await _signer.getAddress()
			walletAddress.value = _address
		})
})

const deletePost = async () => {
	const signer = (
		await import('@devprotocol/clubs-core/connection')
	).connection().signer.value
	if (!signer) {
		// isPosting.value = false
		return
	}

	// get wallet address
	const connectedAddress = await signer.getAddress()
	const hash = getMessage(connectedAddress)

	let sig = await getSignature(connectedAddress, signer)

	const response = await fetch(
		`/api/devprotocol:clubs:plugin:posts/${feedId}/message/delete`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				hash,
				sig,
				postId,
			}),
		},
	)

	if (response.status === 200) {
		emit('postDeleted', postId)
	} else {
		// @todo: error handling
	}
}

const shareOnTwitter = () => {
	const baseURI = window.location.origin
	const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
		`${title}\n\n${contents}\n\nMore on post:\n${baseURI}${singlePage.value}`,
	).replace(/%0A/g, '%0A')}`
	window.open(url, '_blank')
}

const shareOnHey = () => {
	const baseURI = window.location.origin
	const url = `https://hey.xyz/?text=${encodeURIComponent(
		`${title}\n\n${contents}\n\nMore on post: ${baseURI}${singlePage.value}`,
	).replace(/%0A/g, '%0A')}`
	window.open(url, '_blank')
}
</script>

<template>
	<div>
		<div v-if="walletAddress === address || hasEditableRole" class="flex justify-end relative">
			<button
				class="text-gray-500 font-bold rounded-full hover:bg-gray-200 w-8 h-8 flex items-center justify-center"
				v-on:click="managePostDropdownOpen = true"
			>
				<span class="-mt-2 font-bold">. . .</span>
			</button>

			<div
				v-if="managePostDropdownOpen"
				class="absolute right-0 top-2 w-48 bg-white rounded border border-gray-100 shadow-xl z-20"
			>
				<button
					v-on:click="shareOnTwitter"
					class="w-full px-2 py-1 text-left font-bold text-black"
				>
					{{ i18n('ShareOnX') }}
				</button>
				<button
					v-on:click="shareOnHey"
					class="w-full px-2 py-1 text-left font-bold text-black"
				>
					{{ i18n('ShareOnHey') }}
				</button>
				<button
					v-on:click="deletePost"
					class="w-full px-2 py-1 text-left font-bold text-orange-700"
				>
					{{ i18n('Delete') }}
				</button>
			</div>

			<!-- when clicking outside of the dropdown, close the dropdown-->
			<div
				v-if="managePostDropdownOpen"
				class="fixed inset-0 z-10"
				v-on:click="managePostDropdownOpen = false"
			/>
		</div>

		<div class="flex items-center justify-between">
			<Profile
				:address="address"
				:feedId="feedId"
				:profile="profiles[address]"
			/>
			<p class="text-center text-xs lg:text-base">
				<a
					:href="singlePage"
					class="hs-link rounded p-1 no-underline text-gray-400"
					>{{ dayjs(date).format('DD MMM HH:mm') }}</a
				>
			</p>
		</div>
	</div>
	<div v-if="title" class="text-3xl font-bold text-black">
		{{ title }}
	</div>
</template>
