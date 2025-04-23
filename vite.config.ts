import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src', // ensure this points to the src directory
    },
  },
  plugins: [vue()],
})
