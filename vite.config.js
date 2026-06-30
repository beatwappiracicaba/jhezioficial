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
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  });
};
