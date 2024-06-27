<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ZeroAddress } from 'ethers'
import type { ClubsProfile } from '@devprotocol/clubs-core'

type Props = {
	feedId: string
	address: string
	profile: ClubsProfile | undefined
}

const props = defineProps<Props>()

const avatar = ref('')
const name = ref('')

onMounted(async () => {
	if (!props.profile || props.address === ZeroAddress) {
		name.value = truncateEthAddress(props.address)
		return
	}

	if (!props.profile) return
	const { profile } = props

	avatar.value = profile.avatar
	name.value = profile.username ?? truncateEthAddress(props.address)
})

const truncateEthAddress = (address: string) => {
	const match = address.match(
		/^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
	)
	if (!match) return address
	return `${match[1]}\u2026${match[2]}`
}

const PASSPORT_URL = `https://clubs.place/passport/${props.address}`
</script>

<template>
	<a :href="PASSPORT_URL" class="mb-2 flex w-8/12 items-center" target="_blank">
		<div
			class="mr-3 h-12 w-12 rounded-full bg-cover bg-center bg-no-repeat"
			:style="`background-image: url(${avatar})`"
		/>
		<p
			class="posts-username overflow-hidden overflow-ellipsis break-all text-base font-bold text-black"
		>
			{{ name }}
		</p>
	</a>
</template>

<style scoped>
.posts-username {
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}
</style>
