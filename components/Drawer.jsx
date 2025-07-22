"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import { useState } from "react";
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
  bodyContent,
  actionLabel = "",
  onActionClick,
}) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const [drawerScroll, setDrawerScroll] = useState(0);
  const [inviteFriend, setInviteFriend] = useState(0);

  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("loginStatus") === "true"
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
                      {data?.data?.firstName ?? "User"}
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
                              {data?.data?.firstName[0] +
                                data?.data?.lastName[0]}
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
                              {data?.data?.countryCode + data?.data?.phoneNum ??
                                ""}
                            </>
                          ) : (
                            <></>
                          )}
                        </p>
                        <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                          {data?.data?.email ?? "user@gmail.com"}
                        </p>
                        <div className="flex gap-10">
                          {/* <div>
                              <p className="text-base font-bold  font-sf  capitalize">
                                {5}
                              </p>
                              <p className="text-theme-black-2 text-opacity-60 font-normal">
                                Orders
                              </p>
                            </div> */}
                          {/* <div>
                              <p className="text-base font-bold font-sf  capitalize">
                                {19}
                              </p>
                              <p className="text-theme-black-2 text-opacity-60 font-normal">
                                Tokens
                              </p>
                            </div> */}
                        </div>
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
                          // setProfileDrawer(false);
                        }}
                      />
                      <DrawerItem
                        Icon={RxCounterClockwiseClock}
                        text={"Language"}
                        onClick={() => {
                          router.push("/order-history");
                          // setProfileDrawer(false);
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
                            // setProfileDrawer(false);
                          }}
                        />
                      </div>

                      {/* <div className="">
                        <DrawerItem
                          Icon={LiaUserFriendsSolid}
                          text={"Payment details"}
                          onClick={() => {
                            router.push("/profile/payment-details");
                            setProfileDrawer(false);
                          }}
                        />
                        <DrawerItem
                          Icon={LiaUserFriendsSolid}
                          text={"Personal details"}
                          onClick={() => {
                            router.push("/profile/personal-details");
                            setProfileDrawer(false);
                          }}
                        />
                        <DrawerItem
                          Icon={LiaUserFriendsSolid}
                          text={"Preferences"}
                          onClick={() => {
                            router.push("/profile/preferences");
                            setProfileDrawer(false);
                          }}
                        />
                        <DrawerItem
                          Icon={LiaUserFriendsSolid}
                          text={"Security"}
                          onClick={() => {
                            router.push("/profile/security");
                            setProfileDrawer(false);
                          }}
                        />
                      </div> */}

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
                              // setProfileDrawer(false);
                            }}
                            text="Log in"
                          />
                          <DrawerItem
                            Icon={FiLogOut}
                             onClick={() => {
                              router.push("/sign-in");
                              // setProfileDrawer(false);
                            }}
                            text="Sign up"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </section>
              ) : inviteFriend === 1 ? (
                <div className="py-2 space-y-6 font-tt ">
                  <div className="font-black font-tt text-2xl">
                    <h5>Invite friends, get fomino credits</h5>
                  </div>
                  <div className="space-y-7">
                    <div className="flex gap-x-4">
                      <div>
                        <div className="min-w-[40px] min-h-[40px] bg-theme-red bg-opacity-20 text-theme-red font-bold text-xl flex justify-center items-center rounded-fullest">
                          1
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-bold text-xl">Share your code</h6>
                        <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                          Your friends will get $ 4 in Fomino credits for eachof
                          their first 3 delivery orders when they use your code
                          to sign up for Fomino.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-x-4">
                      <div>
                        <div className="min-w-[40px] min-h-[40px] bg-theme-red bg-opacity-20 text-theme-red font-bold text-xl flex justify-center items-center rounded-fullest">
                          2
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-bold text-xl">Earn credits</h6>
                        <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                          You'll get $ 2 Fomino credits every time a friend
                          completes one of their first 3 delivery orders. <br />
                          <br />
                          You can earn a maximum of $ 18 in credits by inviting
                          your friends to join Fomino.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-3 items-center">
                      <div className="py-3 px-5 w-full flex justify-center uppercase bg-theme-gray-10 rounded font-extrabold text-base">
                        {getProfile?.data?.data?.referalCode}
                      </div>
                      <button
                        onClick={() => {
                          info_toaster("Copied to clipboard");
                        }}
                        className="py-3 px-5 w-full bg-theme-red text-white rounded font-bold text-base"
                      >
                        Share your code
                      </button>
                      <button
                        onClick={() => setInviteFriend(2)}
                        className="font-medium text-base text-theme-red"
                      >
                        How does this work?
                      </button>
                    </div>
                  </div>
                </div>
              ) : inviteFriend === 2 ? (
                <div className="py-2 space-y-6 font-tt">
                  <div className="font-extrabold text-2xl">
                    <h5>How does this work?</h5>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h6 className="font-bold text-xl">Share your code</h6>
                      <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                        Your friends will get $ 4 in Fomino credits for eachof
                        their first 3 delivery orders when they use your code to
                        sign up for Fomino.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-bold text-xl">Earn credits</h6>
                      <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                        You'll get $ 2 Fomino credits every time a friend
                        completes one of their first 3 delivery orders. <br />
                        <br />
                        You can earn a maximum of $ 18 in credits by inviting
                        your friends to join Fomino.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-bold text-xl">Please note</h6>
                      <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                        Credit can be used for delivery orders only. When your
                        friends gets credits, they'll expire 30 days after
                        signing up to Fomino. Your credits will expire30 days
                        after your friend makes their first order. <br />
                        <br />
                        Stay tuned! Happy sharing!
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <button className="font-medium text-base text-theme-red">
                        Terms and Conditions
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
        </DrawerBody>

        {/* <DrawerFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            onPress={() => {
              onActionClick?.();
              onClose?.();
            }}
          >
            {actionLabel}
          </Button>
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
}
