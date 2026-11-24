import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The rocket cursor images only matter once React has switched the cursor on,
// so they ship as their own files instead of being inlined into the
// render-blocking stylesheet. Everything else keeps Vite's default limit.
const CURSOR_ASSET = /[\\/]assets[\\/]cursors[\\/]/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    assetsInlineLimit: (filePath) => (CURSOR_ASSET.test(filePath) ? false : undefined),
  },
})
