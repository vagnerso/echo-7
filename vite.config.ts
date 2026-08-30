import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serve o projeto em /echo-7/, nao na raiz do dominio -
  // sem isso, os assets (JS/CSS) gerados pelo build apontariam para
  // caminhos absolutos errados uma vez publicado.
  base: '/echo-7/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
  },
});
