import { defineConfig } from 'vite'
import { minify_html } from './vite/html_minify'

export default defineConfig({
	plugins: [
		// minify_html()
	],
	build: {
		minify: false,
		rollupOptions: {
			output: {
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`
			}
		}
	}
})
