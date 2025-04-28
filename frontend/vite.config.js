// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // Configuración para asegurar que las rutas de React funcionen correctamente
  // cuando se accede directamente a través de la URL
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Configuración para manejar correctamente las rutas en desarrollo y producción
  base: '/',
})
