import { defineConfig } from 'vite'
import { resolve } from 'path'

// Separate Vite config for the embeddable widget bundle
// Outputs a single IIFE JS file with no dependencies
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'widget/src/index.js'),
      name: 'ScorePorch',
      formats: ['iife'],
      fileName: () => 'scoreporch-widget.js',
    },
    outDir: 'dist-widget',
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
