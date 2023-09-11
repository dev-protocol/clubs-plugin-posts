<script lang="ts" setup>
import type { Membership } from '../../../types'
import Image from '../../../assets/images/mask-post-bg.png'

type Props = {
	memberships?: Membership[]
}

const props = defineProps<Props>()

const { memberships } = props
</script>

<template>
	<div class="bg-mask rounded-xl p-4 flex justify-center flex-col mb-2">
		<p class="text-white text-center mb-4 sm:mb-4">
			Unlock this post by becoming a member.
		</p>

		<div class="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
			<div
				v-for="membership in memberships"
				class="flex flex-row sm:flex-col gap-4 sm:gap-2 p-3 sm:p-4 bg-black rounded-xl text-white"
			>
				<div
					class="w-12 sm:w-32 sm-12 sm:h-32 bg-center bg-no-repeat bg-contain rounded-xl"
					:style="`background-image: url(${membership.imageSrc})`"
				/>

				<div class="flex flex-col flex-grow justify-between">
					<p class="text-sm">
						{{ membership.name }}
					</p>

					<p class="w-full">{{ membership.price }} {{ membership.currency }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.bg-mask {
	background-image: v-bind("'url(' + Image.src + ')'");
	background-repeat: no-repeat;
	background-size: cover;
}
</style>
