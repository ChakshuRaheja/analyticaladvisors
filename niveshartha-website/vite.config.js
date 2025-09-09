import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true, // Force use of port 5175 only
    watch: {
      usePolling: true
    },
    hmr: {
      overlay: true,
      clientPort: 5175
    },
    cors: true,
    proxy: {
      // Forward API requests to the backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // Proxy for contact form to avoid CORS in development
      '^/contact': {
        target: 'https://omkara-backend-725764883240.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/contact/, '')
      },
      '/api/proxy': {
        target: 'https://analytics-advisor-backend-1-583205731005.us-central1.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '')
      },
      // Keep the old proxy for backward compatibility
      '/analytics-api': {
        target: 'https://analytics-advisor-backend-1-583205731005.us-central1.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/analytics-api/, '')
      }
    }
  },
  preview: {
    port: 5175
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ]
  },
  base: '/',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-ui': ['framer-motion', 'react-intersection-observer']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
