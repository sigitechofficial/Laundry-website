"use client";
import { useEffect, useReducer, useState } from "react";
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
  const { data, isLoading } = useGetProfileQuery();
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
    "aboutUs",
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

  useEffect(() => {
    // Set header data (token and mounted flag)
    const updateToken = () => {
      dispatchState({
        type: "set_headerData",
        payload: { 
          token: localStorage.getItem("loginStatus"), 
          mounted: true 
        },
      });
    };
    
    updateToken();

    // Listen for storage changes (logout from same tab or other tabs)
    const handleStorageChange = () => {
      updateToken();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom logout event
    window.addEventListener("userLogout", handleStorageChange);

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
    };
  }, []);

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
        <div className="w-full max-w-[1290px] flex justify-center xl:justify-between items-center">
          <div className="flex items-center justify-center gap-14">
            <Link
              onClick={() => {
                handleNavigate("/");
              }}
              href="/"
              className="flex items-center gap-2 max-sm:justify-center"
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
                className="w-48 2xl:w-52 h-[50px] 2xl:h-[60px] rounded-full font-youth font-bold text-xl flex justify-center items-center border-black border-[2px]"
              >
                Join Us
              </Link>
            )}
          </div>
        </div>

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
          {/* <CustomMenuBtn onClick={() => setIsDrawerOpen(true)} /> */}
        </div>
      </div>

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
    </>
  );
};

export default Header;
