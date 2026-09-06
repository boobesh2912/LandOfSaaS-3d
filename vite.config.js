import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const clerkKey = env.CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aWRlYWwtcmhpbm8tNDU5MC5jbGVyay5hY2NvdW50cy5kZXYk';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey)
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    }
  };
});
