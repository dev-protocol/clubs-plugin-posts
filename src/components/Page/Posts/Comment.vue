<script lang="ts" setup>
import { Comment } from '../../../types'
import dayjs from 'dayjs'

type Props = {
	avatar: string
	name: string
	comments: Comment[]
}

const props = defineProps<Props>()
</script>

<template>
	<div>
		<div class="mb-5">
			<div
				v-for="(comment, index) in props.comments"
				:key="index"
				class="mb-5 last:mb-0"
			>
				<div class="flex items-center justify-between mb-1">
					<div class="flex items-center">
						<img class="w-9 h-9 rounded-full mr-3" :src="avatar" alt="Avatar" />
						<p class="text-black text-base font-bold">{{ name }}</p>
					</div>
					<p class="text-base text-gray-400">
						{{ dayjs(comment.created_at).format('d MMM H:mm') }}
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
				placeholder="Want to comment? Comments will be available soon."
			/>
			<button
				class="p-2 inline-flex items-center justify-center rounded-full shadow-sm cursor-pointer"
				type="button"
			>
				<img
					class="w-5 h-5"
					src="../../../assets/images/icon-send.svg"
					alt="paper-airplane"
				/>
			</button>
		</div>
	</div>
</template>

<style scoped></style>
