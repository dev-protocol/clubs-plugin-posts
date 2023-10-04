<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { Posts } from '../../types'
import { encode } from '@devprotocol/clubs-core'
import { EncodedPostClassName } from '../../plugin-helper'

const props = defineProps<{ post: Posts }>()
const encodedPost = computed<string>(() => encode(props.post))
const input = ref<HTMLElement>()
const event = (post: Posts) =>
	new CustomEvent('post-data:props-updated', {
		detail: { post },
		cancelable: true,
	})
const emit = (post: Posts) => input.value?.dispatchEvent(event(post))

onMounted(() => {
	emit(props.post)
})
</script>

<template>
	<input
		ref="input"
		type="hidden"
		:value="encodedPost"
		:class="EncodedPostClassName"
	/>
</template>
