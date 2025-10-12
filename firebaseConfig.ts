// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCIcI4k8jU26oI7gEA8y11FpFNdVetqI4Y",
  authDomain: "stature-ai-g-ai-studio.firebaseapp.com",
  projectId: "stature-ai-g-ai-studio",
  storageBucket: "stature-ai-g-ai-studio.appspot.com",
  messagingSenderId: "677736743491",
  // This appId has been restored to its correct, valid format.
  appId: "1:677736743491:web:ca7f2a983f09d28c274af6",
  measurementId: "G-8TGSXXWC6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// App Check has been removed for now to ensure stability.
// We can re-introduce it carefully later.

export { auth, db, googleProvider, analytics };
