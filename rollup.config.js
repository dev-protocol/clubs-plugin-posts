import { dirname, relative, resolve } from 'path'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

const dir = 'dist'
const dirPluginHelper = 'dist/plugin-helper'

const useSrc = ({ dir: _dir, ext } = {}) => ({
	name: 'local:useSrc',
	resolveId(source, importer) {
		if (ext.some((e) => source.endsWith(e))) {
			const from = _dir ?? dirname(importer)
			const importerDir = dirname(importer)
			const original = resolve(importerDir, source)
			const relativePath = relative(from, original)
			return {
				id: relativePath,
				external: true,
			}
		}
	},
})

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				dir,
				format: 'es',
			},
		],
		plugins: [
			typescript(),
			useSrc({
				ext: [
					'.astro',
					'.svelte',
					'.vue',
					'.scss',
					'.css',
					'.jpg',
					'.png',
					'.svg',
				],
				dir,
			}),
		],
	},
	{
		input: 'src/plugin-helper/index.ts',
		output: [
			{
				dir: dirPluginHelper,
				format: 'es',
			},
		],
		plugins: [typescript({ compilerOptions: { outDir: dirPluginHelper } })],
	},
	{
		input: 'dist/src/index.d.ts',
		output: [
			{
				file: 'dist/index.d.ts',
				format: 'es',
			},
		],
		plugins: [dts()],
	},
	{
		input: 'dist/plugin-helper/src/plugin-helper/index.d.ts',
		output: [
			{
				file: 'dist/plugin-helper/index.d.ts',
				format: 'es',
			},
			{
				file: 'plugin-helper.d.ts',
				format: 'es',
			},
		],
		plugins: [dts()],
	},
]
