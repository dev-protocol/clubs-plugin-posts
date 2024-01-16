<script lang="ts" setup>
import dayjs from 'dayjs'
import Profile from '../../Common/Profile.vue'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMounted, ref } from 'vue'
import type { UndefinedOr } from '@devprotocol/util-ts'
import type { Signer } from 'ethers'

type Props = {
	date: Date
	address: string
	feedId: string
	title?: string
}

const { date, address, feedId, title } = defineProps<Props>()
const connection = ref<typeof Connection>()
const walletAddress = ref<string | undefined>('')
const managePostDropdownOpen = ref(false)

onMounted(async () => {
	const { connection: conct } = await import(
		'@devprotocol/clubs-core/connection'
	)
	connection.value = conct

	connection.value?.().signer.subscribe(async (signer: UndefinedOr<Signer>) => {
		if (!signer) {
			return
		}

		const _address = await signer.getAddress()
		walletAddress.value = _address
	})
})

const deletePost = () => {
	console.log('delete post hit!')
}
</script>

<template>
	<div>
		<div v-if="walletAddress === address" class="flex justify-end relative">
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
					v-on:click="deletePost"
					class="w-full px-2 py-1 text-left font-bold text-orange-700"
				>
					Delete
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
			<Profile :address="address" :feedId="feedId" />
			<p class="text-center text-xs text-gray-400 lg:text-base">
				{{ dayjs(date).format('DD MMM HH:mm') }}
			</p>
		</div>
	</div>
	<div v-if="title" class="text-3xl font-bold text-black">
		{{ title }}
	</div>
</template>
