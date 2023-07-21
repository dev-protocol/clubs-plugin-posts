<script lang="ts" setup>
import { ref } from 'vue'
import { Comment } from '../../../types'

type Props = {
	comments: Comment[]
}
const props = defineProps<Props>()

const reactions = ref<Comment[]>([])
const likes = ref<string>('')

// props.commentsからoptionsのkeyが'reaction'のものを取得する
try {
	if (props.comments) {
		const filterReactions = props.comments.filter(
			(comment) => comment.options && comment.options[0].key === 'reaction',
		)

		if (filterReactions.length > 0) {
			reactions.value = filterReactions
			likes.value = reactions.value[0].options[0].value
		}
	}
} catch (error) {
	console.error('Error occurred while processing comments:', error)
}
</script>

<template>
	<div
		v-if="reactions && reactions.length > 0"
		class="flex justify-between mb-5"
	>
		<div class="flex items-center">
			<span class="mr-1 text-gray-400 text-4xl">{{ likes }}</span>
			{{ reactions.length }}
		</div>
	</div>
</template>

<style scoped></style>
