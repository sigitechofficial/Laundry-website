// utilities/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider,FacebookAuthProvider  } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDdZLCsf0CQN_DIkE0mAOmRv9_pvlRq2qg",
  authDomain: "laundry-app-bf43c.firebaseapp.com",
  projectId: "laundry-app-bf43c",
  storageBucket: "laundry-app-bf43c",
  messagingSenderId: "880600214434",
  appId: "1:880600214434:web:1c36e828fbcb66ff5ee0fb",
  measurementId: "G-PXSBBGRXRF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth and Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.setCustomParameters({ display: 'popup' });

// Optional: Analytics (only in browser environments)
if (typeof window !== "undefined") {
  getAnalytics(app);
}

export { auth, googleProvider,facebookProvider };
