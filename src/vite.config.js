export default {
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
  },
  publicDir: "public",
  envDir: "../",
  optimizeDeps: {
    include: ['three']
  },
  define: {
    global: 'globalThis',
  }
};
