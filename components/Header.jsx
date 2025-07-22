"use client";
import { useEffect, useState } from "react";
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

const Header = ({ type }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { data, error, isLoading } = useGetProfileQuery();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("loginStatus");
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (val) => {
    if (!pathname?.includes(val) || (pathname !== "/" && val === "/")) {
      dispatch(setPage(true));
    }
  };

  return (
    <>
      <div
        className={`xl:hidden fixed w-full h-[70px] 2xl:h-[80px] shadow-md duration-500  ${
          isScrolled ? "top-0 " : "top-[-100px] "
        } left-0 bg-white`}
      ></div>
      <div
        className={`w-full h-[70px] 2xl:h-[80px] flex justify-center items-center px-5 md:px-[45px] relative ${
          [
            "how",
            "aboutUs",
            "partner",
            "blog",
            "profile",
            "order",
            "service",
          ].includes(type)
            ? "xl:shadow-md"
            : ""
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
            {token ? (
              <div
                onClick={() => setIsDrawerOpen(true)}
                className="flex flex-col items-center cursor-pointer"
              >
                {data?.data?.image ? (
                  <div className="size-[35px] rounded-full border border-gray-500 shrink-0 flex justify-center items-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={BASE_URL + data?.data?.image}
                      alt={data?.data?.firstName}
                    />
                  </div>
                ) : (
                  <div className="size-[35px] rounded-full border border-gray-500 shrink-0 flex justify-center items-center">
                    <FaUser size="20" color="lightGray" />
                  </div>
                )}
                <p className="text-center font-sf text-base">
                  Hi,{" "}
                  {localStorage?.getItem("userName")?.split(" ")[0] || "User"}
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

        <div className={`absolute top-5 left-4 text-theme-blue sm:left-12 xl:hidden ${[["sign-in"].includes(type) ? "hidden":""]} `}>
          <HiOutlineMenuAlt2 onClick={() => setIsDrawerOpen(true)} size={30} />
          {/* <CustomMenuBtn onClick={() => setIsDrawerOpen(true)} /> */}
        </div>
      </div>

      <CustomDrawer
        data={data}
        loading={isLoading}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title=""
        // actionLabel="Submit"
        // onActionClick={() => console.log("Submit clicked")}
      />
    </>
  );
};

export default Header;
