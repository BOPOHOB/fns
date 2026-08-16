import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    // @animated-burgers импортирует classnames, у нас уже clsx
    alias: { classnames: 'clsx' },
  },
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    emptyOutDir: !isSsrBuild,
    ...(isSsrBuild
      ? {
          rollupOptions: {
            input: 'src/entry.server.tsx',
            output: {
              entryFileNames: 'entry-server.js',
              format: 'esm',
            },
          },
        }
      : {}),
  },
  ssr: {
    // Bundle deps so Deno can import a single ESM file without node_modules resolution
    noExternal: true,
    target: 'webworker',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
}))
