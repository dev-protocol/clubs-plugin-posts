<script lang="ts" setup>
import Header from './Posts/Header.vue';
import Reactions from './Posts/Reactions.vue';
import Contents from './Posts/Contents.vue';
import Media from './Posts/Media.vue';
import Comment from './Posts/Comment.vue';

const props = defineProps({
})

const { token } = props
</script>

<template>
	<article class="mx-auto p-5 w-full max-w-2xl rounded">
		<Header avatar="https://source.unsplash.com/100x100/?face" name="Aggre" date="19 Mar. 11:12" />
		<Contents contents="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
		<Reactions likes="100" />
		<Media :images="[
			'https://source.unsplash.com/800x400/?nature',
		]" />
		<div class="mb-5">
			<hr class="border-gray-300" />
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
		]" />
	</article>
</template>
