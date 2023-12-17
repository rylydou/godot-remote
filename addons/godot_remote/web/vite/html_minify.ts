import { Plugin } from 'vite'
import { minify, Options } from 'html-minifier-terser'


export function minify_html(options?: Options): Plugin {
	return {
		name: 'minify-html',
		enforce: 'post',
		apply: 'build',
		transformIndexHtml: (html) => {
			return minify(html, {
				removeComments: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeAttributeQuotes: false,
				removeEmptyAttributes: true,
				minifyCSS: true,
				minifyJS: true,
				minifyURLs: true,
				...options,
			})
		},
	}
}
