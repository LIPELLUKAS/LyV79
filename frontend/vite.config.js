import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  // Configuração para garantir que o roteamento SPA funcione corretamente
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Garante que o index.html seja copiado para a raiz do diretório de saída
    emptyOutDir: true,
    // Configuração para lidar com rotas SPA
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
