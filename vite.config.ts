import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Standard Vite configuration.
// The complex 'define' and 'loadEnv' logic has been removed as it is no longer needed.
// The frontend code no longer handles API keys directly.
export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
    // The proxy is still useful for local development, so we keep it.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
