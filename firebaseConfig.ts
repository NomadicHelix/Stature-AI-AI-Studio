// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics } from "firebase/analytics";

// ============================================================================
//  IMPORTANT: API Key Security
// ============================================================================
// To prevent unauthorized use of your Firebase project, it is highly recommended
// to restrict your API key in the Google Cloud Console. You should restrict it
// to your app's domain.
//
// For more information, see the following page:
// https://firebase.google.com/docs/projects/api-keys
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCIcI4k8jU26oI7gEA8y11FpFNdVetqI4Y",
  authDomain: "stature-ai-g-ai-studio.firebaseapp.com",
  projectId: "stature-ai-g-ai-studio",
  storageBucket: "stature-ai-g-ai-studio.appspot.com",
  messagingSenderId: "677736743491",
  appId: "1:677736743491:web:ca7f2a983f09d28c274af6",
  measurementId: "G-8TGSXXWC6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// Initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcaPuYrAAAAAN5gmTrlpc5gnoa2XH72uuL1zlI4'),
  isTokenAutoRefreshEnabled: true
});


export { auth, db, googleProvider, analytics, appCheck };
