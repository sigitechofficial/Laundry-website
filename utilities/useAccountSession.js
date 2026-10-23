"use client";

import { useEffect, useState } from "react";
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

/**
 * Signed-in state for the site header. Same behaviour as the legacy
 * components/Header.jsx:
 *  - follows login/logout across tabs (storage) and in-tab
 *    (`userLogin` / `userLogout` window events),
 *  - loads the profile for the avatar and greeting,
 *  - registers the device for push notifications and shows foreground
 *    messages as toasts.
 */
export function useAccountSession() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const { data, isLoading } = useGetProfileQuery(userId, {
    skip: !userId || !isLoggedIn,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const sync = () => {
      // Signed in = the loginStatus flag, or a customer (non-guest) access token.
      // Some sign-in paths left the flag unset, so the header said "Log in"
      // while orders and payments worked; restore the flag in that case.
      const tokenUserId = customerIdFromToken(read("accessToken"));
      const signedIn = Boolean(read("loginStatus")) || Boolean(tokenUserId);
      if (signedIn && !read("loginStatus")) {
        localStorage.setItem("loginStatus", "true");
        if (!read("userId") && tokenUserId) localStorage.setItem("userId", tokenUserId);
      }
      setIsLoggedIn(signedIn);
      setUserId(signedIn ? read("userId") || tokenUserId : null);
    };
    sync();
    setMounted(true);

    window.addEventListener("storage", sync);
    window.addEventListener("userLogout", sync);
    window.addEventListener("userLogin", sync);

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

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("userLogout", sync);
      window.removeEventListener("userLogin", sync);
    };
  }, []);

  const profile = data?.data;
  const storedName = read("userName") || "";
  const firstName = profile?.firstName || storedName.split(" ")[0] || "";
  const lastName = profile?.lastName || storedName.split(" ")[1] || "";
  const image = read("profileImage") || (profile?.image ? BASE_URL + profile.image : null);

  return {
    mounted,
    isLoggedIn,
    profileResponse: data,
    isLoading,
    firstName: firstName || "there",
    initials: ((firstName[0] || "") + (lastName[0] || "")).toUpperCase(),
    image,
  };
}
