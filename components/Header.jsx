"use client";
import { useEffect, useReducer, useState, useRef } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import CustomMenuBtn from "./CustomMenuBtn";
import Link from "next/link";
import { FaUser } from "react-icons/fa6";
import CustomDrawer from "./Drawer";
import { useGetProfileQuery } from "@/app/store/services/api";
import { BASE_URL } from "../utilities/URL";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { usePathname } from "next/navigation";
import { onMessage } from "firebase/messaging";
import { requestDeviceToken } from "../utilities/requestFCMToken";
import { getMessagingInstance } from "../utilities/firebase";
import { addToast } from "@heroui/react";

const Header = ({ type }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [currentUserId, setCurrentUserId] = useState(
    typeof window !== "undefined" ? localStorage.getItem("userId") : null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined" ? !!localStorage.getItem("loginStatus") : false
  );

  // Use userId to force fresh query when user changes
  // Skip query if no userId or if user is not logged in
  const { data, isLoading } = useGetProfileQuery(currentUserId, {
    skip: !currentUserId || !isLoggedIn, // Skip if no userId or not logged in
    refetchOnMountOrArgChange: true, // Always refetch when userId changes
  });
  const initialState = {
    isScrolled: false,
    isDrawerOpen: false,
    headerData: {
      token: false,
      mounted: false,
    },
  };

  const [state, dispatchState] = useReducer(changeState, initialState);
  //function to update state
  function changeState(state, action) {
    switch (action.type) {
      case "set_scroll":
        return { ...state, isScrolled: action.payload };
      case "set_drawer":
        return { ...state, isDrawerOpen: action.payload };
      case "set_headerData":
        return {
          ...state,
          headerData: { ...state.headerData, ...action.payload },
        };
      default:
        return state;
    }
  }

  const showShadow = [
    "how",
    "partner",
    "blog",
    "profile",
    "order",
    "service",
  ].includes(type);

  const handleNavigate = (val) => {
    if (!pathname?.includes(val) || (pathname !== "/" && val === "/")) {
      dispatch(setPage(true));
    }
  };

  // Watch for userId and login status changes
  useEffect(() => {
    const newUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const newLoginStatus = typeof window !== "undefined" ? !!localStorage.getItem("loginStatus") : false;

    if (newUserId !== currentUserId) {
      // User changed - update state (this will trigger query refetch automatically)
      setCurrentUserId(newUserId);
    }

    if (newLoginStatus !== isLoggedIn) {
      setIsLoggedIn(newLoginStatus);
    }
  }, [currentUserId, isLoggedIn]);

  useEffect(() => {
    // Set header data (token and mounted flag)
    const updateToken = () => {
      const currentToken = localStorage.getItem("loginStatus");
      dispatchState({
        type: "set_headerData",
        payload: {
          token: currentToken,
          mounted: true
        },
      });

      // If user is logged in, update userId and login status
      if (currentToken) {
        setIsLoggedIn(true);
        const userId = localStorage.getItem("userId");
        if (userId) {
          setCurrentUserId((prevUserId) => {
            // Only update if different to avoid unnecessary re-renders
            return userId !== prevUserId ? userId : prevUserId;
          });
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUserId(null);
      }
    };

    updateToken();

    // Listen for storage changes (logout from same tab or other tabs)
    const handleStorageChange = () => {
      updateToken();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom logout/login events
    window.addEventListener("userLogout", handleStorageChange);
    const handleUserLogin = () => {
      updateToken();
      // Update userId and login status when user logs in
      const loginStatus = localStorage.getItem("loginStatus");
      const userId = localStorage.getItem("userId");
      if (loginStatus && userId) {
        // Update state immediately - this will enable the query and trigger auto-refetch
        // Due to refetchOnMountOrArgChange: true, the query will automatically refetch
        // when skip condition changes from true to false
        setIsLoggedIn(true);
        setCurrentUserId(userId);

        // Don't manually call refetch here - let RTK Query handle it automatically
        // when the query becomes enabled (skip becomes false)
      }
    };

    window.addEventListener("userLogin", handleUserLogin);

    getMessagingInstance().then((messaging) => {
      if (messaging) {
        onMessage(messaging, (payload) => {
          console.log("📩 Foreground message:", payload);

          addToast({
            title: "Firebase Notification",
            description: payload?.notification?.title,
            color: "success",
          });
        });
      }
    });

    // Request Device Token
    requestDeviceToken();

    // Handle Scroll
    const handleScroll = () => {
      const scrollThreshold = 100;
      dispatchState({
        type: "set_scroll",
        payload: window.scrollY > scrollThreshold,
      });
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listeners on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogout", handleStorageChange);
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, []); // Empty dependency array - only run once on mount

  if (!state.headerData.mounted) return null;

  return (
    <>
      <div
        className={`xl:hidden fixed w-full h-[70px] 2xl:h-[80px] shadow-md duration-500  ${!["sign-in"].includes(type) && state.isScrolled
          ? "top-0 "
          : "top-[-100px] "
          } left-0 bg-white`}
      ></div>
      <div
        className={`w-full h-[70px] 2xl:h-[80px] flex justify-center items-center px-5 md:px-[45px] relative ${showShadow ? "xl:shadow-md" : ""
          }`}
      >
        <div className={`w-full max-w-[1290px] flex ${!state.headerData?.token ? "justify-between" : "justify-center"} xl:justify-between items-center`}>
          <div className={`flex items-center ${!state.headerData?.token ? "justify-start" : "justify-center"} gap-14`}>
            <Link
              onClick={() => {
                handleNavigate("/");
              }}
              href="/"
              className="flex items-center gap-2"
            >
              <div className="size-9 overflow-hidden">
                <img
                  className="w-full h-full object-contain"
                  src="/images/logo.png"
                  alt=""
                />
              </div>

              <h4 className={`font-youth font-bold text-base text-theme-blue`}>
                Just dry cleaners
              </h4>
            </Link>

            <div className="max-xl:hidden">
              <ul className="flex items-center gap-10 font-sf text-xl">
                <li>
                  <Link
                    onClick={() => {
                      handleNavigate("/");
                    }}
                    href="/"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => {
                      handleNavigate("/pricing");
                    }}
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => {
                      handleNavigate("/how-it-works");
                    }}
                    href="/how-it-works"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => {
                      handleNavigate("/blog");
                    }}
                    href="/blog"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => {
                      handleNavigate("/contact-us");
                    }}
                    href="/contact-us"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Join Us button for guest users on small/medium screens - part of flex layout */}
          {!state.headerData?.token && (
            <div className="xl:hidden">
              <Link
                onClick={() => {
                  handleNavigate("/sign-in");
                }}
                href="/sign-in"
                className="w-32 sm:w-40 h-[45px] sm:h-[50px] rounded-full font-youth font-bold text-base sm:text-lg flex justify-center items-center border-black border-[2px] bg-white"
              >
                Join Us
              </Link>
            </div>
          )}

          <div className="max-xl:hidden">
            {state.headerData?.token ? (
              <div
                onClick={() =>
                  dispatchState({
                    type: "set_drawer",
                    payload: true,
                  })
                }
                className="flex flex-col items-center cursor-pointer"
              >
                {(() => {
                  // Check for profile image from localStorage (Google/Facebook) first
                  const profileImageFromStorage = typeof window !== "undefined" ? localStorage.getItem("profileImage") : null;
                  // Then check API data
                  const profileImageFromAPI = data?.data?.image ? BASE_URL + data?.data?.image : null;
                  const profileImage = profileImageFromStorage || profileImageFromAPI;

                  // Get user initials for fallback
                  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : "";
                  const firstName = data?.data?.firstName || userName?.split(" ")[0] || "";
                  const lastName = data?.data?.lastName || userName?.split(" ")[1] || "";
                  const initials = (firstName?.[0] || "") + (lastName?.[0] || "");

                  if (profileImage) {
                    return (
                      <div className="size-[35px] rounded-full border border-gray-500 shrink-0 flex justify-center items-center overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src={profileImage}
                          alt={firstName}
                        />
                      </div>
                    );
                  } else if (initials) {
                    return (
                      <div className="size-[35px] rounded-full border border-gray-500 shrink-0 flex justify-center items-center bg-theme-blue text-white font-semibold text-sm">
                        {initials.toUpperCase()}
                      </div>
                    );
                  } else {
                    return (
                      <div className="size-[35px] rounded-full border border-gray-500 shrink-0 flex justify-center items-center">
                        <FaUser size="20" color="lightGray" />
                      </div>
                    );
                  }
                })()}
                <p className="text-center font-sf text-base">
                  Hi,{" "}
                  {(() => {
                    // Prioritize API data, then localStorage
                    const firstName = data?.data?.firstName || "";
                    const userName = typeof window !== "undefined" ? localStorage.getItem("userName") : "";
                    const firstNameFromStorage = userName?.split(" ")[0] || "";

                    return firstName || firstNameFromStorage || "User";
                  })()}
                </p>
              </div>
            ) : (
              <Link
                onClick={() => {
                  handleNavigate("/sign-in");
                }}
                href="/sign-in"
                className="w-48 2xl:w-52 h-[50px] 2xl:h-[60px] rounded-full font-youth font-bold text-xl flex justify-center items-center border-black border-[2px] bg-white"
              >
                Join Us
              </Link>
            )}
          </div>
        </div>

        {/* Menu icon - only show for logged-in users on small/medium screens */}
        {state.headerData?.token && (
          <div
            className={`absolute top-5 left-4 text-theme-blue sm:left-12 xl:hidden ${["sign-in"].includes(type) ? "hidden" : ""
              }`}
          >
            <HiOutlineMenuAlt2
              onClick={() =>
                dispatchState({
                  type: "set_drawer",
                  payload: true,
                })
              }
              size={30}
            />
          </div>
        )}

      </div>

      {/* Only show drawer for logged-in users */}
      {state.headerData?.token && (
        <CustomDrawer
          data={data ? data : {}}
          loading={isLoading}
          isOpen={state.isDrawerOpen}
          onClose={() =>
            dispatchState({
              type: "set_drawer",
              payload: false,
            })
          }
          title=""
        // actionLabel="Submit"
        // onActionClick={() => console.log("Submit clicked")}
        />
      )}
    </>
  );
};

export default Header;
