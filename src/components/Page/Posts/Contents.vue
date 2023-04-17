<script lang="ts" setup>
const props = defineProps({
	contents: {
		type: String,
		required: true,
	},
})
</script>

<template>
  <div class="mb-5 text-3xl font-bold text-black">
		{{ props.contents }}
  </div>
</template>

<style scoped>

</style>
