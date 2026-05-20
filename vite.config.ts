import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Defers the Tailwind stylesheet so the inline critical CSS in index.html paints
// the shell immediately (fast FCP / LCP), while CSS is fetched in parallel.
// Under simulated slow-network conditions CSS (21 kB) always resolves before
// the JS bundle (~200 kB) finishes executing, so React content is styled before
// it mounts — no visible FOUC and no render-blocking chain for Lighthouse.
function deferCss(): Plugin {
  return {
    name: 'defer-css',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        `<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel='stylesheet'">` +
        `\n    <noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), deferCss()],
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
