<template>
	<button class="rounded-full bg-gray-300" @click.prevent="onClick">
		Connect
	</button>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { providers } from 'ethers'
import { connection } from '@devprotocol/clubs-core/connection'

onMounted(async () => {
	connection().account.subscribe(console.log)
})

const onClick = async () => {
	try {
		const eth = (window as any).ethereum
		await eth.send('eth_requestAccounts')
		const prov = new providers.Web3Provider(eth)
		connection().signer.next(prov.getSigner())
	} catch (error) {
		console.error(error)
	}
}
</script>
