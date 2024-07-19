<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue'
import type { Reactions } from '../../../types'
import { encode } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'
import type { Signer } from 'ethers'
import { getSignature, getMessage } from '../../../fixtures/session'

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

onMounted(() => {
	console.log('reactions:', toRaw(reactions.value))
})

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
	// get wallet address
	const userAddress = (await signer.getAddress()) as string

	// check if the user has already reacted with the emoji
	const userHasReacted = reactions.value[emoji]?.find(
		(reaction) => reaction.createdBy === userAddress,
	)
	console.log('user has reacted: ', toRaw(userHasReacted))

	if (userHasReacted) {
		await removeReaction({
			emoji,
			signer,
			userAddress,
			reactionId: userHasReacted.id,
		})
	} else {
		await addReaction({ emoji, signer, userAddress })
	}

	isTogglingReaction.value = false
}

const addReaction = async ({
	emoji,
	userAddress,
	signer,
}: {
	emoji: string
	signer: Signer
	userAddress: string
}) => {
	const hash = getMessage(userAddress)
	let sig = await getSignature(userAddress, signer)

	const requestInfo = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postId: props.postId,
			data: emoji,
			hash,
			sig,
		}),
	}

	const res = await fetch(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/reactions`,
		requestInfo,
	)

	const { id } = await res.json()

	if (res.status === 200) {
		const emojiReactions = reactions.value[emoji] ?? []
		// console.log('emoji reactions are: ', emojiReactions)
		reactions.value = {
			...reactions.value,
			[emoji]: [...emojiReactions, { createdBy: userAddress, id }],
		}
	} else {
		console.error('Error occurred while posting reaction:', res)
	}
}

const removeReaction = async ({
	reactionId,
	emoji,
	userAddress,
	signer,
}: {
	reactionId: string
	emoji: string
	signer: Signer
	userAddress: string
}) => {
	const hash = getMessage(userAddress)
	let sig = await getSignature(userAddress, signer)

	const requestInfo = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			hash,
			sig,
			id: reactionId,
		}),
	}

	const res = await fetch(
		`/api/devprotocol:clubs:plugin:posts/${props.feedId}/reactions`,
		requestInfo,
	)

	if (res.status === 200) {
		const emojiReactions = reactions.value[emoji] ?? []
		reactions.value = {
			...reactions.value,
			[emoji]: emojiReactions.filter((reaction) => reaction.id !== reactionId),
		}
	} else {
		console.error('Error occurred while deleting reaction:', res)
	}
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
