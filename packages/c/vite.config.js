import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist', // Output directory
    assetsDir: 'assets', // Directory for static assets
    sourcemap: false, // Enable source maps (set to true for debugging)
    minify: 'esbuild', // Options: 'esbuild' (default) | 'terser' (slower but smaller)
	lib: {
		entry: 'dist/index.js',
		name: 'MyBundle', // Global variable name (for UMD/IIFE builds)
		fileName: 'bundle', // Output file name
		formats: ['iife'], // Output format: 'es', 'cjs', 'umd', or 'iife'
	},
  },
});
