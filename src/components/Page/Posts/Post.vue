<script lang="ts" setup>
import { ref, watch } from 'vue'
import Line from '../../Common/Line.vue'
import AddMedia from './Post/AddMedia.vue'
import DoPost from './Post/DoPost.vue'
import Images from './Media/Images.vue'
import type { Membership, PostPrimitives, Posts } from '../../../types'
import Profile from '../../Common/Profile.vue'
import { update as callUpdate } from '../../../plugin-helper'

type Props = {
	feedId: string
	address: string
	memberships?: Membership[]
}

interface Emits {
	(e: 'post:success', post: Posts): void
}

const emit = defineEmits<Emits>()

const props = defineProps<Props>()

const postItem = ref<PostPrimitives>()
const title = ref('')
const contents = ref('')

// limited access selected
const selectedLimitedAccess = ref<Membership[]>([])

// limited access types
const limitedAccessTypes = props.memberships ?? []

// selectedLimitedAccessの値を更新する
const onUpdateLimitedAccess = (mem: Membership) => {
	// limitedAccessTypesのvalueが、selectedLimitedAccessの配列に含まれているかを確認する
	const index = selectedLimitedAccess.value.findIndex((x) => x.id === mem.id)

	// 含まれていない場合は、selectedLimitedAccessの配列に追加する
	if (index === -1) {
		selectedLimitedAccess.value = [...selectedLimitedAccess.value, mem]
	} else {
		// 含まれている場合は、selectedLimitedAccessの配列から削除する
		selectedLimitedAccess.value = selectedLimitedAccess.value.filter(
			(_, i) => i !== index,
		)
	}
}

// Limited access modal
const openLimitedAccessModal = ref(false)

// Limited access modal open
const onClickLimitedAccess = async () => {
	openLimitedAccessModal.value = !openLimitedAccessModal.value
}

// Limited access modal close
const onCloseLimitedAccess = () => {
	openLimitedAccessModal.value = false
}

// Media preview
const uploadImages = ref<string[]>([])
const handleUploadImages = (files: string) => {
	uploadImages.value.push(files)
}

watch(
	[title, contents, selectedLimitedAccess],
	async ([_title, _contents, _selectedLimitedAccess]) => {
		const post: PostPrimitives = {
			title: _title,
			content: _contents,
			options: [
				{
					key: 'require-one-of',
					value: _selectedLimitedAccess
						.filter(({ payload }) => payload !== undefined)
						.map(({ payload }) => payload as Uint8Array),
				},
			],
		}
		const newPost = await callUpdate(post)
		postItem.value = newPost
	},
)

// Post Success
const handlePostSuccess = (data: Posts) => {
	emit('post:success', data)

	contents.value = ''
	title.value = ''
	handleDeleteImageAll()
}

// Media delete
const handleDeletePreviewImage = (index: number) => {
	uploadImages.value.splice(index, 1)
}

const handleDeleteImageAll = () => {
	uploadImages.value = []
}
</script>
<template>
	<div class="grid gap-5">
		<div class="flex items-center justify-between">
			<Profile :address="props.address" :feedId="props.feedId" />
		</div>

		<!-- title -->
		<span>
			<div class="text-3xl font-bold text-black">
				<input
					v-model="title"
					class="w-full bg-transparent border-none px-2 py-2 text-gray-700 focus:border-indigo-500 focus:outline-none"
					type="text"
					placeholder="Title"
				/>
			</div>

			<!-- 入力フォーム -->
			<div class="text-3xl font-bold text-black">
				<textarea
					v-model="contents"
					class="w-full bg-transparent border-none px-2 py-2 text-base text-gray-700 focus:border-indigo-500 focus:outline-none"
					rows="3"
					type="text"
					placeholder="What’s happening?"
				/>
			</div>
		</span>

		<slot name="after-content-form"></slot>

		<!-- /入力フォーム -->
		<!-- Limited access button -->
		<div class="relative flex items-center">
			<button
				class="rounded-3xl border border-transparent bg-blue-600 px-8 py-2 text-base text-white shadow-sm focus:outline-none"
				@click="onClickLimitedAccess"
			>
				<!-- icon-plus.svgを表示 -->
				<svg
					class="mr-3 inline h-5 w-5"
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
			<!-- 選択済みのLimited accessを表示 -->
			<div class="ml-3 flex items-center gap-3">
				<span
					v-for="selectedLimitedAccessType in selectedLimitedAccess"
					class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-medium text-yellow-800"
				>
					{{ selectedLimitedAccessType.name }}
				</span>
			</div>
			<!-- modal menu -->
			<ul
				v-if="openLimitedAccessModal"
				class="absolute left-0 top-14 z-20 flex flex-col gap-3 rounded-md bg-white p-3 shadow-xl"
			>
				<li v-for="limitedAccessType in limitedAccessTypes">
					<label
						:for="limitedAccessType.id"
						class="flex items-center gap-3 text-sm font-medium text-gray-900"
					>
						<input
							:id="limitedAccessType.id"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
							:checked="
								selectedLimitedAccess.some(
									(val) => val.id === limitedAccessType.id,
								)
							"
							@change="onUpdateLimitedAccess(limitedAccessType)"
						/>
						<img
							class="h-24 w-24 rounded"
							:src="limitedAccessType.imageSrc"
							:alt="limitedAccessType.name"
						/>
						<div class="flex flex-col">
							<p class="text-gray-900">{{ limitedAccessType.name }}</p>
							<p class="text-gray-500">
								{{ limitedAccessType.price }} {{ limitedAccessType.currency }}
							</p>
						</div>
					</label>
				</li>
			</ul>
			<div
				v-if="openLimitedAccessModal"
				class="fixed inset-0 z-10"
				@click="onCloseLimitedAccess"
			></div>
		</div>
		<!-- /Limited access button -->
		<!-- Media preview -->
		<div v-if="uploadImages.length" class="flex flex-wrap gap-x-1 gap-y-1">
			<Images
				:images="uploadImages"
				:is-post="true"
				@delete:image="handleDeletePreviewImage"
			/>
		</div>
		<!-- /Media preview -->
		<Line class="" />
		<!-- アクションエリア -->
		<div class="flex items-center justify-between">
			<!-- 画像ボタン -->
			<AddMedia @upload:image="handleUploadImages" />
			<!-- /画像ボタン -->
			<!-- Postボタン -->
			<DoPost
				:feedId="props.feedId"
				:images="uploadImages"
				:post="postItem ?? { title: '', content: '', options: [] }"
				:selectedLimitedAccess="selectedLimitedAccess"
				@post:success="handlePostSuccess"
			/>
			<!-- /Postボタン -->
		</div>
	</div>
	<!-- /アクション -->
</template>
