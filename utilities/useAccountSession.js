"use client";

import { useEffect, useSyncExternalStore } from "react";
import { onMessage } from "firebase/messaging";
import { addToast } from "@heroui/react";
import { useGetProfileQuery } from "@/app/store/services/api";
import { BASE_URL } from "./URL";
import { getMessagingInstance } from "./firebase";
import { requestDeviceToken } from "./requestFCMToken";

const read = (key) => (typeof window !== "undefined" ? localStorage.getItem(key) : null);

// Customer id from a signed-in access token; null for guest tokens ({ guest: true })
// or anything unreadable. Only used to tell signed-in from signed-out, never trusted.
function customerIdFromToken(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return json && !json.guest && json.id ? String(json.id) : null;
  } catch {
    return null;
  }
}

/*
 * One signed-in state for the whole tab, read from localStorage.
 *
 * It lives here, outside React, because the header is mounted again on every page
 * (each page has its own PageShell). When each header kept its own copy, it started
 * as "unknown" after every navigation and the header buttons blinked out for a frame.
 * With useSyncExternalStore a newly mounted header reads the current state at once;
 * only the very first (server-rendered) paint shows "unknown".
 */
const AUTH_EVENTS = ["storage", "userLogin", "userLogout"];
const SERVER = { known: false, signedIn: false, userId: null, userName: "", image: null };
let snapshot = null;

function readSession() {
  const tokenUserId = customerIdFromToken(read("accessToken"));
  // Signed in = the loginStatus flag, or a customer (non-guest) access token.
  const signedIn = Boolean(read("loginStatus")) || Boolean(tokenUserId);
  const next = {
    known: true,
    signedIn,
    userId: signedIn ? read("userId") || tokenUserId : null,
    userName: read("userName") || "",
    image: read("profileImage") || null,
  };
  // same object while nothing changed, so React does not re-render for nothing
  if (!snapshot || Object.keys(next).some((k) => next[k] !== snapshot[k])) snapshot = next;
  return snapshot;
}

function subscribe(onChange) {
  AUTH_EVENTS.forEach((e) => window.addEventListener(e, onChange));
  return () => AUTH_EVENTS.forEach((e) => window.removeEventListener(e, onChange));
}

// Once per tab, not once per header: push messages shown as toasts + device token.
let messagingStarted = false;
function startMessaging() {
  if (messagingStarted) return;
  messagingStarted = true;
  getMessagingInstance().then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      addToast({
        title: "Notification",
        description: payload?.notification?.title,
        color: "success",
      });
    });
  });
  requestDeviceToken();
}

/**
 * Signed-in state for the site header:
 *  - follows login/logout across tabs (storage) and in-tab
 *    (`userLogin` / `userLogout` window events),
 *  - loads the profile for the avatar and greeting,
 *  - registers the device for push notifications and shows foreground
 *    messages as toasts.
 */
export function useAccountSession() {
  const session = useSyncExternalStore(subscribe, readSession, () => SERVER);

  // Some sign-in paths left the loginStatus flag unset, so the header said "Log in"
  // while orders and payments worked; restore the flag in that case.
  useEffect(() => {
    if (!session.signedIn || read("loginStatus")) return;
    localStorage.setItem("loginStatus", "true");
    if (!read("userId") && session.userId) localStorage.setItem("userId", session.userId);
  }, [session.signedIn, session.userId]);

  useEffect(startMessaging, []);

  const { data, isLoading } = useGetProfileQuery(session.userId, {
    skip: !session.userId || !session.signedIn,
  });

  const profile = data?.data;
  const firstName = profile?.firstName || session.userName.split(" ")[0] || "";
  const lastName = profile?.lastName || session.userName.split(" ")[1] || "";
  const image = session.image || (profile?.image ? BASE_URL + profile.image : null);

  return {
    mounted: session.known,
    isLoggedIn: session.signedIn,
    profileResponse: data,
    isLoading,
    firstName: firstName || "there",
    initials: ((firstName[0] || "") + (lastName[0] || "")).toUpperCase(),
    image,
  };
}
