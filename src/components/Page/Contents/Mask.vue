<script lang="ts" setup>
import type { Membership } from '../../../types';

type Props = {
	memberships?: Membership[]
}

const props = defineProps<Props>()

const {memberships} = props

</script>

<template>
	<div class="bg-mask rounded-xl pt-8 pb-12 flex justify-center flex-col mb-2">

		<p class="text-white text-center mb-8">Unlock this post by becoming a member.</p>

		<div class="flex justify-center">
			<div class="bg-black rounded-xl text-white p-4 mx-2" v-for="membership in memberships">

				<div class="rounded-xl overflow-hidden">
					<img :src="membership.imageSrc" class="w-32" alt="Nature" />
				</div>

				<div class="mb-4 mt-2">
					<span class="text-sm">{{membership.name}}</span>
				</div>

				<span>{{ membership.price }} {{ membership.currency }}</span>
			</div>
		</div>

	</div>
</template>

<style lang="scss">
  .bg-mask {
    background-image: url('../../../assets/images/mask-post-bg.png');
		background-repeat: no-repeat;
		background-size: cover;
  }
</style>
