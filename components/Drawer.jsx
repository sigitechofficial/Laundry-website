"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";
import { useEffect, useState } from "react";
import DrawerItem from "./DrawerItem";
import {
  MdOutlineSupportAgent,
  MdLogout,
  MdPauseCircleOutline,
  MdAttachMoney,
  MdArticle,
  MdOutlinePeople,
  MdOutlineHistory,
  MdOutlineAccountCircle,
  MdOutlineNotifications,
  MdOutlinePublic,
} from "react-icons/md";
import { FaRegAddressBook, FaUser } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/react";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { BASE_URL } from "../utilities/URL";
import { signOut } from "firebase/auth";
import { auth } from "../utilities/firebase";
import { clearAllCookies } from "../utilities/cookieUtils";
import { api } from "@/app/store/services/api";

export default function CustomDrawer({
  data,
  isOpen,
  onClose,
  title = "",
  bodyContent = "",
  actionLabel = "",
  onActionClick,
}) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("loginStatus")) || false
      : false
  );

  const logoutFunc = async () => {
    try {
      // Sign out from Firebase Auth first (clears Firebase session)
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
      // Continue with logout even if Firebase signOut fails
    }

    // Try to call backend logout endpoint to invalidate server-side session/cookie
    try {
      await fetch(BASE_URL + "customer/logout", {
        method: "GET",
        credentials: "include", // Include cookies in the request
      }).catch(() => {
        // Ignore errors if logout endpoint doesn't exist
      });
    } catch (error) {
      // Ignore errors - backend logout is optional
      console.log("Backend logout endpoint not available or failed");
    }

    // Clear all cookies (including access token)
    clearAllCookies();

    // Invalidate RTK Query cache before clearing localStorage
    dispatch(api.util.invalidateTags(['Profile']));

    // Clear all local storage
    localStorage.clear();

    // Clear session storage as well
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    setToken(false); // Update token state immediately

    // Dispatch custom event to notify other components (like Header)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("userLogout"));
    }

    addToast({
      title: "User Logout",
      description: "Logout successfully",
      color: "success",
    });
    // dispatch(setPage(true));
    onClose?.(); // Close drawer first
    router.push("/");
    router.refresh(); // Force refresh to update all components
    onActionClick?.();
  };

  const handleNavigate = (val) => {
    if (!val?.includes(currentTab)) {
      dispatch(setPage(true));
      router.push(val);
      onActionClick?.();
      onClose?.();
    }
  };

  useEffect(() => {
    setMounted(true);
    // Update token when localStorage changes
    const updateToken = () => {
      if (typeof window !== "undefined") {
        const currentToken = JSON.parse(localStorage.getItem("loginStatus")) || false;
        setToken(currentToken);
      }
    };

    // Check token on mount and when drawer opens
    updateToken();

    // Listen for storage changes (in case logout happens in another tab/window)
    window.addEventListener("storage", updateToken);

    return () => {
      window.removeEventListener("storage", updateToken);
    };
  }, [isOpen]); // Re-check when drawer opens/closes

  useEffect(() => {
    // Also update token when drawer opens to catch logout from same tab
    if (isOpen && typeof window !== "undefined") {
      const currentToken = JSON.parse(localStorage.getItem("loginStatus")) || false;
      setToken(currentToken);
    }
  }, [isOpen]);

  if (!mounted) return null;

  // Display details: API profile first, then values saved at login.
  const ls = (k) => (typeof window !== "undefined" ? localStorage.getItem(k) : null);
  const profile = data?.data ?? {};
  const storedName = ls("userName") || "";
  const firstName = profile.firstName || storedName.split(" ")[0] || "";
  const fullName =
    profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : storedName || firstName;
  const initials = ((profile.firstName?.[0] || storedName.split(" ")[0]?.[0] || "") +
    (profile.lastName?.[0] || storedName.split(" ")[1]?.[0] || "")).toUpperCase();
  const image = ls("profileImage") || (profile.image ? BASE_URL + profile.image : null);
  const email = profile.email || ls("email") || "";
  const phone = (() => {
    const num = profile.phoneNum || ls("phoneNum") || "";
    const cc = profile.countryCode || ls("countryCode") || "";
    if (!num) return "";
    if (!cc || String(num).startsWith("+")) return num;
    return `${cc.startsWith("+") ? cc : `+${cc}`} ${num}`;
  })();

  // Only destinations that exist; Payment methods / Country / Language have no page yet.
  const accountItems = [
    { Icon: MdOutlineHistory, text: "Order history", href: "/profile?tab=order-history" },
    { Icon: MdPauseCircleOutline, text: "On hold bookings", href: "/profile?tab=on-hold-bookings" },
    { Icon: MdOutlineAccountCircle, text: "My account", href: "/profile?tab=my-account" },
    { Icon: FaRegAddressBook, text: "My addresses", href: "/profile?tab=my-account" },
    { Icon: MdOutlineNotifications, text: "Notifications", href: "/profile?tab=notifications" },
    { Icon: MdOutlinePeople, text: "Invite friends", href: "/profile?tab=invite-friend" },
    { Icon: MdOutlineSupportAgent, text: "Support", href: "/help-center" },
  ];
  // Signed-in users reach the site pages from here (the ☰ opens this menu
  // at every width), so all main nav links are listed.
  const quickLinks = [
    { Icon: MdAttachMoney, text: "Pricing", href: "/pricing" },
    { Icon: MdOutlinePublic, text: "How it works", href: "/how-it-works" },
    { Icon: MdArticle, text: "Blog", href: "/blog" },
    { Icon: MdOutlineSupportAgent, text: "Contact us", href: "/contact-us" },
  ];

  return (
    <Drawer
      radius="none"
      size="sm"
      isOpen={isOpen}
      hideCloseButton
      onOpenChange={(open) => {
        if (!open) onClose?.(); // closes on outside click or Esc
      }}
      // part of the screen on phones (like the site menu), a 380px side panel on larger screens
      classNames={{ base: "!max-w-[380px] bg-white font-body max-[720px]:!w-[max(270px,72vw)] max-[720px]:!max-w-[320px]" }}
    >
      <DrawerContent aria-label="Your account">
        <DrawerHeader className="p-0">
          <div
            className="relative w-full overflow-hidden bg-[linear-gradient(135deg,var(--jdc-navy)_0%,var(--jdc-navy-2)_55%,#2B3A58_100%)] px-5 py-6 text-white max-[720px]:px-4"
          >
           <div className="relative flex items-center gap-3.5 max-[720px]:gap-2.5">
              <span className="flex size-12 max-[720px]:size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white font-display text-lg font-extrabold text-jdc-navy">
                {token && image ? (
                  <img src={image} alt="" className="h-full w-full object-cover" />
                ) : token && initials ? (
                  initials
                ) : (
                  <FaUser aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate font-display text-base">{fullName || "Your account"}</b>
                {email ? <small className="block truncate text-[13px] text-white/80">{email}</small> : null}
                {phone ? <small className="block truncate text-[13px] text-white/80">{phone}</small> : null}
              </span>
              <button
                type="button"
                onClick={() => {
                  onActionClick?.();
                  onClose?.();
                }}
                aria-label="Close"
                className="flex size-[38px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
                </svg>
              </button>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="px-3 pb-6 pt-3">
          {bodyContent || (
            <nav aria-label="Account">
              {accountItems.map((item) => (
                <DrawerItem key={item.text} Icon={item.Icon} text={item.text} onClick={() => handleNavigate(item.href)} />
              ))}

              <p className="mx-2 mb-0.5 mt-3 border-t border-jdc-line px-2 pb-1.5 pt-3.5 text-xs font-bold uppercase tracking-[0.06em] text-jdc-muted">
                Quick links
              </p>
              {quickLinks.map((item) => (
                <DrawerItem key={item.text} Icon={item.Icon} text={item.text} onClick={() => handleNavigate(item.href)} />
              ))}

              <div className="mt-1.5">
                {token ? (
                  <DrawerItem onClick={logoutFunc} Icon={MdLogout} text="Log out" tone="danger" />
                ) : (
                  <>
                    <DrawerItem Icon={GrUserAdmin} onClick={() => router.push("/sign-in")} text="Log in" />
                    <DrawerItem Icon={FiLogOut} onClick={() => router.push("/sign-in")} text="Sign up" />
                  </>
                )}
              </div>
            </nav>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
