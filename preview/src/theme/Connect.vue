<script lang="ts" setup>
import { ref } from 'vue'
import { BrowserProvider } from 'ethers'
import { connection } from '@devprotocol/clubs-core/connection'
const address = ref<string | undefined>('')

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
	<button
		class="py-2 px-8 text-base text-white bg-blue-600 border border-transparent rounded-3xl shadow-sm focus:outline-none"
		@click="onClick"
	>
		Wallet connect
	</button>
</template>
