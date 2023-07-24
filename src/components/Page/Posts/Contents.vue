<script lang="ts" setup>
import dayjs from 'dayjs'
import { marked } from 'marked'

const renderer = {
  link(href: string, text: string) {
    const url = new URL(href)
    const youtube = url.host === 'youtube.com' || url.host === 'www.youtube.com'
    const v = url.searchParams.get('v')

    return youtube
      ? `<iframe class="youtube aspect-video mx-auto w-full max-w-2xl rounded" src="https://www.youtube.com/embed/${v}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
      : `<a href="${href}">${text}</a>`
  },
}

marked.use({ renderer })

type Props = {
	name: string
	avatar: string
	date: Date
	contents: string
}

const props = defineProps<Props>()

const content = props.contents ? marked.parse(props.contents) : undefined
</script>

<template>
	<div class="flex items-center justify-between mb-1">
		<div class="flex items-center">
			<img
				class="w-12 h-12 rounded-full mr-3"
				:src="props.avatar"
				alt="Avatar of Aggre"
			/>
			<p class="text-black text-base font-bold">{{ props.name }}</p>
		</div>
		<p class="text-base text-gray-400">
			{{ dayjs(props.date).format('d MMM H:mm') }}
		</p>
	</div>
	<div class="mb-5 text-3xl font-bold text-black">
		{{ content ?? '' }}
	</div>
</template>

<style scoped></style>
