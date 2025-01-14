import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  server: {
    port: 3000
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        // 移除 debugger
        drop_debugger: true,
        // 移除 console.log
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  }
})
