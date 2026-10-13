import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApYXQsPo4aMFo3tEsOg1enAo707Bxq5pQ",
  authDomain: "justdrycleansltd.firebaseapp.com",
  projectId: "justdrycleansltd",
  storageBucket: "justdrycleansltd.firebasestorage.app",
  messagingSenderId: "475975874912",
  appId: "1:475975874912:web:de3b0055f6467d0762c605",
  measurementId: "G-1RC12F3PH2",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.setCustomParameters({ display: "popup" });
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

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

let messaging = null;

const getMessagingInstance = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    } else {
      console.warn("Firebase Messaging not supported in this browser.");
    }
  }
  return null;
};

export {
  auth,
  googleProvider,
  facebookProvider,
  appleProvider,
  getToken,
  onMessage,
  getMessagingInstance,
};
