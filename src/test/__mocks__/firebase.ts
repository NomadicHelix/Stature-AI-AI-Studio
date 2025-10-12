// src/test/__mocks__/firebase.ts
import { vi } from 'vitest';

// This file provides a centralized, global mock for all Firebase services.
// It is used by the vitest.config.ts alias to replace real Firebase imports
// during testing, ensuring that no real network calls are ever made.

// --- Firebase App ---
export const initializeApp = vi.fn(() => ({}));

// --- Firebase Auth ---
export const getAuth = vi.fn(() => ({}));
export const onAuthStateChanged = vi.fn((auth, callback) => {
  callback(null); // Default mock: user is logged out.
  return () => {}; // Return a mock unsubscribe function.
});
export const signOut = vi.fn(() => Promise.resolve());
export const createUserWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: {} }));
export const signInWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: {} }));
export const signInWithPopup = vi.fn(() => Promise.resolve({ user: {} }));
export const GoogleAuthProvider = vi.fn(() => ({}));

// --- Firestore ---
export const getFirestore = vi.fn(() => ({}));
export const doc = vi.fn(() => ({}));
export const getDoc = vi.fn(() => Promise.resolve({ exists: () => false }));
export const setDoc = vi.fn(() => Promise.resolve());

// --- App Check ---
export const initializeAppCheck = vi.fn(() => ({}));
export const ReCaptchaV3Provider = vi.fn(() => ({}));
export const DebugAppCheckProvider = vi.fn(() => ({})); // Now correctly mocked

// --- Analytics ---
export const getAnalytics = vi.fn(() => ({}));
