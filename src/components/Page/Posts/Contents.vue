<script lang="ts" setup>
import dayjs from 'dayjs'
import DOMPurify from 'dompurify'
import { marked, type Renderer } from 'marked'
import { computed, onMounted, ref } from 'vue'
import { ZeroAddress } from 'ethers'

type Props = {
	propertyAddress: string
	createdBy: string
	date: Date
	contents: string
}

const props = defineProps<Props>()

const content = props.contents
	? DOMPurify.sanitize(marked.parse(props.contents))
	: undefined

type Profile = {
	avatar: string
	name: string
}

const profile = ref<Profile>({
	avatar: '',
	name: '',
})

const avatar = ref('')
const name = ref('')

onMounted(async () => {
	if (!props.createdBy || props.propertyAddress === ZeroAddress) {
		avatar.value = 'https://source.unsplash.com/100x100/?face'
		name.value = 'anonymous'
	} else {
		// fetch profile
		const fetchedProfile = await fetchProfile(props.createdBy)

		avatar.value = fetchedProfile.profile.avatar
		name.value = fetchedProfile.profile.username
	}
})

const renderer = {
	link(href: string, title: string, text: string) {
		const url = new URL(href)
		const youtube = url.host === 'youtube.com' || url.host === 'www.youtube.com'
		const v = url.searchParams.get('v')

		return youtube
			? `<iframe class="youtube aspect-video mx-auto w-full max-w-2xl rounded" src="https://www.youtube.com/embed/${v}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
			: `<a href="${href}">${text}</a>`
	},
} as Renderer

marked.use({ renderer })

const fetchProfile = async (address: string) => {
	if (address === ZeroAddress) {
		return {
			profile: {
				avatar: 'https://source.unsplash.com/100x100/?face',
				username: 'anonymous',
			},
		}
	}

	const url = new URL(
		`/api/clubs-plugin-posts/${props.propertyAddress}/profile?address=${address}`,
		window.location.origin,
	)

	return fetch(url.toString())
		.then((res) => {
			if (res.status === 200) return res.json()
			return {
				profile: {
					avatar: 'https://source.unsplash.com/100x100/?face',
					username: 'anonymous',
				},
			}
		})
		.catch((err) => {
			console.log('found error')
			console.error(err)
			return {
				profile: {
					avatar: 'https://source.unsplash.com/100x100/?face',
					username: 'anonymous',
				},
			}
		})
}
</script>

<template>
	<div class="flex items-center justify-between mb-1">
		<div class="flex items-center">
			<img
				v-if="avatar"
				class="w-12 h-12 rounded-full mr-3"
				:src="avatar"
				:alt="`Avatar of ${name}`"
			/>
			<p class="text-black text-base font-bold">{{ name }}</p>
		</div>
		<p class="text-base text-gray-400">
			{{ dayjs(props.date).format('DD MMM HH:mm') }}
		</p>
	</div>
	<div class="mb-5 text-3xl font-bold text-black" v-html="content || ''"></div>
</template>

<style scoped></style>
