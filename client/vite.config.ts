import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// In development and in `vite preview` the API is reached through this proxy,
// so the browser only ever talks to one origin.
const apiProxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000',
    changeOrigin: true,
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
