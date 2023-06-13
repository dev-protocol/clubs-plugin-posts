<script lang="ts" setup>
import Post from './Posts/Post.vue'
import Reactions from './Posts/Reactions.vue'
import Contents from './Posts/Contents.vue'
import Media from './Posts/Media.vue'
import Comment from './Posts/Comment.vue'
import type { Option, Posts } from '../../types'
import { ref } from 'vue'
import Line from '../Common/Line.vue'

type Props = {
	options: Option[]
	propertyAddress: string
}

const props = defineProps<Props>()

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

// props.optionsのkeyがpostsのvalueを取得する
// TODO: [GET] `/api/clubs-plugin-posts/${props.propertyAddress}/message` に差し替え
const posts = ref<Posts[]>(
	props.options.find((item) => item.key === 'posts')?.value || []
)
</script>

<template>
	<div class="mx-auto w-full max-w-2xl">
		<section class="mb-5 p-5 rounded bg-white">
			<Post
				avatar="https://source.unsplash.com/100x100/?face"
				name="Aggre"
				:propertyAddress="props.propertyAddress"
			/>
		</section>
		<article
			v-for="(post, key) in posts"
			:key="post.id"
			class="mb-5 p-5 rounded bg-white"
		>
			<div
				v-if="
					post.options.find((item) => item.key === 'require-one-of') ===
					undefined
				"
			>
				<Contents
					avatar="https://source.unsplash.com/100x100/?face"
					name="Aggre"
					:date="post.created_at"
					:contents="post.content"
				/>
				<Reactions likes="100" />
				<Media :images="post.options.find((item) => item.key === '#images')" />
				<Line class="mb-5" />
				<Comment
					avatar="https://source.unsplash.com/100x100/?face"
					name="Roxy"
					:comments="post.comments"
				/>
			</div>
			<div v-else>
				<Contents
					avatar="https://source.unsplash.com/100x100/?face"
					name="Aggre"
					:date="post.created_at"
					:contents="post.content"
				/>
				<Media :required="true" />
				<Reactions likes="100" />
			</div>
		</article>
	</div>
</template>
