import { defineConfig } from 'vite';

/**
 * Builds the AFTERIMAGE skin as a standalone ES module for other projects:
 *   dist-skin/afterimage-skin.js
 * Styles are inlined (the skin adopts them into its shadow root), and
 * Video.js stays external: the host project installs @videojs/html itself.
 */
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist-skin',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: 'src/skin/index.ts',
      formats: ['es'],
      fileName: () => 'afterimage-skin.js',
    },
    rollupOptions: {
      external: [/^@videojs\//],
    },
  },
});
