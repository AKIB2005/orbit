import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { aiServerPlugin } from './src/server/aiServerPlugin.ts'
import { githubServerPlugin } from './src/server/githubServerPlugin.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), aiServerPlugin(), githubServerPlugin()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
})
