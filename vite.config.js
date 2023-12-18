import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import fs from 'fs'

export default defineConfig({
  plugins: [vue(), nodePolyfills()],
  server: {
    // https: {
    //   key: fs.readFileSync('../../ssl/panicbot.xyz.key'),
    //   cert: fs.readFileSync('../../ssl/panicbot_xyz.crt'),
    // },
    strictPort: true,
    port: 3010,
    // hmr: {
    //   protocol: 'wss',
    //   clientPort: 443
    // },
  },
  define: {
    'process.env': {}
  }
})

// export default defineConfig({
//   plugins: [vue()],
//   define: {
//     'process.env': {}
//   }
// })

