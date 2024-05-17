<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue'
import type { Reactions } from '../../../types'
import { encode } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'
import type { Signer } from 'ethers'

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
	console.log('id is: ', id)
	console.log('emoji is: ', emoji)

	if (res.status === 200) {
		const emojiReactions = reactions.value[emoji] ?? []
		console.log('emoji reactions are: ', emojiReactions)
		reactions.value = {
			...reactions.value,
			[emoji]: [...emojiReactions, { createdBy: userAddress, id }],
		}

		// const userAddress = await signer.getAddress()
		// const userAddressExists = emojiReactions.includes(await signer.getAddress())

		// if user address exists, remove it
		// if (userAddressExists) {
		// 	reactions.value = {
		// 		...reactions.value,
		// 		[emoji]: emojiReactions.filter((address) => address !== userAddress),
		// 	}
		// } else {
		// 	// if user address does not exist, add it
		// 	reactions.value = {
		// 		...reactions.value,
		// 		[emoji]: [...emojiReactions, userAddress],
		// 	}
		// }
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
	console.log('remove reaction hit: ', reactionId)
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
