<script lang="ts" setup>
import Header from './Posts/Header.vue';

const props = defineProps({
})

const { token } = props
</script>

<template>
	<article class="mx-auto p-5 w-full max-w-2xl rounded">
		<Header avatar="https://source.unsplash.com/100x100/?face" name="Aggre" date="19 Mar. 11:12" />
	</article>
</template>
