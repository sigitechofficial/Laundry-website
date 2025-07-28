"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import DrawerItem from "./DrawerItem";
import { LiaUserFriendsSolid } from "react-icons/lia";
import {
  MdOutlineSupportAgent,
  MdOutlineTableRestaurant,
  MdPayment,
  MdLogout,
} from "react-icons/md";
import {
  FaBicycle,
  FaChevronLeft,
  FaRegAddressBook,
  FaUser,
} from "react-icons/fa";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { TbUserCircle } from "react-icons/tb";
import { GrUserAdmin } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/react";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { BASE_URL } from "../utilities/URL";

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
  const [drawerScroll, setDrawerScroll] = useState(0);
  const [inviteFriend, setInviteFriend] = useState(0);
  const [mounted, setMounted] = useState(false);

  let token =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("loginStatus")) || false
      : false;

  const handleDrawerScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setDrawerScroll(scrollTop);
  };

  const logoutFunc = () => {
    localStorage.clear();
    addToast({
      title: "User Logout",
      description: "Logout successfully",
      color: "success",
    });
    // dispatch(setPage(true));
    router.push("/");
    onActionClick?.();
    onClose?.();
  };

  const handleNavigate = (val) => {
    if (!val?.includes(currentTab)) {
      dispatch(setPage(true));
      router.push(val);
      onActionClick?.();
      onClose?.();
    }
  };

  useEffect(()=>{setMounted(true)},[])
  if(!mounted) return null
  return (
    <Drawer
      radius="none"
      size="lg"
      isOpen={isOpen}
      hideCloseButton
      onOpenChange={(open) => {
        if (!open) onClose?.(); // closes on outside click or Esc
      }}
    >
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-1">{title}</DrawerHeader>

        <DrawerBody>
          {bodyContent || (
            <div className="w-full" onScroll={handleDrawerScroll}>
              {inviteFriend === 0 ? (
                <section className="w-full overflow-x-hidden font-sf">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mt-2">
                      <button
                        onClick={() => {
                          onActionClick?.();
                          onClose?.();
                        }}
                      >
                        <FaChevronLeft />
                      </button>
                      <div>
                        <IoNotificationsOutline size={26} />
                      </div>
                    </div>

                    <h1 className="font-omnes font-bold text-[32px] capitalize text-theme-black-2 ">
                      <span className="me-2">Howdy</span>
                      {data?.data?.firstName || "User"}
                    </h1>
                    <div className="flex items-start justify-start gap-7">
                      <div
                        className={` h-[120px] uppercase font-bold text-3xl shrink-0 rounded-full w-[120px] md:h-[120px] flex justify-center items-center ${
                          false
                            ? "bg-theme-red bg-opacity-20 text-theme-red"
                            : "bg-theme-gray-6 bg-opacity-60 text-white"
                        }`}
                      >
                        {token ? (
                          data?.data?.image ? (
                            <img
                              src={BASE_URL + data?.data?.image}
                              alt={data?.data?.firstName}
                              className="w-[120px]  h-[120px] object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-gray-500">
                              {data?.data?.firstName?.[0] +
                                data?.data?.lastName?.[0]}
                            </span>
                          )
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-theme-black-2">
                        <h2 className="text-2xl font-semibold font-omnes mt-3 capitalize line-clamp-1">
                          Hi,{" "}
                          {data?.data?.firstName
                            ? data?.data?.firstName + " " + data?.data?.lastName
                            : "User"}
                        </h2>
                        <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                          {data?.data?.phoneNum ? (
                            <>
                              {data?.data?.countryCode + data?.data?.phoneNum}
                            </>
                          ) : (
                            "+1 234 567 890"
                          )}
                        </p>
                        <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                          {data?.data?.email ?? "abc@gmail.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 my-2">
                    <div>
                      <DrawerItem
                        Icon={LiaUserFriendsSolid}
                        text={"Invite Friends"}
                        onClick={() => {
                          handleNavigate("/profile?tab=invite-friend");
                        }}
                      />
                      <DrawerItem
                        Icon={MdOutlineSupportAgent}
                        text={"Support"}
                      />

                      <DrawerItem
                        Icon={RxCounterClockwiseClock}
                        text={"Order history"}
                        onClick={() => {
                          handleNavigate("/profile?tab=order-history");
                        }}
                      />
                      <DrawerItem
                        Icon={RxCounterClockwiseClock}
                        text={"On Hold Bookings"}
                        onClick={() => {
                          handleNavigate("/profile?tab=on-hold-bookings");
                        }}
                      />

                      <DrawerItem
                        Icon={TbUserCircle}
                        text={"My Account"}
                        onClick={() => {
                          handleNavigate("/profile?tab=my-account");
                        }}
                      />
                      <DrawerItem Icon={MdPayment} text={"Payment methods"} />
                      <DrawerItem
                        Icon={FaRegAddressBook}
                        text={"My addresses"}
                      />

                      <DrawerItem
                        Icon={RxCounterClockwiseClock}
                        text={"Notifications"}
                        onClick={() => {
                          handleNavigate("/profile?tab=notifications");
                        }}
                      />
                      <DrawerItem
                        Icon={RxCounterClockwiseClock}
                        text={"Country"}
                        onClick={() => {
                          router.push("/order-history");
                        }}
                      />
                      <DrawerItem
                        Icon={RxCounterClockwiseClock}
                        text={"Language"}
                        onClick={() => {
                          router.push("/order-history");
                        }}
                      />
                    </div>

                    <div>
                      <div className="text-theme-black-2 font-omnes text-2xl font-semibold mb-3">
                        {"Quick links"}
                      </div>

                      <div>
                        <DrawerItem
                          Icon={RxCounterClockwiseClock}
                          text={"Pricing"}
                          onClick={() => {
                            router.push("/pricing");
                          }}
                        />
                      </div>

                      {token ? (
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
                              router.push("/sign-in");
                            }}
                            text="Log in"
                          />
                          <DrawerItem
                            Icon={FiLogOut}
                            onClick={() => {
                              router.push("/sign-in");
                            }}
                            text="Sign up"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </section>
              ) : (
                <></>
              )}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
