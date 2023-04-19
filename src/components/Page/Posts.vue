<script lang="ts" setup>
import Header from './Posts/Header.vue';
import Reactions from './Posts/Reactions.vue';
import Contents from './Posts/Contents.vue';
import Media from './Posts/Media.vue';
import Comment from './Posts/Comment.vue';
import type {PropType} from 'vue';
import type {Option, Posts} from '../../types';
import {ref} from 'vue';

const props = defineProps({
	options: {
		type: Array as PropType<Option[]>,
		required: true,
	},
})

// props.optionsをoptionsとして定義する
const options = ref<Option[] | undefined>(props.options)


// props.optionsのkeyがpostsのvalueを取得する
const posts = ref<Posts[]>(props.options?.find(({key}) => key === 'posts')?.value || [])
</script>

<template>
  <div v-for="(post, key) in posts" :key="post.id" class="post-wrapper">
	<article class="mx-auto p-5 w-full max-w-2xl rounded">
	  <Header avatar="https://source.unsplash.com/100x100/?face" name="Aggre" :date="post.created_at"/>
	  <Contents :contents="post.content"/>
	  <Reactions likes="100"/>
	  <Media :images="post.options.find((item) =>  item.key === '#images')"/>
	  <div class="mb-5">
		<hr class="border-gray-300"/>
	  </div>
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
