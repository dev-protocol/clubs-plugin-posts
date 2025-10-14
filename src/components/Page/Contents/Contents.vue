<script lang="ts" setup>
import DOMPurify from 'dompurify'
import { marked, type Renderer, type Tokens } from 'marked'
import ContentsHead from './ContentsHead.vue'
import Mask from './Mask.vue'
import type { Membership } from '../../../types'
import { computed, ref } from 'vue'
import { ProseTextInherit, type ClubsProfile } from '@devprotocol/clubs-core'
import { tryCatch } from 'ramda'

type Props = {
	postId: string
	feedId: string
	createdBy: string
	date: Date
	contents: string
	masked: boolean
	memberships: readonly Membership[]
	requireAnyOffered?: boolean
	title: string
	hasEditableRole: boolean
	profiles: { [address: string]: ClubsProfile | undefined }
	base: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'postDeleted', id: string): void }>()

const content = computed<string | undefined>(() =>
	props.contents
		? DOMPurify.sanitize(marked.parse(props.contents, { async: false }))
		: undefined,
)

const renderer = {
	link(href: Tokens.Link) {
		return tryCatch(
			(H: Tokens.Link) => {
				const url = new URL(H.href)
				const youtube =
					url.host === 'youtube.com' || url.host === 'www.youtube.com'
				const v = url.searchParams.get('v')

				return youtube
					? `<iframe class="youtube aspect-video mx-auto w-full max-w-2xl rounded" src="https://www.youtube.com/embed/${v}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
					: `<a href="${H.href}">${H.text}</a>`
			},
			() => href.text,
		)(href)
	},
} as unknown as Renderer

marked.use({ renderer })
</script>

<template>
	<ContentsHead
		:postId="props.postId"
		:address="props.createdBy"
		:feedId="props.feedId"
		:date="props.date"
		:title="props.title"
		:contents="props.contents"
		:profiles="props.profiles"
		:hasEditableRole="props.hasEditableRole"
		:base="props.base"
		@post-deleted="$emit('postDeleted', props.postId)"
	/>

	<div
		v-if="!props.masked"
		class="prose prose-lg mb-2"
		:class="ProseTextInherit"
		v-html="content || ''"
	></div>

	<slot name="after-post-content" />

	<Mask
		v-if="props.masked"
		:memberships="props.memberships"
		:any="props.requireAnyOffered"
	/>
</template>

<style scoped></style>
