<script lang="ts" setup>
import dayjs from 'dayjs'
import {
	ProseTextInherit,
	decode,
	encode,
	type ClubsProfile,
} from '@devprotocol/clubs-core'
import { ref } from 'vue'
import Profile from '../../Common/Profile.vue'
import type { Comment, CommentPrimitives } from '../../../types'
import IconSend from '../../../assets/images/icon-send.svg'
import IconTrash from '../../../assets/images/icon-trash.svg'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

type Props = {
	feedId: string
	postId: string
	comments: readonly Comment[]
	hashEditableRole: boolean
	postOwnerAddress: string
	walletAddress: string
	profiles: { [address: string]: ClubsProfile | undefined }
}
const props = defineProps<Props>()
const newComment = ref<string>('')
const isCommenting = ref<boolean>(false)
const isDeleting = ref<Readonly<{ [commentId: string]: boolean }>>({})

const comments = ref<readonly Comment[]>(props.comments)
const profiles = ref<{ [address: string]: ClubsProfile | undefined }>(
	props.profiles,
)

const htmlComment = (content: string) =>
	DOMPurify.sanitize(marked.parse(content))

const postComment = async () => {
	isCommenting.value = true

	const signer = (
		await import('@devprotocol/clubs-core/connection')
	).connection().signer.value
	if (!signer) {
		// TODO: add state for failure.
		isCommenting.value = false
		return
	}

	const comment: CommentPrimitives = {
		content: newComment.value,
		options: [],
	}
	const hash = encode(comment)
	let sig: string = ''
	try {
		sig = await signer.signMessage(hash)
	} catch (error) {
		// TODO: add state for failure.
		isCommenting.value = false
		return
	}

	if (!sig) {
		// TODO: add state for failure.
		isCommenting.value = false
		return
	}

	const requestInfo = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: props.postId,
			hash: hash,
			sig: sig,
			contents: hash,
		}),
	}

	let response: Response
	try {
		response = await fetch(
			`/api/devprotocol:clubs:plugin:posts/${props.feedId}/comment`,
			requestInfo,
		)

		const json = await response.json()

		const success = response.ok ? json?.message || false : false
		if (!success) {
			console.error('error posting comment: ', response)
			return
		}

		const toPush = Object.freeze({
			content: comment.content,
			created_at: Date.now(),
			updated_at: Date.now(),
			id: (decode(json?.data || '') as Comment)?.id || '',
			created_by: await signer.getAddress(),
			options: {},
		})

		// push new comment to comments array.
		// @ts-ignore
		comments.value = [...comments.value, toPush]

		newComment.value = ''
	} catch (error) {
		console.error('error posting comment: ', error)
	} finally {
		isCommenting.value = false
	}
}

const deleteComment = async (commentId: string) => {
	isDeleting.value = {
		...isDeleting.value,
		[commentId]: true,
	}

	const signer = (
		await import('@devprotocol/clubs-core/connection')
	).connection().signer.value
	if (!signer) {
		// TODO: add state for failure.
		isDeleting.value = {
			...isDeleting.value,
			[commentId]: false,
		}
		return
	}

	const hash = encode('Deleting comment: ' + commentId)
	let sig: string = ''
	try {
		sig = await signer.signMessage(hash)
	} catch (error) {
		// TODO: add state for failure.
		isDeleting.value = {
			...isDeleting.value,
			[commentId]: false,
		}
		return
	}

	if (!sig) {
		// TODO: add state for failure.
		isDeleting.value = {
			...isDeleting.value,
			[commentId]: false,
		}
		return
	}

	const requestInfo = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			commentId: commentId,
			postId: props.postId,
			hash: hash,
			sig: sig,
		}),
	}

	let response: Response
	try {
		response = await fetch(
			`/api/devprotocol:clubs:plugin:posts/${props.feedId}/comment/delete`,
			requestInfo,
		)

		const json = await response.json()

		const success = response.ok ? json?.message || false : false
		if (!success) {
			console.error('error deleting comment: ', response)
			return
		}

		// Delete the element by filtering for commentId to be deleted.
		// @ts-ignore
		comments.value = comments.value.filter(
			// @ts-ignore
			(comment: Comment) => comment.id !== commentId,
		)
	} catch (error) {
		console.error('error posting comment: ', error)
	} finally {
		isDeleting.value = {
			...isDeleting.value,
			[commentId]: false,
		}
	}
}
</script>

<template>
	<div>
		<div class="mb-5">
			<div
				v-for="(comment, index) in comments"
				:key="index"
				class="mb-5 last:mb-0"
			>
				<div class="mb-1 flex items-center justify-between">
					<Profile
						:feedId="props.feedId"
						:address="comment.created_by"
						:profile="profiles[comment.created_by]"
					/>
					<p class="text-center text-xs text-gray-400 lg:text-base">
						{{ dayjs(comment.created_at).format('DD MMM HH:mm') }}
					</p>
				</div>
				<div class="item-center justify-center flex justify-between">
					<div
						class="prose text-gray-700 py-1"
						:class="ProseTextInherit"
						v-html="htmlComment(comment.content || '')"
					></div>
					<button
						v-if="
							props.hashEditableRole ||
							props.postOwnerAddress === props.walletAddress ||
							comment.created_by === props.walletAddress
						"
						:disabled="isDeleting[comment.id]"
						@click="deleteComment(comment.id)"
						class="inline-flex cursor-pointer items-center justify-center rounded-full px-2 py-1 shadow-sm"
						type="button"
					>
						<div
							v-if="isDeleting[comment.id]"
							class="h-5 w-5 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
						></div>
						<img v-else class="h-4 w-4" :src="IconTrash.src" alt="trash-can" />
					</button>
				</div>
			</div>
		</div>

		<div class="item-center flex justify-between">
			<input
				class="w-11/12 bg-transparent rounded border border-gray-400 px-2 py-2 text-base text-gray-700 focus:border-indigo-500 focus:outline-none"
				type="text"
				v-model="newComment"
				placeholder="Add your thoughts..."
				:disabled="isCommenting"
			/>
			<button
				:disabled="isCommenting"
				@click="postComment"
				class="inline-flex cursor-pointer items-center justify-center rounded-full p-2 shadow-sm"
				type="button"
			>
				<div
					v-if="isCommenting"
					class="h-5 w-5 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
				></div>
				<img v-else class="h-5 w-5" :src="IconSend.src" alt="paper-airplane" />
			</button>
		</div>
	</div>
</template>

<style scoped></style>
