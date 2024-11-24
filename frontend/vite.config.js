import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ensure Vite is accessible on the local network
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://192.168.0.107:8000', // Replace with your backend's local IP
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: Rewrite the path if necessary
      },
    },
  },
})
