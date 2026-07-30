import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Redirige /api/... al servidor PHP en localhost:8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // El PHP ya tiene el prefijo /api en sus rutas, no hace falta rewrite
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[proxy] Error conectando al backend PHP:', err.message);
          });
        },
      },
    },
  },
})
