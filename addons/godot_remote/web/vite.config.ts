import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"
import { minify_html } from './vite/html_minify'

export default defineConfig({
	plugins: [viteSingleFile({ removeViteModuleLoader: true }), minify_html()],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`
			}
		}
	}
})
