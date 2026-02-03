
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || process.env.API_KEY),
      // Memastikan 'process' tersedia sebagai objek global jika ada pustaka yang memerlukannya
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY || env.VITE_API_KEY || process.env.API_KEY)
      }
    }
  };
});
