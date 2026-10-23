"use client";
import React, { Suspense, useEffect } from "react";

import PageShell from "../../../components/ds/PageShell";
import { cx } from "../../../components/ds/cx";
import { BACK_LABEL, BACK_ROUND, TITLE_ROW } from "../../../components/booking/ui";
import { useState } from "react";
import {
  MdPauseCircleOutline,
  MdOutlinePeople,
  MdOutlineHistory,
  MdOutlineAccountCircle,
  MdOutlineNotifications,
} from "react-icons/md";
import { FaUser } from "react-icons/fa";
import ProtoIcon from "../../../components/proto/ProtoIcon";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "../store/services/api";
import InputHeroUi from "../../../components/InputHeroUi";
import { addToast, useDisclosure } from "@heroui/react";
import PhoneInputComp from "../../../components/PhoneInputComp";
import { ButtonYouth70018 } from "../../../components/Buttons";
import { BASE_URL } from "../../../utilities/URL";
import OrderHistory from "../../../components/chunks/OrderHistory";
import Notifications from "../../../components/chunks/Notifications";
import Invite from "../../../components/chunks/Invite";
import MyAddresses from "../../../components/chunks/MyAddresses";
import { setPage } from "../store/slices/cartItemSlice";
import { useDispatch } from "react-redux";
import OnHoldbookings from "../../../components/chunks/OnHoldbookings";
import { MiniLoader } from "../../../components/Loader";
import { signOut } from "firebase/auth";
import { auth } from "../../../utilities/firebase";
import { clearAllCookies } from "../../../utilities/cookieUtils";
import { api } from "../store/services/api";
import DeleteAccountModal from "../../../components/DeleteAccountModal";

// The tab comes from the URL (?tab=), which useSearchParams reads; Next.js needs a Suspense
// boundary around it when building the page. The fallback is the same empty page frame.
export default function ProfilePage() {
  return (
    <Suspense fallback={<PageShell header="solid" clientOnly />}>
      <Profile />
    </Suspense>
  );
}

function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  // Get userId from localStorage to ensure we fetch the correct user's profile
  const [currentUserId, setCurrentUserId] = useState(
    typeof window !== "undefined" ? localStorage.getItem("userId") : null
  );

  const { data, refetch } = useGetProfileQuery(currentUserId, {
    skip: !currentUserId, // Skip if no userId
    refetchOnMountOrArgChange: true, // Always refetch when userId changes
  });

  const [updateProfile, { isLoading: isLoadingUpdateProfile }] =
    useUpdateProfileMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "",
    phoneNum: "",
    password: "",
    confirmPassword: "",
    isProfileImgChanged: false,
    profileImage: null,
    imagePreview: null,
  });

  let userName = "";
  let phoneNumber = "";
  let userEmail = "";

  if (typeof window !== "undefined") {
    userName = localStorage.getItem("userName");
    phoneNumber = localStorage.getItem("phoneNum");
    userEmail = localStorage.getItem("email");
  }

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

    dispatch(setPage(true));

    // Clear all local storage (including accessToken)
    localStorage.clear();

    // Clear session storage as well
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    // Dispatch custom event to notify other components (like Header)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("userLogout"));
    }

    addToast({
      title: "Logout",
      description: "logged out successfully!",
      color: "success",
    });
    router.replace("/");
    router.refresh(); // Force refresh to update all components
  };

  const handlePhoneChange = (value, data) => {
    setUserData({
      ...userData,
      countryCode: data.dialCode,
      phoneNum: value.slice(data.dialCode.length),
    });
  };

  const handleUpdateProfile = async () => {
    if (userData?.password !== userData?.confirmPassword) {
      addToast({
        title: "Passsword",
        description: "Password and confirm password is not same",
        color: "danger",
      });
    } else {
      const formData = new FormData();
      formData.append("firstName", userData?.firstName || "");
      formData.append("lastName", userData?.lastName || "");
      formData.append("email", userData?.email || "");
      formData.append("countryCode", userData?.countryCode || "");
      formData.append("phoneNum", userData?.phoneNum || "");
      formData.append("password", userData?.password || "");
      formData.append(
        "isProfileImgChanged",
        userData?.isProfileImgChanged ? true : false
      );

      if (userData?.profileImage) {
        formData.append("profileImage", userData?.profileImage);
      }
      let res = await updateProfile({
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        email: userData?.email,
        countryCode: userData?.countryCode,
        phoneNum: userData?.phoneNum,
        password: userData?.password,
        isProfileImgChanged: userData?.isProfileImgChanged,
        profileImage: userData?.profileImage,
      }).unwrap();

      if (res?.status === "1") {
        refetch();
        addToast({
          title: "Passsword",
          description: res?.message,
          color: "success",
        });
      } else {
        addToast({
          title: "Passsword",
          description: res?.error,
          color: "danger",
        });
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUserData({ ...userData, imagePreview: previewURL });

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("isProfileImgChanged", true);

    try {
      const res = await updateProfile(formData).unwrap();

      if (res?.status === "1") {
        addToast({
          title: "Passsword",
          description: res?.message,
          color: "success",
        });
        refetch();
      } else {
        addToast({
          title: "Passsword",
          description: res?.error,
          color: "danger",
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleDeleteAccount = async ({ reason, otherText, email }) => {
    try {
      const res = await deleteAccount({ reason, otherText, email }).unwrap();
      if (res?.status === "1") {
        addToast({
          title: "Account deleted",
          description: res?.message || "Your account has been deleted.",
          color: "success",
        });
        onDeleteModalClose();
        await logoutFunc();
      } else {
        addToast({
          title: "Delete failed",
          description: res?.error || res?.message || "Could not delete account.",
          color: "danger",
        });
      }
    } catch (err) {
      addToast({
        title: "Delete failed",
        description:
          err?.data?.message ||
          err?.data?.error ||
          err?.message ||
          "Could not delete account.",
        color: "danger",
      });
    }
  };

  const handleTabChange = (tabName) => {
    console.log(currentTab, "vvv", tabName);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", tabName);
    router.push(`/profile?${params.toString()}`);

    // Don't show full-page loader on tab changes - each tab handles its own loading state
    // if (tabName !== currentTab) {
    //   dispatch(setPage(true));
    // }
  };

  // Listen for user login event to refetch profile
  useEffect(() => {
    const handleUserLogin = () => {
      // Invalidate old profile cache first
      dispatch(api.util.invalidateTags(['Profile']));

      // Update userId from localStorage
      const newUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (newUserId && newUserId !== currentUserId) {
        setCurrentUserId(newUserId);
      }
      // Refetch profile data with delay to ensure cookies are set by backend and accessToken is updated
      setTimeout(() => {
        refetch();
      }, 500); // Reduced delay - accessToken should be set immediately after login
    };

    if (typeof window !== "undefined") {
      window.addEventListener("userLogin", handleUserLogin);
      return () => {
        window.removeEventListener("userLogin", handleUserLogin);
      };
    }
  }, [currentUserId, refetch]);

  // Watch for userId changes in localStorage
  useEffect(() => {
    const checkUserId = () => {
      const newUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (newUserId !== currentUserId) {
        setCurrentUserId(newUserId);
      }
    };

    // Check on mount
    checkUserId();

    // Listen for storage changes
    if (typeof window !== "undefined") {
      window.addEventListener("storage", checkUserId);
      window.addEventListener("userLogout", () => {
        setCurrentUserId(null);
      });
      return () => {
        window.removeEventListener("storage", checkUserId);
        window.removeEventListener("userLogout", () => {
          setCurrentUserId(null);
        });
      };
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentTab) {
      handleTabChange("my-account");
    }
  }, []);

  useEffect(() => {
    if (data?.data) {
      setUserData({
        firstName: data?.data?.firstName,
        lastName: data?.data?.lastName,
        email: data?.data?.email,
        countryCode: data?.data?.countryCode,
        phoneNum: data?.data?.phoneNum,
        profileImage: data?.data?.image,
      });

      // Update localStorage with fresh data from API to keep it in sync
      if (typeof window !== "undefined") {
        localStorage.setItem("email", data?.data?.email || "");
        localStorage.setItem("phoneNum", data?.data?.phoneNum || "");
        if (data?.data?.firstName && data?.data?.lastName) {
          localStorage.setItem(
            "userName",
            data?.data?.firstName + " " + data?.data?.lastName
          );
        }
      }
    }
  }, [data]);

  // No tab, or an unknown one, in the URL: show the account details rather than an empty panel.
  const KNOWN_TABS = ["my-account", "my-addresses", "order-history", "on-hold-bookings", "notifications", "invite-friend"];
  const activeTab = KNOWN_TABS.includes(currentTab) ? currentTab : "my-account";

  const TABS = [
    { id: "my-account", label: "My account", Icon: MdOutlineAccountCircle },
    { id: "my-addresses", label: "My addresses", Icon: MdOutlineAccountCircle },
    { id: "order-history", label: "Order history", Icon: MdOutlineHistory },
    { id: "on-hold-bookings", label: "On hold bookings", Icon: MdPauseCircleOutline },
    { id: "notifications", label: "Notifications", Icon: MdOutlineNotifications },
    { id: "invite-friend", label: "Invite friends", Icon: MdOutlinePeople },
  ];

  const displayName =
    (userData?.firstName ? `${userData.firstName} ${userData?.lastName || ""}`.trim() : userName) || "Your account";
  const initials = userData?.firstName
    ? `${userData.firstName[0] || ""}${userData?.lastName?.[0] || ""}`.toUpperCase()
    : "";
  const displayPhone = (() => {
    const phoneNum = userData?.phoneNum || phoneNumber || "";
    const countryCode =
      userData?.countryCode || (typeof window !== "undefined" ? localStorage.getItem("countryCode") : "") || "";
    if (phoneNum && countryCode) {
      return `${countryCode.startsWith("+") ? countryCode : `+${countryCode}`} ${phoneNum}`;
    }
    return phoneNumber || "";
  })();

  return (
    <PageShell header="solid" clientOnly>
      <div className="pt-10 px-jdc-gutter pb-20 max-[720px]:pt-5 max-[720px]:pb-12">
        {/* single-column tabs use a narrower centred page, so there is no empty space beside them */}
        <div
          className={
            activeTab === "my-account"
              ? "max-w-[900px] mx-auto my-0"
              : activeTab === "on-hold-bookings"
                  ? "max-w-[1180px] mx-auto my-0"
              : activeTab === "notifications"
                ? "max-w-[680px] mx-auto my-0"
                : activeTab === "invite-friend"
                  ? "max-w-[900px] mx-auto my-0 max-[1100px]:max-w-[680px]"
                : "max-w-[1280px] mx-auto my-0"
          }
        >
          {/* Back + account heading (.acc-h1): round ← beside the heading on phones (see TITLE_ROW in booking/ui.js) */}
          <div className={TITLE_ROW}>
            <button
              type="button"
              className={cx(
                "inline-flex items-center gap-2 mb-3 py-[6px] px-0 border-0 bg-transparent text-[15px] font-semibold text-jdc-navy cursor-pointer hover:text-jdc-blue",
                BACK_ROUND
              )}
              onClick={() => router.back()}
            >
              <ProtoIcon name="back" size={16} />
              <span className={BACK_LABEL}>Back</span>
            </button>
            <h1 className="m-0 mt-1 font-display text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-jdc-navy max-[720px]:mt-0 max-[720px]:text-[28px]">{TABS.find((t) => t.id === activeTab)?.label ?? "My account"}</h1>
          </div>
          <p className="m-[8px_0_24px] max-w-[560px] text-[16px] text-jdc-muted max-[720px]:mb-5 max-[720px]:text-[15px]">
            {activeTab === "my-account"
              ? "Your name, contact details and password."
              : activeTab === "order-history"
                ? "Your upcoming and past orders. Select an order to see its details."
                : activeTab === "on-hold-bookings"
                  ? "Our team found a problem with an item. We will not start cleaning until you decide what to do."
                  : activeTab === "my-addresses"
                    ? "Addresses saved from your bookings."
                  : activeTab === "notifications"
                    ? "Updates about your orders and account."
                    : "Give friends money off their first order, and get credit when they book."}
          </p>

          {isLoadingUpdateProfile ? (
            <div className="flex justify-center py-20 px-0">
              <MiniLoader />
            </div>
          ) : activeTab === "my-account" ? (
            <>
              <section className="flex items-center gap-4 mb-5 py-[18px] px-5 border border-jdc-line rounded-jdc-lg bg-jdc-white max-[720px]:flex-wrap" aria-label="Profile photo">
                <label htmlFor="profileImage" className="relative flex-none w-16 h-16 rounded-[50%] overflow-hidden flex items-center justify-center bg-jdc-blue-tint text-jdc-blue font-display font-extrabold text-[22px] cursor-pointer [&_img]:w-full [&_img]:h-full [&_img]:object-cover" title="Change photo">
                  {userData?.profileImage ? (
                    <img src={BASE_URL + userData?.profileImage} alt="" />
                  ) : initials ? (
                    initials
                  ) : (
                    <FaUser aria-hidden="true" />
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="profileImage"
                  id="profileImage"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Upload a profile photo"
                />
                <div className="min-w-0">
                  <strong className="block overflow-hidden text-ellipsis whitespace-nowrap font-display text-[19px] text-jdc-navy">{displayName}</strong>
                  {userEmail ? <small className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] text-jdc-muted">{userEmail}</small> : null}
                  {displayPhone ? <small className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] text-jdc-muted">{displayPhone}</small> : null}
                </div>
                <label htmlFor="profileImage" className="ml-auto flex-none h-[38px] py-0 px-4 inline-flex items-center border border-jdc-line rounded-jdc-pill text-[14px] font-bold text-jdc-navy cursor-pointer hover:border-jdc-line-strong hover:bg-jdc-paper max-[720px]:ml-0">
                  Change photo
                </label>
              </section>

              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-5 [align-items:start] max-[1080px]:grid-cols-[1fr]">
                <section className="p-[26px] bg-jdc-white border border-jdc-line rounded-jdc-lg max-[720px]:p-[18px]" aria-labelledby="acc-details">
                  <h2 id="acc-details" className="m-[0_0_18px] font-display text-[20px] text-jdc-navy">
                    Personal details
                  </h2>
                  <div className="grid gap-[14px]">
                    <InputHeroUi
                      type="text"
                      label="First name"
                      value={userData?.firstName}
                      name="firstName"
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    />
                    <InputHeroUi
                      type="text"
                      label="Last name"
                      value={userData?.lastName}
                      name="lastName"
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    />
                    <InputHeroUi
                      type="email"
                      label="Email"
                      value={userData?.email}
                      name="email"
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                    <PhoneInputComp value={userData?.countryCode + userData?.phoneNum} onChange={handlePhoneChange} />
                    <ButtonYouth70018 text="Save changes" onClick={handleUpdateProfile} />
                  </div>
                </section>

                <section className="p-[26px] bg-jdc-white border border-jdc-line rounded-jdc-lg max-[720px]:p-[18px]" aria-labelledby="acc-password">
                  <h2 id="acc-password" className="m-[0_0_18px] font-display text-[20px] text-jdc-navy">
                    Change password
                  </h2>
                  <div className="grid gap-[14px]">
                    <InputHeroUi
                      type="password"
                      label="New password"
                      name="password"
                      value={userData?.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    />
                    <InputHeroUi
                      type="password"
                      label="Confirm password"
                      name="confirmPassword"
                      value={userData?.confirmPassword}
                      onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                    />
                    <ButtonYouth70018 text="Update password" variant="outline" onClick={handleUpdateProfile} />
                  </div>
                </section>
              </div>

              <section className="flex flex-wrap items-center justify-between gap-4 mt-5 py-[22px] px-[26px] border border-[#f3c9c4] rounded-jdc-lg bg-jdc-white max-[720px]:p-[18px]" aria-labelledby="acc-delete">
                <div>
                  <h2 id="acc-delete" className="m-[0_0_4px] font-display text-[18px] text-jdc-navy">Delete account</h2>
                  <p className="m-0 text-[14.5px] text-jdc-muted">Permanently remove your account and personal data.</p>
                </div>
                <button type="button" className="h-12 py-0 px-[22px] border-[1.5px] border-jdc-danger rounded-jdc-pill bg-jdc-white text-jdc-danger font-bold cursor-pointer [transition:background_0.2s] hover:bg-jdc-danger-tint max-[720px]:w-full" onClick={onDeleteModalOpen}>
                  Delete my account
                </button>
              </section>
            </>
          ) : (
            <div className="min-h-[320px] py-2 px-0">
              {activeTab === "order-history" ? (
                <OrderHistory />
              ) : activeTab === "notifications" ? (
                <Notifications />
              ) : activeTab === "invite-friend" ? (
                <Invite />
              ) : activeTab === "on-hold-bookings" ? (
                <OnHoldbookings />
              ) : activeTab === "my-addresses" ? (
                <MyAddresses />
              ) : null}
            </div>
          )}
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalOpenChange}
        onClose={onDeleteModalClose}
        userEmail={userData?.email || userEmail}
        onDeleteAccount={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </PageShell>
  );
}
