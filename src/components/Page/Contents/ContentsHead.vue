<script lang="ts" setup>
import dayjs from 'dayjs'
import Profile from '../../Common/Profile.vue'

type Props = {
	date: Date
	address: string
	propertyAddress: string
}

const { date, address, propertyAddress } = defineProps<Props>()
</script>

<template>
	<div class="flex items-center justify-between mb-3">
		<Profile :address="address" :property-address="propertyAddress" />
		<p class="text-base text-gray-400">
			{{ dayjs(date).format('DD MMM HH:mm') }}
		</p>
	</div>
</template>
