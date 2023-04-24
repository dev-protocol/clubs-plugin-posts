<script lang="ts" setup>
import Line from '../../Common/Line.vue';

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
		required: true,
	},
})
</script>
<template>
	<!-- Avatar -->
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center">
			<img
				class="w-12 h-12 rounded-full mr-3"
				:src="props.avatar"
				alt="Avatar of Aggre"
			/>
			<p class="text-black text-base font-bold">{{ props.name }}</p>
		</div>
	</div>
	<!-- /Avatar -->
	<!-- 入力フォーム -->
	<div class="mb-5 text-3xl font-bold text-black">
		<textarea
			class="px-2 py-2 w-full text-base text-gray-700 border-none focus:outline-none focus:border-indigo-500"
			rows="3"
			type="text"
			placeholder="What’s happen?"
		/>
	</div>
	<!-- /入力フォーム -->
	<!-- Limited access button -->
  <div class="flex items-center mb-5">
		<button class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none">
			<!-- icon-plus.svgを表示 -->
			<svg
				class="inline w-5 h-5 mr-3"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z"
					clip-rule="evenodd"
				/>
			</svg>
	  	Limited access
		</button>
  </div>
	<!-- /Limited access button -->
  <Line class="mb-5" />
	<div class="flex justify-between items-center">
		<div class="flex items-center">
			<svg
				class="w-5 h-5 mr-3"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z"
					clip-rule="evenodd"
				/>
			</svg>
			<button
				class="inline-flex items-center justify-center rounded-full shadow-sm cursor-pointer"
				type="button"
			>
				<img class="w-7" src="../../../assets/images/icon-pic.svg" alt="paper-airplane" />
	  	</button>
		</div>
		<div class="flex items-center">
			<button class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none">
				Post
			</button>
		</div>
	</div>
</template>
