<script setup lang="ts">
import { type PropType, ref } from 'vue'
import { type ClubsPropsAdminPages, setOptions } from '@devprotocol/clubs-core'
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
const editorRoleHolders = ref([])

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

	// editorRoleHoldersがある場合に、その値(membership.id)のmembershipを取得して、payloadを取得する
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
			}
		}
		return {
			...feed,
			roles: {
				write: {
					memberships: [],
				},
			},
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
		</div>
	</div>
</template>
