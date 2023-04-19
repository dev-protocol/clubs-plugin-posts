<script lang="ts" setup>
import {ref} from 'vue'

const content = ref('')
const image = ref<File | null>(null)

const handleFileInput = (event: Event) => {
	const target = event.target as HTMLInputElement
	const files = target.files
	if (files?.length) {
		image.value = files[0]
	} else {
		image.value = null
	}
}

const submitForm = () => {
	const formData = {
		content: content.value,
		image: image.value
	}
	console.log(formData)
}
</script>

<template>
  <div class="container mx-auto px-4">
		<h1 class="text-2xl font-bold mb-4">Posts</h1>
		<form class="w-full max-w-lg" @submit.prevent="submitForm">
	  	<div class="flex flex-wrap -mx-3 mb-4">
				<div class="w-full px-3">
		  		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="content">
						Content
		  		</label>
		  		<textarea v-model="content" id="content" name="content"
						class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
						rows="5"></textarea>
				</div>
	  	</div>
	  	<div class="flex flex-wrap -mx-3 mb-4">
				<div class="w-full px-3">
		  		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="image">
						Image
		  		</label>
		  		<input @change="handleFileInput" id="image" name="image" type="file"
				 		class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
				</div>
	  	</div>
	  	<div class="flex flex-wrap -mx-3 mb-4">
				<div class="w-full px-3 text-right">
		  		<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
						Submit
		  		</button>
				</div>
	  	</div>
		</form>
  </div>
</template>

