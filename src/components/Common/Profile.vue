<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ZeroAddress } from 'ethers'
import { Avatar } from '@boringer-avatars/vue3'

type Props = {
	feedId: string
	address: string
}

const props = defineProps<Props>()

const avatar = ref('')
const name = ref('')

onMounted(() => {
	if (!props.address || props.address === ZeroAddress) {
		name.value = props.address
		return
	}

	// fetch profile
	fetchProfile(props.address)
})

const fetchProfile = async (address: string) => {
	const url = new URL(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/profile?address=${address}`,
		window.location.origin,
	)

	return fetch(url.toString())
		.then(async (res) => {
			if (res.status !== 200) return

			const json = await res.json()

			avatar.value = json.profile.avatar
			name.value = json.profile.username ?? address
		})
		.catch((err) => {
			console.error(err)
		})
}
</script>

<template>
	<div class="flex w-8/12 items-center">
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
