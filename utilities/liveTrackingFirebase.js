"use client";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDdZLCsf0CQN_DIkE0mAOmRv9_pvlRq2qg",
  authDomain: "laundry-app-bf43c.firebaseapp.com",
  projectId: "laundry-app-bf43c",
  storageBucket: "laundry-app-bf43c",
  messagingSenderId: "880600214434",
  appId: "1:880600214434:web:1c36e828fbcb66ff5ee0fb",
  databaseURL: "https://laundry-app-bf43c-default-rtdb.firebaseio.com",
};

const TRACKING_APP_NAME = "liveTracking";

function getTrackingApp() {
  const existing = getApps().find((app) => app.name === TRACKING_APP_NAME);
  if (existing) return existing;
  return initializeApp(firebaseConfig, TRACKING_APP_NAME);
}

export function getLiveTrackingAuth() {
  return getAuth(getTrackingApp());
}

export function getLiveTrackingDatabase(databaseURL) {
  const app = getTrackingApp();
  if (databaseURL) {
    return getDatabase(app, databaseURL);
  }
  return getDatabase(app);
}

export async function signInForLiveTracking(firebaseAuthToken) {
  const auth = getLiveTrackingAuth();
  await signInWithCustomToken(auth, firebaseAuthToken);
  return auth.currentUser;
}

export { ref, onValue };
