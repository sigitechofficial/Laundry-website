"use client";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { app as defaultApp } from "./firebase";

// Live tracking signs in with a backend-issued custom token. It uses its own named app so that
// sign-in never replaces the Google/Apple user on the default app, but that app is built from
// the default app's options: same Firebase project, no second config to keep in step.
const TRACKING_APP_NAME = "liveTracking";

function getTrackingApp() {
  const existing = getApps().find((app) => app.name === TRACKING_APP_NAME);
  if (existing) return existing;
  return initializeApp(defaultApp.options, TRACKING_APP_NAME);
}

export function getLiveTrackingAuth() {
  return getAuth(getTrackingApp());
}

/**
 * RTDB URL for a live-tracking session: the session's `databaseUrl` (current backends) or
 * `databaseURL` (older backends), else the Firebase config's own, else null.
 */
export function resolveLiveTrackingDatabaseUrl(session) {
  const fromSession = session?.databaseUrl ?? session?.databaseURL;
  if (fromSession) return String(fromSession);
  return getTrackingApp().options.databaseURL ?? null;
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
