<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ZeroAddress } from 'ethers'
import { Avatar } from '@boringer-avatars/vue3'
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
</script>

<template>
	<div class="mb-2 flex w-8/12 items-center">
		<template v-if="avatar">
			<div
				class="mr-3 h-12 w-12 rounded-full bg-cover bg-center bg-no-repeat"
				:style="`background-image: url(${avatar})`"
			/>
		</template>
		<template v-else>
			<Avatar
				class="mr-3"
				:title="false"
				:size="48"
				variant="beam"
				:name="props.address"
				:square="false"
			/>
		</template>
		<p
			class="posts-username overflow-hidden overflow-ellipsis break-all text-base font-bold text-black"
		>
			{{ name }}
		</p>
	</div>
</template>

<style scoped>
.posts-username {
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}
</style>
