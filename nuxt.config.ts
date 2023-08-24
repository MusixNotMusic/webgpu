// https://nuxt.com/docs/api/configuration/nuxt-config
const viteRawPlugin = require('vite-raw-plugin')
export default {
  // devtools: { enabled: true },
  // typescript: {
  //   shim: false
  // },
  ssr: false,
  experimentalNoScripts: false,
  vite: {
		plugins: [viteRawPlugin({
      fileRegex: /\.wgsl$/i
    })],
	},
}
