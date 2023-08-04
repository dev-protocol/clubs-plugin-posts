<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { BrowserProvider } from 'ethers'
import { connection } from '@devprotocol/clubs-core/connection'

const walletAddress = ref<string | undefined>('')

const handleConnection = async () => {
	const signer = connection().signer.value
	if (!signer) {
		return
	}

	// get wallet address
	const connectedAddress = await signer.getAddress();
	walletAddress.value = connectedAddress;
}

onMounted(() => {
	connection().signer.subscribe(handleConnection);
})

const onClick = async () => {
	try {
		const eth = (window as any).ethereum
		await eth.send('eth_requestAccounts')
		connection().setEip1193Provider(eth, BrowserProvider)
	} catch (error) {
		console.error(error)
	}
}
</script>

<template>
	<div class="container mx-auto py-8">
		<div class="flex justify-end">
			<button
		v-if="!walletAddress"
		class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none"
		@click="onClick"
	>
		Wallet connect
	</button>
		</div>
	</div>
</template>
