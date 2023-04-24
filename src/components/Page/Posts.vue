<script lang="ts" setup>
import Post from './Posts/Post.vue';
import Reactions from './Posts/Reactions.vue';
import Contents from './Posts/Contents.vue';
import Media from './Posts/Media.vue';
import Comment from './Posts/Comment.vue';
import type {PropType} from 'vue';
import type {Option, Posts} from '../../types';
import {ref} from 'vue';
import Line from '../Common/Line.vue';

const props = defineProps({
	options: {
		type: Array as PropType<Option[]>,
		required: true,
	},
})

if (props.options === undefined) {
	throw new Error('props.options is undefined')
}

// props.optionsのkeyがpostsのvalueを取得する
const posts = ref<Posts[]>(props.options.find((item) => item.key === 'posts')?.value || [])
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
		<section class="mb-5 p-5 rounded bg-white">
			<Post avatar="https://source.unsplash.com/100x100/?face" name="Aggre" />
		</section>
		<article v-for="(post, key) in posts" :key="post.id" class="p-5 rounded bg-white">
	  	<Contents avatar="https://source.unsplash.com/100x100/?face" name="Aggre" :date="post.created_at" :contents="post.content"/>
	  	<Reactions likes="100"/>
	  	<Media :images="post.options.find((item) =>  item.key === '#images')"/>
			<Line class="mb-5" />
	  	<Comment :comments="[
				{
					avatar: 'https://source.unsplash.com/100x100/?face',
					name: 'Roxy',
					date: '19 Mar. 11:12',
					comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
				{
					avatar: 'https://source.unsplash.com/100x100/?face',
					name: 'Josh',
					date: '19 Mar. 11:12',
					comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
			]"/>
		</article>
  </div>
</template>
