import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src', // ensure this points to the src directory
    },
  },
  plugins: [vue()],
  build: {
    // This will prevent Vite from creating separate files for chunks
    chunkSizeWarningLimit: 500, // Optionally adjust the chunk size warning limit
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable chunking
      },
    },
  },
})
