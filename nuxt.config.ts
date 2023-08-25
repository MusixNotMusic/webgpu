// https://nuxt.com/docs/api/configuration/nuxt-config
const viteRawPlugin = require('vite-raw-plugin')
export default {
  ssr: false,
  title: 'webgpu',
  css: ["@/assets/styles/index.scss"],
  spaLoadingTemplate: false,
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
