import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: false,
    exclude: ['**/e2e/**', 'node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      include: [
        'src/api/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/routes/_auth.tsx',
        'src/routes/_auth/index.tsx',
        'src/routes/_auth/project/$projectId/route.tsx',
        'src/routes/_auth/project/$projectId/index.tsx',
        'src/stores/**/*.{ts,tsx}',
        'src/components/review/getStatusBadge.tsx',
        'src/components/utils/formatMutator.ts',
      ],
      exclude: [
        '**/__tests__/**',
        '**/*.{test,spec}.{ts,tsx}',
        'src/test-setup.ts',
        'src/test-utils.tsx',
        'src/reportWebVitals.ts',
      ],
    },
  },
})
