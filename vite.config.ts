import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Explicitly load variables from .env files in the project root.
  // process.cwd() ensures it looks in the correct directory.
  // This is more robust than relying on default behavior which seems to be failing.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    // The 'define' option performs a direct text replacement.
    // This will find 'import.meta.env.VITE_GEMINI_API_KEY' in your code
    // and replace it with the value loaded from your .env file, ensuring it is
    // available and preventing the app from crashing.
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
  };
});
