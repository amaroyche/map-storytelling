import path from 'path'
import { defineConfig } from 'vite'

export const viteEntryPoints = {
  main: path.resolve(__dirname, 'index.html'),
}
export const viteAnalyzeEntryPoints = {
  main: path.resolve(__dirname, 'index.html'),
}

export const aliases = [
  {
    alias: '@src',
    dir: path.resolve(__dirname, 'src'),
  }
]

export default defineConfig({
  server: {
    port: 3001,
  },
  assetsInclude: ['**/*.json'],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {}
    },
  },
  resolve: {
    alias: aliases.map(a => {
      return {
        find: a.alias,
        replacement: a.dir
      }
    })
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: viteEntryPoints,
      output: {
        assetFileNames: 'assets/[hash][extname]',
        chunkFileNames: 'assets/[hash].js',
      },
    },
  },
})