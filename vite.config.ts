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
      // Redirige /api/... al servidor PHP en Apache/XAMPP
      '^/api': {
        target: 'http://localhost/PARCE/public/index.php',
        changeOrigin: true,
        rewrite: (path) => {
          // /api/auth/login → /api/auth/login
          // (no reescribir, PHP ya lo maneja)
          return path;
        },
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[proxy] Error conectando al backend PHP:', err.message);
          });
        },
      },
    },
  },
})
