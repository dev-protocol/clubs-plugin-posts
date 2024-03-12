<script setup lang="ts">
import { type PropType, ref } from 'vue'
import { type ClubsPropsAdminPages, setOptions } from '@devprotocol/clubs-core'
import type { OptionsDatabase } from '../../types.ts'
import { uuidFactory } from '../../db/uuidFactory.ts'
import { nanoid } from 'nanoid'

const props = defineProps({
	feeds: {
		type: Array as PropType<OptionsDatabase[]>,
		required: true,
	},
	clubs: {
		type: Object as PropType<ClubsPropsAdminPages['clubs']>,
		required: true,
	},
	url: {
		type: String as PropType<string>,
		required: true,
	},
	edit: {
		type: Object as PropType<OptionsDatabase>,
	},
})

const IS_EDIT = Boolean(props.edit)
const currentPluginIndex = ref(props.clubs.currentPluginIndex)
const slug = ref(props.edit?.slug)
const title = ref(props.edit?.title)
const isSlugError = ref(false)
const errorMessage = ref('')

const uuid = uuidFactory(props.url)
const defineFeed = (): OptionsDatabase => {
	const id = nanoid(10)
	return {
		id,
		slug: slug.value ?? id,
		title: title.value,
		database: {
			type: 'documents:redis',
			key: uuid(),
		},
	}
}

const normalize = (value?: string) =>
	value?.toLowerCase().replace(/[\s\W]/g, '-')

const onInput = () => {
	slug.value = normalize(slug.value)
}

const onChange = () => {
	if (slug.value === '') {
		isSlugError.value = true
		errorMessage.value = 'slug is required'
		return
	}
	isSlugError.value = false

	if (
		props.feeds.some(
			(feed) => feed.slug === slug.value && feed.id !== props.edit?.id,
		)
	) {
		isSlugError.value = true
		errorMessage.value = 'slug is already exists'
		return
	}
	isSlugError.value = false

	const feeds = props.feeds.map((feed) => {
		if (feed.id === props.edit?.id) {
			return {
				...feed,
				slug: slug.value,
				title: title.value,
			}
		}
		return feed
	})

	setOptions(
		[{ key: 'feeds', value: IS_EDIT ? [...feeds] : [...feeds, defineFeed()] }],
		currentPluginIndex.value,
	)
}
</script>
<style scoped>
.hs-form-field {
	.hs-form-field__helper,
	.hs-form-field__label {
		&.label__error {
			color: #c92020;
		}
	}
}
</style>
<template>
	<div class="py-4">
		<h1 class="mb-2 text-3xl font-bold">
			{{ IS_EDIT ? 'Edit feed' : 'Create a new feed' }}
		</h1>
		<p class="mb-6">
			{{
				IS_EDIT
					? 'You can change the settings of the Feed'
					: 'Please enter the following to add a new feed'
			}}
		</p>
		<div class="flex flex-col gap-2">
			<label class="hs-form-field is-filled flex flex-col">
				<span class="hs-form-field__label"> Title </span>
				<input
					v-model="title"
					class="hs-form-field__input"
					placeholder="title"
					@change="onChange"
				/>
			</label>

			<label class="hs-form-field is-filled flex flex-col">
				<span
					class="hs-form-field__label"
					:class="{ label__error: isSlugError }"
				>
					Slug
				</span>
				<div class="grid gap-2 rounded bg-surface-400 p-2">
					<input
						v-model="slug"
						class="hs-form-field__input"
						placeholder="slug"
						@change="onChange"
						@keyup="onInput"
					/>
					<p>
						<span class="text-sm font-mono opacity-30">{{ props.url }}</span
						><span class="text-sm font-mono">/{{ slug }}</span>
					</p>
				</div>
				<span v-if="isSlugError" class="hs-form-field__helper label__error">
					{{ errorMessage }}
				</span>
			</label>
		</div>
	</div>
</template>
