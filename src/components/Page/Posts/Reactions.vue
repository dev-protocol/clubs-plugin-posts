<script lang="ts" setup>
import { ref } from 'vue'
import type { Reactions } from '../../../types'
import { encode } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'

type Props = {
	feedId: string
	postId: string
	reactions: Reactions
	emojiAllowList: string[]
}
const props = defineProps<Props>()

const reactions = ref<Reactions>({})
const isTogglingReaction = ref<boolean>(false)

reactions.value = props.reactions

const toggleReaction = async (emoji: string) => {
	if (isTogglingReaction.value) {
		return
	}

	isTogglingReaction.value = true

	const signer = (
		await import('@devprotocol/clubs-core/connection')
	).connection().signer.value
	if (!signer) {
		// TODO: add state for failure.
		isTogglingReaction.value = false
		return
	}

	const hash = encode(`${props.postId}-${emoji}`)

	let sig: UndefinedOr<string>
	try {
		sig = await signer.signMessage(hash)
	} catch (error) {
		// TODO: add state for failure.
		console.error('error occurred while signing message:', error)
		isTogglingReaction.value = false
		return
	}

	const requestInfo = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: props.postId,
			emoji,
			hash,
			sig,
		}),
	}

	const res = await fetch(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/reactions`,
		requestInfo,
	)

	if (res.status === 200) {
		const emojiReactions = reactions.value[emoji] ?? []
		const userAddress = await signer.getAddress()
		const userAddressExists = emojiReactions.includes(await signer.getAddress())

		// if user address exists, remove it
		if (userAddressExists) {
			reactions.value = {
				...reactions.value,
				[emoji]: emojiReactions.filter((address) => address !== userAddress),
			}
		} else {
			// if user address does not exist, add it
			reactions.value = {
				...reactions.value,
				[emoji]: [...emojiReactions, userAddress],
			}
		}
	} else {
		console.error('Error occurred while posting reaction:', res)
	}

	isTogglingReaction.value = false
}
</script>

<template>
	<div v-if="reactions">
		<div class="flex flex-wrap items-center justify-center gap-2.5">
			<!-- loop through emoji allow list -->
			<div
				class="flex items-center gap-2"
				v-for="emoji in emojiAllowList"
				:key="emoji"
			>
				<button
					@click="() => toggleReaction(emoji)"
					class="cursor-pointer text-xl text-gray-400"
				>
					{{ emoji }}
				</button>
				<div class="text-lg text-black">
					{{ reactions[emoji]?.length ?? '' }}
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
