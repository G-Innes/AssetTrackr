import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const baseConfig = {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
  
  // Use different proxy settings for dev and preview
  if (command === 'serve') {
    // Development mode
    return {
      ...baseConfig,
      server: {
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:3000',
            changeOrigin: true,
            secure: false,
          },
        },
      },
    }
  } else {
    // Preview/build mode
    return {
      ...baseConfig,
      preview: {
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:3000',
            changeOrigin: true,
            secure: false,
          },
        },
      },
    }
  }
})
