import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin to duplicate index.html to 404.html for SPA static hosting fallback
const spaFallbackPlugin = () => ({
  name: 'spa-fallback',
  closeBundle() {
    try {
      const distDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(distDir, 'index.html')
      const notFoundPath = path.join(distDir, '404.html')
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath)
        console.log('✓ Successfully created 404.html fallback for SPA routing.')
      }
    } catch (e) {
      console.error('Failed to create 404.html fallback:', e)
    }
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
})
