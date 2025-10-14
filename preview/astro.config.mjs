import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import clubs from '@devprotocol/clubs-core'
import vue from '@astrojs/vue'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'

// eslint-disable-next-line functional/no-expression-statement
config({ path: './.env' })

export default defineConfig({
	server: {
		port: 3000,
		host: true,
	},
	output: 'server',
	integrations: [clubs(), vue(), svelte()],
	vite: {
		plugins: [tailwindcss()],
	},
})
