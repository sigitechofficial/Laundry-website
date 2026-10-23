"use client";

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearCartData, setPage } from "@/app/store/slices/cartItemSlice";

export const BOOKING_DRAFT_KEY = "jdc:bookingDraft";

/**
 * Starts the booking journey from any marketing CTA.
 *
 * Routing matches `ClientBtn` in HelperFunctions.js:
 *   signed out            -> /sign-in
 *   signed in + cart      -> /checkout/order
 *   signed in, no cart    -> /place-order
 *
 * An optional draft (pickup day, postcode) is kept in sessionStorage so
 * the booking flow can pre-fill it after sign-in.
 */
export function useStartBooking() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useCallback(
    (draft) => {
      if (typeof window === "undefined") return;

      if (draft) {
        try {
          sessionStorage.setItem(
            BOOKING_DRAFT_KEY,
            JSON.stringify({ ...draft, savedAt: Date.now() })
          );
        } catch {
          // Storage can be unavailable (private mode); the draft is optional.
        }
      }

      const token = localStorage.getItem("loginStatus");

      dispatch(setPage(true)); // shows the global loading overlay
      if (!token) router.push("/sign-in");
      // A postcode typed on the page (home hero) starts at the address/time step with it
      else if (draft?.postcode) router.push("/place-order");
      else if (hasBookingInProgress()) router.push("/checkout/order");
      else {
        // New booking: drop whatever was left from an unfinished one (old address etc.),
        // so the form starts empty instead of showing a previous address.
        dispatch(clearCartData());
        dispatch(setPage(true)); // clearCartData resets the loading overlay flag
        router.push("/place-order");
      }
    },
    [dispatch, router]
  );
}

/**
 * True when the saved booking already has its pickup chosen, so the customer
 * can carry on at the services step. (`orderData` is always stored, even
 * empty after an order is placed, so its mere presence is not enough.)
 */
export function hasBookingInProgress() {
  if (typeof window === "undefined") return false;
  try {
    const order = JSON.parse(localStorage.getItem("orderData") || "null");
    return Boolean(order?.collectionData?.collectionDate);
  } catch {
    return false;
  }
}

/** Reads the draft saved by `useStartBooking` and removes it (it is used once), or null. */
export function takeBookingDraft() {
  const draft = readBookingDraft();
  try {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY);
  } catch {
    // ignore
  }
  // only fresh drafts (the customer just came from the form)
  return draft && Date.now() - (draft.savedAt || 0) < 30 * 60 * 1000 ? draft : null;
}

/** Reads the draft saved by `useStartBooking`, or null. */
export function readBookingDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
