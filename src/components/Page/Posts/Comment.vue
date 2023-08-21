<script lang="ts" setup>
import dayjs from 'dayjs'
import { encode } from '@devprotocol/clubs-core';
import { ComputedRef, computed, ref } from 'vue'
import { connection } from '@devprotocol/clubs-core/connection'

import type { Comment, CommentPrimitives } from '../../../types'

type Props = {
	postId: string
	avatar: string
	name: string
	comments: readonly Comment[]
}
const props = defineProps<Props>()

const newComment = ref<string>('')
const isCommenting = ref<boolean>(false)

const comments = ref<readonly Comment[]>(props.comments)

const postComment = async () => {
	isCommenting.value = true

	const signer = connection().signer.value
	if (!signer) {
		// TODO: add state for failure.
		isCommenting.value = false
		return
	}

	const comment: CommentPrimitives = {
		content: newComment.value,
		options: []
	}
	const hash = encode(comment)
	let sig: string = ''
	try {
		sig = await signer.signMessage(hash)
	} catch(error) {
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
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: props.postId,
			hash: hash,
			sig: sig,
			contents: hash
		})
	}

	let response: Response
	try {
		response = await fetch('/api/clubs-plugin-posts/comment', requestInfo)

		const json = await response.json()

		const success = response.ok ? json?.message || false : false
		if (!success) {
			console.error('error posting comment: ', response)
			return;
		}

		const toPush = Object.freeze({
				content: comment.content,
				created_at: Date.now(),
				updated_at: Date.now(),
				id: json?.id,
				created_by: await signer.getAddress(),
				options: {}
			})

		// push new comment to comments array.
		// @ts-ignore
		comments.value = [...comments.value, toPush]

		newComment.value = ''
	} catch(error) {
		console.error('error posting comment: ', error);
	} finally {
		isCommenting.value = false
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
				<div class="flex items-center justify-between mb-1">
					<div class="flex items-center">
						<img class="w-9 h-9 rounded-full mr-3" :src="avatar" alt="Avatar" />
						<p class="text-black text-base font-bold">{{ name }}</p>
					</div>
					<p class="text-base text-gray-400">
						{{ dayjs(comment.created_at).format('DD MMM HH:mm') }}
					</p>
				</div>
				<p class="text-base text-gray-700">
					{{ comment.content }}
				</p>
			</div>
		</div>

		<div class="flex item-center justify-between">
			<input
				class="px-2 py-2 w-11/12 text-base text-gray-700 border border-gray-400 rounded focus:outline-none focus:border-indigo-500"
				type="text"
				v-model="newComment"
				placeholder="Want to comment? Comments will be available soon."
				:disabled="isCommenting"
			/>
			<button
				:disabled="isCommenting"
				@click="postComment"
				class="p-2 inline-flex items-center justify-center rounded-full shadow-sm cursor-pointer"
				type="button"
			>
				<div
					v-if="isCommenting"
					class="animate-spin h-5 w-5 border-4 border-blue-500 rounded-full border-t-transparent"
				></div>
				<img
					v-else
					class="w-5 h-5"
					src="../../../assets/images/icon-send.svg"
					alt="paper-airplane"
				/>
			</button>
		</div>
	</div>
</template>

<style scoped></style>
