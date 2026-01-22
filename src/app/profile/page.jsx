"use client";
import React, { useEffect } from "react";
import Header from "../../../components/Header";
import { useState } from "react";
import DrawerItem from "../../../components/DrawerItem";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { 
  MdOutlineSupportAgent, 
  MdPayment, 
  MdLogout,
  MdLanguage,
  MdPauseCircleOutline,
} from "react-icons/md";
import { FaChevronLeft, FaRegAddressBook, FaUser, FaGlobe } from "react-icons/fa";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { TbUserCircle } from "react-icons/tb";
import { GrUserAdmin } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../store/services/api";
import InputHeroUi from "../../../components/InputHeroUi";
import { addToast, Spinner } from "@heroui/react";
import PhoneInputComp from "../../../components/PhoneInputComp";
import { ButtonYouth70018 } from "../../../components/Buttons";
import { BASE_URL } from "../../../utilities/URL";
import OrderHistory from "../../../components/chunks/OrderHistory";
import Notifications from "../../../components/chunks/Notifications";
import Invite from "../../../components/chunks/Invite";
import HomeClientWrapper from "../../../utilities/Test";
import { setPage } from "../store/slices/cartItemSlice";
import { useDispatch } from "react-redux";
import OnHoldbookings from "../../../components/chunks/OnHoldbookings";
import { MiniLoader } from "../../../components/Loader";
import { signOut } from "firebase/auth";
import { auth } from "../../../utilities/firebase";
import { clearAllCookies } from "../../../utilities/cookieUtils";
import { api } from "../store/services/api";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  // Get userId from localStorage to ensure we fetch the correct user's profile
  const [currentUserId, setCurrentUserId] = useState(
    typeof window !== "undefined" ? localStorage.getItem("userId") : null
  );

  const { data, error, isLoading, refetch } = useGetProfileQuery(currentUserId, {
    skip: !currentUserId, // Skip if no userId
    refetchOnMountOrArgChange: true, // Always refetch when userId changes
  });

  const [updateProfile, { isLoading: isLoadingUpdateProfile }] =
    useUpdateProfileMutation();
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
  let loginStatus = "";
  let userId = "";

  if (typeof window !== "undefined") {
    userName = localStorage.getItem("userName");
    phoneNumber = localStorage.getItem("phoneNum");
    userEmail = localStorage.getItem("email");
    loginStatus = localStorage.getItem("loginStatus");
    userId = localStorage.getItem("userId");
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

  return (
    <>
      <HomeClientWrapper>
        <div className="w-full relative min-h-screen md:h-screen md:overflow-hidden">
          <div className="fixed top-0 left-0 right-0 z-50 w-full">
            <Header type="profile" />
          </div>

          <div className="w-full flex gap-5 md:gap-10 px-4 sm:px-5 py-16 sm:py-20 md:pt-20 md:h-[calc(100vh-5rem)]">
            <section className="font-sf pt-8 min-w-[300px] 2xl:min-w-[378px] max-xl:hidden fixed top-20 h-[calc(100vh-5rem)] overflow-y-auto sidebar-scroll hideScrollbar z-10 border-r border-gray-300">
              <div className="space-y-6">
                <div className="flex items-start justify-start gap-7">
                  <label
                    htmlFor="profileImage"
                    className={` h-[120px] uppercase font-bold text-3xl  rounded-full w-[120px] md:h-[120px] flex justify-center items-center cursor-pointer ${false
                      ? "bg-theme-red bg-opacity-20 text-theme-red"
                      : "bg-gray-300 bg-opacity-60 text-white"
                      }`}
                  >
                    {userData?.firstName ? (
                      userData?.profileImage ? (
                        !isLoadingUpdateProfile ? (
                          <img
                            src={BASE_URL + userData?.profileImage}
                            alt="image"
                            className="w-[120px]  h-[120px] object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full flex justify-center items-center -mt-4">
                            <Spinner size="lg" variant="wave" />
                          </div>
                        )
                      ) : (
                        <span className="initials">
                          {userData?.firstName[0] + userData?.lastName[0]}
                        </span>
                      )
                    ) : (
                      <FaUser />
                    )}
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    name="profileImage"
                    id="profileImage"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-2 text-theme-black-2">
                    <h2 className="text-2xl font-semibold font-omnes mt-3 capitalize">
                      Hi,
                      {userName ? userName?.split(" ")[0] : "User"}
                    </h2>
                    <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                      {userName ? (() => {
                        // Get phone from API data first, then localStorage
                        const phoneNum = userData?.phoneNum || phoneNumber || "";
                        const countryCode = userData?.countryCode || (typeof window !== "undefined" ? localStorage.getItem("countryCode") : "") || "";
                        
                        if (phoneNum && countryCode) {
                          // Ensure country code has + prefix
                          const formattedCountryCode = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
                          return formattedCountryCode + " " + phoneNum;
                        } else if (phoneNumber) {
                          // If phoneNumber already includes country code, use as is
                          return phoneNumber;
                        }
                        return "";
                      })() : <></>}
                    </p>
                    <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                      {userEmail ?? "user@gmail.com"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 my-2">
                <div>
                  <DrawerItem
                    Icon={LiaUserFriendsSolid}
                    text={"Invite Friends"}
                    onClick={() => handleTabChange("invite-friend")}
                  />
                  <DrawerItem Icon={MdOutlineSupportAgent} text={"Support"} />

                  <DrawerItem
                    Icon={RxCounterClockwiseClock}
                    text={"Order history"}
                    onClick={() => handleTabChange("order-history")}
                  />
                  <DrawerItem
                    Icon={MdPauseCircleOutline}
                    text={"On Hold Bookings"}
                    onClick={() => handleTabChange("on-hold-bookings")}
                  />

                  <DrawerItem
                    Icon={TbUserCircle}
                    text={"My Account"}
                    onClick={() => handleTabChange("my-account")}
                  />
                  {/* <DrawerItem Icon={MdPayment} text={"Payment methods"} />
                <DrawerItem Icon={FaRegAddressBook} text={"My addresses"} /> */}

                  <DrawerItem
                    Icon={IoNotificationsOutline}
                    text={"Notifications"}
                    // onClick={() => {
                    //   router.push("/profile?tab=notifications");
                    // }}

                    onClick={() => handleTabChange("notifications")}
                  />
                  <DrawerItem
                    Icon={FaGlobe}
                    text={"Country"}
                  // onClick={() => {
                  //   router.push("/order-history");
                  // }}
                  />
                  <DrawerItem
                    Icon={MdLanguage}
                    text={"Language"}
                  // onClick={() => {
                  //   router.push("");
                  // }}
                  />
                </div>

                <div>
                  <div className="text-theme-black-2 font-omnes text-2xl font-semibold mb-3">
                    {"Quick links"}
                  </div>
                  {/* <div className="md:hidden">
                  <DrawerItem
                    Icon={LiaUserFriendsSolid}
                    text={"Our Story"}
                    onClick={() => {
                      router.push("/our-story");
                    }}
                  />
                  <DrawerItem
                    Icon={LiaUserFriendsSolid}
                    text={"Financing"}
                    onClick={() => {
                      router.push("/Financing");
                    }}
                  />
                  <DrawerItem
                    Icon={LiaUserFriendsSolid}
                    text={"Resources"}
                    onClick={() => {
                      router.push("/recepies");
                    }}
                  />
                  <DrawerItem
                    Icon={LiaUserFriendsSolid}
                    text={"Products"}
                    onClick={() => {
                      router.push("/product");
                    }}
                  />
                </div> */}

                  {loginStatus ? (
                    <>
                      <DrawerItem
                        onClick={logoutFunc}
                        Icon={MdLogout}
                        text={"Logout"}
                      />
                    </>
                  ) : (
                    <>
                      <DrawerItem
                        Icon={GrUserAdmin}
                        onClick={() => {
                          dispatch(setPage(true));
                          router.replace("/sign-in");
                        }}
                        text="Log in"
                      />
                      <DrawerItem
                        Icon={FiLogOut}
                        onClick={() => {
                          dispatch(setPage(true));
                          router.replace("/sign-in");
                        }}
                        text="Sign up"
                      />
                    </>
                  )}
                </div>
              </div>
            </section>

            {isLoadingUpdateProfile ? (
              <div className="w-full flex justify-center items-center">
                <MiniLoader />
              </div>
            ) : currentTab === "my-account" ? (
              <section className="w-full flex flex-col lg:flex-row gap-6 md:gap-10 2xl:gap-28 mt-8 sm:mt-12 md:mt-16 px-0 sm:px-4 md:px-6 2xl:px-10 xl:ml-[320px] 2xl:ml-[398px] md:h-[calc(100vh-5rem)] md:overflow-y-auto hideScrollbar">
                <div className="flex-1 font-sf">
                  <h2 className="font-youth font-medium text-[40px] mb-4">
                    Profile
                  </h2>
                  <div className="space-y-5">
                    <InputHeroUi
                      type="text"
                      label="First Name"
                      value={userData?.firstName}
                      name="firstName"
                      onChange={(e) =>
                        setUserData({ ...userData, firstName: e.target.value })
                      }
                    />
                    <InputHeroUi
                      type="text"
                      label="last Name"
                      value={userData?.lastName}
                      name="lastName"
                      onChange={(e) =>
                        setUserData({ ...userData, lastName: e.target.value })
                      }
                    />
                    <InputHeroUi
                      type="email"
                      label="Email"
                      value={userData?.email}
                      name="email"
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />

                    <PhoneInputComp
                      value={userData?.countryCode + userData?.phoneNum}
                      onChange={handlePhoneChange}
                    />
                    <div className="max-lg:hidden">
                      <ButtonYouth70018
                        text={"Update"}
                        onClick={handleUpdateProfile}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 font-sf">
                  <h2 className="font-youth font-medium text-[40px] mb-4">
                    Update Password
                  </h2>
                  <div className="space-y-5">
                    <InputHeroUi
                      type="password"
                      label="Password"
                      name="password"
                      value={userData?.password}
                      onChange={(e) =>
                        setUserData({ ...userData, password: e.target.value })
                      }
                    />
                    <InputHeroUi
                      type="password"
                      label="Confirm Password"
                      name="confirmPassword"
                      value={userData?.confirmPassword}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <div className="lg:hidden">
                      <ButtonYouth70018
                        text={"Update"}
                        onClick={handleUpdateProfile}
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : currentTab === "order-history" ? (
              <div className="w-full xl:ml-[320px] 2xl:ml-[398px] md:h-[calc(100vh-5rem)] md:overflow-y-auto hideScrollbar">
                <OrderHistory />
              </div>
            ) : currentTab === "notifications" ? (
              <div className="w-full xl:ml-[320px] 2xl:ml-[398px] md:h-[calc(100vh-5rem)] md:overflow-y-auto hideScrollbar">
                <Notifications />
              </div>
            ) : currentTab === "invite-friend" ? (
              <div className="w-full xl:ml-[320px] 2xl:ml-[398px] md:h-[calc(100vh-5rem)] md:overflow-y-auto hideScrollbar">
                <Invite />
              </div>
            ) : currentTab === "on-hold-bookings" ? (
              <div className="w-full xl:ml-[320px] 2xl:ml-[398px] md:h-[calc(100vh-5rem)] md:overflow-y-auto hideScrollbar">
                <OnHoldbookings />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </HomeClientWrapper>
    </>
  );
}
