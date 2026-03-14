import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { tmpdir } from 'os'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: resolve(tmpdir(), '.vite-70-30'),
  server: {
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
