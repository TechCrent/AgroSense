import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || env.API_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    server: {
      proxy: {
        // When VITE_API_BASE_URL is empty, axios hits Vite; forward /api → Django.
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
  }
})
