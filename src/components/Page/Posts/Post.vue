<script lang="ts" setup>
import Line from '../../Common/Line.vue';
import {ref} from 'vue'

type Props = {
	name: string;
	avatar: string;

};

const props = defineProps<Props>()

const contents = ref('')
const onClickPost = async () => {
	// fetchで /message.jsonをpostしてasync/awaitでレスポンスを取得する
	const response = await fetch('/api/message.json', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			contents: contents.value,
		}),
	})

	// レスポンスをjsonに変換する
	const json = await response.json()

	// レスポンスのjsonをコンソールに表示する
	console.log(json)
}

// limited access selected
const selectedLimitedAccess = ref([])

// limited access types
const limitedAccessTypes = [
	{
		value: 'limitedAccess01',
		label: 'Limited access 01',
	},
	{
		value: 'limitedAccess02',
		label: 'Limited access 02',
	},
	{
		value: 'limitedAccess03',
		label: 'Limited access 03',
	},
]

// selectedLimitedAccessの値を更新する
const onUpdateLimitedAccess = (value: string) => {
	// limitedAccessTypesのvalueが、selectedLimitedAccessの配列に含まれているかを確認する
	const index = selectedLimitedAccess.value.indexOf(value)

	// 含まれていない場合は、selectedLimitedAccessの配列に追加する
	if (index === -1) {
		selectedLimitedAccess.value.push(value)
	} else {
		// 含まれている場合は、selectedLimitedAccessの配列から削除する
		selectedLimitedAccess.value.splice(index, 1)
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
			v-model="contents"
			class="px-2 py-2 w-full text-base text-gray-700 border-none focus:outline-none focus:border-indigo-500"
			rows="3"
			type="text"
			placeholder="What’s happen?"
		/>
	</div>
	<!-- /入力フォーム -->
	<!-- Limited access button -->
  <div class="relative flex items-center mb-5">
		<button
			class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none"
			@click="onClickLimitedAccess"
		>
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
		<!-- 選択済みのLimited accessを表示 -->
		<div class="flex items-center gap-3 ml-3">
			<span
				v-for="selectedLimitedAccessType in selectedLimitedAccess"
				class="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
			>
				{{ selectedLimitedAccessType }}
			</span>
		</div>
		<!-- modal menu -->
		<ul
			v-if="openLimitedAccessModal"
			class="absolute z-20 top-14 left-0 flex flex-col gap-3 p-3 bg-white shadow-xl rounded-md"
		>
			<li v-for="limitedAccessType in limitedAccessTypes">
				<label :for="limitedAccessType.value" class="flex items-center gap-3 text-sm font-medium text-gray-900">
					<input
						:id="limitedAccessType.value"
						type="checkbox"
						class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
						:checked="selectedLimitedAccess.includes(limitedAccessType.value)"
						@change="onUpdateLimitedAccess(limitedAccessType.value)"
					/>
					<img class="w-24 h-24" src="../../../assets/images/limited-access/img01.png" alt="img01">
					<div class="flex flex-col">
						<p class="text-gray-900">{{ limitedAccessType.label }}</p>
						<p class="text-gray-500">0.01 ETH</p>
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
			<button
				class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none"
				@click="onClickPost"
			>
				Post
			</button>
		</div>
	</div>
</template>
