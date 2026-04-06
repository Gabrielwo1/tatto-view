import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-client': ['@supabase/supabase-js'],
          'stripe': ['@stripe/stripe-js'],
        },
      },
    },
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Minify with Terser for better optimization
    minify: 'terser',
  },
  server: {
    // Enable hot module replacement
    hmr: true,
    // Allow connections from network (useful for testing on other devices)
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
