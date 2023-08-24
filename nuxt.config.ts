// https://nuxt.com/docs/api/configuration/nuxt-config
const viteRawPlugin = require('vite-raw-plugin')
export default {
  // devtools: { enabled: true },
  // typescript: {
  //   shim: false
  // },
  ssr: false,
  experimentalNoScripts: false,
  css: ["@/assets/styles/index.scss"],
  vite: {
		plugins: [viteRawPlugin({
      fileRegex: /\.wgsl$/i
    })],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/variables.scss";',
        },
      },
    },
	},
  modules: [
    '@element-plus/nuxt'
  ],
  elementPlus: { /** Options */ }
}
