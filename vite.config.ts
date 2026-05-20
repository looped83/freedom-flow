import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Fetches the stylesheet early (preload) while keeping it render-blocking (no onload
// deferred-apply chain). Eliminates both forced reflow and the critical-request-chain
// that the onload trick creates.
function preloadCss(): Plugin {
  return {
    name: 'preload-css',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        `<link rel="preload" as="style" crossorigin href="$1">\n    <link rel="stylesheet" crossorigin href="$1">`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadCss()],
  base: '/freedom-flow/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
