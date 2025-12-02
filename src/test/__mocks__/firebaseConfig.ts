// src/test/__mocks__/firebaseConfig.ts
import { vi } from "vitest";

// Mock the onAuthStateChanged function to immediately call the callback
// with a null user, simulating a logged-out state.
export const onAuthStateChanged = vi.fn((_auth, callback) => {
  // Mark 'auth' as unused
  callback(null); // Immediately invoke with no user
  return () => {}; // Return an unsubscribe function
});

export const signOut = vi.fn(() => Promise.resolve());

// Export mock objects for other Firebase services
export const auth = {};
export const db = {};
export const googleProvider = {};
