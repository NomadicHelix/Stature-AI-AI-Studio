/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // "Gold Standard" Global Mocking:
    // This alias configuration is the core of the fix. It tells Vitest
    // to replace any import from a Firebase package with our single,
    // centralized mock file. This ensures no real Firebase code is ever
    // loaded during tests, preventing crashes and network requests.
    alias: [
      {
        find: 'firebase/app',
        replacement: path.resolve(__dirname, 'src/test/__mocks__/firebase.ts'),
      },
      {
        find: 'firebase/auth',
        replacement: path.resolve(__dirname, 'src/test/__mocks__/firebase.ts'),
      },
      {
        find: 'firebase/firestore',
        replacement: path.resolve(__dirname, 'src/test/__mocks__/firebase.ts'),
      },
      {
        find: 'firebase/app-check',
        replacement: path.resolve(__dirname, 'src/test/__mocks__/firebase.ts'),
      },
      {
        find: 'firebase/analytics',
        replacement: path.resolve(__dirname, 'src/test/__mocks__/firebase.ts'),
      },
    ],
  },
});
