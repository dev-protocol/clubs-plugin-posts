<script lang="ts" setup>
import { ref } from 'vue'
import { providers } from 'ethers'
import { connection } from '@devprotocol/clubs-core/connection'
interface Emits {
	(e: 'connect:wallet', address: string): void
}
const address = ref<string | undefined>('')

const emit = defineEmits<Emits>()

const onClick = async () => {
	try {
		const eth = (window as any).ethereum
		await eth.send('eth_requestAccounts')
		const prov = new providers.Web3Provider(eth)
		connection().signer.next(prov.getSigner())

		emit('connect:wallet', await prov.getSigner().getAddress())
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
