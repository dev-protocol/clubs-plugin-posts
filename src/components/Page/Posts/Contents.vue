<script lang="ts" setup>
import Header from './Header.vue';
import dayjs from 'dayjs';

type Props = {
	name: string;
	avatar: string;
	date: string;
	contents: string;
};

const props = defineProps<Props>()
</script>

<template>
  <div class="flex items-center justify-between mb-1">
		<div class="flex items-center">
	  	<img
				class="w-12 h-12 rounded-full mr-3"
				:src="props.avatar"
				alt="Avatar of Aggre"
	  	/>
	  	<p class="text-black text-base font-bold">{{ props.name }}</p>
		</div>
		<p class="text-base text-gray-400">{{ dayjs(props.date).format('d MMM H:mm') }}</p>
  </div>
  <div class="mb-5 text-3xl font-bold text-black">
		{{ props.contents }}
  </div>
</template>

<style scoped>

</style>
