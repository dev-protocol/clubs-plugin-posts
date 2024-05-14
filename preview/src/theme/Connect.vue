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
	const connectedAddress = await signer.getAddress()
	walletAddress.value = connectedAddress
}

onMounted(() => {
	connection().signer.subscribe(handleConnection)
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
	<span>
		<button
			v-if="!walletAddress"
			class="rounded-3xl w-full border border-transparent bg-blue-600 px-8 py-2 text-base text-white shadow-sm focus:outline-none"
			@click="onClick"
		>
			Wallet connect
		</button>
	</span>
</template>
