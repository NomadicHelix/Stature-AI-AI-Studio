import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // This port MUST match the port configured in firebase.json
    const functionsPort = 5001;
    const functionsHost = 'localhost';

    return {
      server: {
        port: 3000, 
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: `http://${functionsHost}:${functionsPort}`,
            changeOrigin: true,
          },
        }
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
