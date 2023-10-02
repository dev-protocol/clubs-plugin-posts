<script lang="ts" setup>
import Icon from '../../assets/images/plugin-icon.svg'
</script>

<template>
	<div class="container mx-auto px-4">
		<h1 class="text-3xl font-bold mb-4">Posts</h1>

		<div
			class="rounded-md justify-items-center w-max mx-auto min-h-2xl p-3 bg-dp-blue-grey-300 grid gap-3"
		>
			<p>There's nothing here yet, but will be more fun things to come...</p>
			<img
				class="rounded-md opacity-20"
				:src="Icon.src"
				:width="Icon.width"
				:height="Icon.height"
			/>
		</div>
	</div>
</template>
