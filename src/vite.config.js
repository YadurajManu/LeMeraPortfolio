import react from '@vitejs/plugin-react'

export default {
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
  },
  plugins: [react()],
  publicDir: "public",
  envDir: "../",
  optimizeDeps: {
    include: ['three']
  },
  define: {
    global: 'globalThis',
  }
};