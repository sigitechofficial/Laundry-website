// utilities/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDdZLCsf0CQN_DIkE0mAOmRv9_pvlRq2qg",
  authDomain: "laundry-app-bf43c.firebaseapp.com",
  projectId: "laundry-app-bf43c",
  storageBucket: "laundry-app-bf43c",
  messagingSenderId: "880600214434",
  appId: "1:880600214434:web:1c36e828fbcb66ff5ee0fb",
  measurementId: "G-PXSBBGRXRF",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.setCustomParameters({ display: "popup" });

// let messaging = null;
// if (typeof window !== "undefined") {
//   isSupported().then((supported) => {
//     if (supported) {
//       messaging = getMessaging(app);
//     }
//   });

//   getAnalytics(app);
// }

if (typeof window !== "undefined") {
  getAnalytics(app);
}

// ✅ instead of exporting messaging directly
const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging not supported in this browser.");
    return null;
  }
  return getMessaging(app);
};

export {
  auth,
  googleProvider,
  facebookProvider,
  messaging,
  getToken,
  onMessage,
  getMessagingInstance,
};
