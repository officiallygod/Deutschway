import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'mascot.png'],
      manifest: {
        name: 'Deutschway',
        short_name: 'Deutschway',
        description: 'Learn 5 German words daily',
        theme_color: '#f4f7f6',
        icons: [
          {
            src: 'mascot.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'mascot.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/Deutschway/',
})
