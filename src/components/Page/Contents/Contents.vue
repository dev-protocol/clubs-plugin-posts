<script lang="ts" setup>
import DOMPurify from 'dompurify'
import { marked, type Renderer } from 'marked'
import ContentsHead from './ContentsHead.vue'
import Mask from './Mask.vue'
import type { Membership } from '../../../types'

type Props = {
	propertyAddress: string
	createdBy: string
	date: Date
	contents: string
	masked: boolean
	memberships: Membership[]
	title: string
}

const props = defineProps<Props>()

const content = props.contents
	? DOMPurify.sanitize(marked.parse(props.contents))
	: undefined

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
</script>

<template>
	<ContentsHead
		:address="props.createdBy"
		:property-address="props.propertyAddress"
		:date="props.date"
		:title="props.title"
	/>

	<Mask v-if="props.masked" :memberships="props.memberships" />

	<div
		v-else
		class="mb-5 text-3xl font-bold text-black"
		v-html="content || ''"
	></div>
</template>

<style scoped></style>
