<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ZeroAddress } from 'ethers'

type Props = {
	propertyAddress: string
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
		`/api/clubs-plugin-posts/${props.propertyAddress}/profile?address=${address}`,
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
	<div class="flex items-center w-9/12">
		<template v-if="avatar">
			<div
				class="w-12 h-12 rounded-full mr-3 bg-center bg-cover bg-no-repeat"
				:style="`background-image: url(${avatar})`"
			/>
		</template>
		<template v-else>
			<Avatar
				class="mr-3"
				:title="false"
				:size="48"
				variant="beam"
				:square="false"
			/>
		</template>
		<p class="text-black text-base font-bold overflow-hidden overflow-ellipsis">
			{{ name }}
		</p>
	</div>
</template>
