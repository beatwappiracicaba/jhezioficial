import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return defineConfig({
    plugins: [react()],
    envPrefix: ['VITE_'],
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    define: {
      'process.env': {
        ...env,
      },
    },
  });
};
