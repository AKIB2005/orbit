import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { aiServerPlugin } from './src/server/aiServerPlugin.ts'
import { githubServerPlugin } from './src/server/githubServerPlugin.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), aiServerPlugin(), githubServerPlugin()],
  build: {
    target: 'es2022',
  },
})
