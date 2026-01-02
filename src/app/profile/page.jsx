"use client";
import React, { useEffect } from "react";
import Header from "../../../components/Header";
import { useState } from "react";
import DrawerItem from "../../../components/DrawerItem";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { MdOutlineSupportAgent, MdPayment, MdLogout } from "react-icons/md";
import { FaChevronLeft, FaRegAddressBook, FaUser } from "react-icons/fa";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { TbUserCircle } from "react-icons/tb";
import { GrUserAdmin } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
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

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { data, error, isLoading, refetch } = useGetProfileQuery();
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

  const logoutFunc = () => {
    dispatch(setPage(true));
    localStorage.clear();
    
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

    if (tabName !== currentTab) {
      dispatch(setPage(true));
    }
  };

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
    }
  }, [data]);

  return (
    <>
      <HomeClientWrapper>
        <div className="w-full relative">
          <div className="max-xl:fixed max-xl:z-50 w-full">
            <Header type="profile" />
          </div>

          <div className="w-full flex gap-10 px-5 py-20 xl:py-0">
            <section className="font-sf pt-8 min-w-[300px] 2xl:min-w-[378px] max-md:hidden">
              <div className="space-y-6">
                <div className="flex items-start justify-start gap-7">
                  <label
                    htmlFor="profileImage"
                    className={` h-[120px] uppercase font-bold text-3xl  rounded-full w-[120px] md:h-[120px] flex justify-center items-center cursor-pointer ${
                      false
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
                      {userName ? <>{phoneNumber ?? ""}</> : <></>}
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
                    Icon={RxCounterClockwiseClock}
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
                    Icon={RxCounterClockwiseClock}
                    text={"Notifications"}
                    // onClick={() => {
                    //   router.push("/profile?tab=notifications");
                    // }}

                    onClick={() => handleTabChange("notifications")}
                  />
                  <DrawerItem
                    Icon={RxCounterClockwiseClock}
                    text={"Country"}
                    // onClick={() => {
                    //   router.push("/order-history");
                    // }}
                  />
                  <DrawerItem
                    Icon={RxCounterClockwiseClock}
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
              <section className="w-full flex flex-col lg:flex-row gap-10 2xl:gap-28 mt-16 px-0 sm:px-6 2xl:px-10">
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
              <OrderHistory />
            ) : currentTab === "notifications" ? (
              <Notifications />
            ) : currentTab === "invite-friend" ? (
              <Invite />
            ) : currentTab === "on-hold-bookings" ? (
              <OnHoldbookings />
            ) : (
              ""
            )}
          </div>
        </div>
      </HomeClientWrapper>
    </>
  );
}
