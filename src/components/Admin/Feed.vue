<script setup lang="ts">
import { onMounted, type PropType, ref } from 'vue'
import {
	type ClubsPropsAdminPages,
	ClubsSlotName,
	setOptions,
} from '@devprotocol/clubs-core'
import type { Membership, OptionsDatabase } from '../../types.ts'
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
	memberships: Array as PropType<Membership[]>,
})

const IS_EDIT = Boolean(props.edit)
const currentPluginIndex = ref(props.clubs.currentPluginIndex)
const slug = ref(props.edit?.slug)
const title = ref(props.edit?.title)
const isSlugError = ref(false)
const errorMessage = ref('')
const editorRoleHolders = ref<(string | undefined)[]>([])
const titleNews = ref('')
const enableNews = ref(false)
const countNews = ref(3)

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

onMounted(() => {
	if (IS_EDIT) {
		const feed = props.feeds?.filter((feed) => {
			return feed.slug === slug.value
		})

		const roles = feed[0].roles

		editorRoleHolders.value =
			roles?.write.memberships
				.map((membership) => {
					return props.memberships?.find((m) => m.payload === membership)?.id
				})
				.filter((id) => id) || []
	}
})

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

	const roles =
		editorRoleHolders.value?.length > 0
			? {
					write: {
						memberships: editorRoleHolders.value.map(
							(id) => props.memberships?.find((m) => m.id === id)?.payload,
						),
					},
				}
			: {
					write: {
						memberships: [],
					},
				}

	if (titleNews.value === '') {
		titleNews.value = 'News'
	}

	const slots = {
		[ClubsSlotName.PageContentHomeBeforeContent]: {
			enable: enableNews.value,
			title: titleNews.value,
			items: countNews.value,
		},
	}

	if (!IS_EDIT) {
		setOptions(
			[
				{
					key: 'feeds',
					value: [
						...props.feeds,
						{
							...defineFeed(),
							roles: roles,
							slots,
						},
					],
				},
			],
			currentPluginIndex.value,
		)
		return
	}

	const feeds = props.feeds.map((feed) => {
		if (feed.id === props.edit?.id) {
			return {
				...feed,
				slug: slug.value,
				title: title.value,
				roles,
				slots,
			}
		}
		return {
			...feed,
			roles: {
				write: {
					memberships: [],
				},
			},
			slots: {},
		}
	})

	setOptions(
		[{ key: 'feeds', value: IS_EDIT ? [...feeds] : [...feeds, defineFeed()] }],
		currentPluginIndex.value,
	)
}
</script>
<style scoped>
.hs-form-field .hs-form-field__helper.label__error,
.hs-form-field .hs-form-field__label.label__error {
	color: #c92020;
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

			<div class="hs-form-field is-filled">
				<p class="hs-form-field__label">Editable role holders</p>
				<p class="mb-4 text-sm">
					Those who have memberships in one of the following or have an admin
					role in this Club can create posts.
				</p>

				<ul
					class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-4"
				>
					<li v-for="membership in memberships" :key="membership.id">
						<input
							type="checkbox"
							class="hidden peer"
							:id="membership.id"
							:value="membership.id"
							v-model="editorRoleHolders"
							@change="onChange"
						/>
						<label
							:for="membership.id"
							class="inline-flex items-center justify-between w-full p-3 bg-surface-300 rounded-lg cursor-pointer border-2 border-surface-400 peer-checked:border-accent-300 brightness-90 peer-checked:brightness-100"
						>
							<span class="block">
								<img
									class="mb-2 rounded-lg"
									:src="membership.imageSrc"
									alt=""
								/>
								<span class="block mb-8 text-sm">{{ membership.name }}</span>
								<span class="block text-sm">
									{{ membership.price }} {{ membership.currency }}
								</span>
							</span>
						</label>
					</li>
				</ul>
			</div>

			<div class="hs-form-field is-filled">
				<p class="hs-form-field__label text-xl mb-4">Posts widget</p>

				<div class="mb-4">
					<label for="information-title" class="hs-form-field__label block">
						Add Posts widget on the top page
					</label>
					<p class="mb-4 text-sm block">
						When activated, this feature displays a set number of the latest
						news items at Clubs page.
					</p>
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							v-model="enableNews"
							type="checkbox"
							class="sr-only peer"
							@change="onChange"
						/>
						<span
							class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
						></span>
					</label>
				</div>

				<label for="information-title" class="hs-form-field__label block">
					Title
				</label>
				<p class="mb-4 text-sm block">
					You can change the title of the latest news
				</p>
				<input
					v-model="titleNews"
					id="information-title"
					class="hs-form-field__input w-full"
					placeholder="News"
					@change="onChange"
				/>
			</div>
			<div class="hs-select-field">
				<label for="number-of-information" class="hs-select-field__label block">
					Number of Latest Information Displayed
				</label>
				<p class="mb-4 text-sm block">
					The latest information will be displayed up to the number set here.
				</p>
				<select
					v-model="countNews"
					id="number-of-information"
					class="hs-form-field hs-select-field__input"
					@change="onChange"
				>
					<option v-for="value in 10" :value="value">
						{{ value }}
					</option>
				</select>
			</div>
		</div>
	</div>
</template>
