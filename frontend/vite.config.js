import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // load environment variables so FRONTEND can use BACKEND_PORT
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = process.env.BACKEND_PORT || env.BACKEND_PORT || 8080;

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
        '/images': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  });
};
