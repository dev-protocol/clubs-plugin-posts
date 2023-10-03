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
	<div class="bg-mask mb-2 flex flex-col justify-center rounded-xl p-4">
		<p class="mb-4 text-center text-white sm:mb-4">
			Unlock this post by becoming a member.
		</p>

		<div
			class="flex flex-col flex-wrap justify-center gap-2 sm:flex-row sm:gap-4"
		>
			<div
				v-for="membership in memberships"
				class="flex flex-row gap-4 rounded-xl bg-black p-3 text-white sm:flex-col sm:gap-2 sm:p-4"
			>
				<div
					class="sm-12 w-12 rounded-xl bg-contain bg-center bg-no-repeat sm:h-32 sm:w-32"
					:style="`background-image: url(${membership.imageSrc})`"
				/>

				<div class="flex flex-grow flex-col justify-between">
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
