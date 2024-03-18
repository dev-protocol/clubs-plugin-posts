<script lang="ts" setup>
import { type Option } from '../../types'
import { onMounted, ref } from 'vue'
import type { Membership } from '../../types'
import Poll from './Poll.vue'

type Props = {
	options: Option[]
	feedId: string
	propertyAddress: string
	memberships?: Membership[]
	adminRolePoints: number
	emojiAllowList?: string[]
	postId?: string
}

const props = defineProps<Props>()

// feed情報
const feeds = ref([])

onMounted(async () => {
	// props.optionsからfeed情報を取得する
	feeds.value = props.options.find((item) => item.key === 'feeds')?.value
})
</script>

<template>
	<div v-for="feed in feeds" class="mx-auto w-full max-w-2xl">
		<h1 class="mb-4 text-4xl">
			{{ feed.title ? feed.title : `/${feed.slug}` }}
		</h1>
		<Poll
			v-if="feed.options !== undefined"
			:options="feed.options"
			:feedId="feed.id"
			:propertyAddress="props.propertyAddress"
			:memberships="props.memberships"
			:adminRolePoints="props.adminRolePoints"
			:emojiAllowList="props.emojiAllowList"
			:postId="props.postId"
		/>
	</div>
</template>
