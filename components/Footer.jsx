import React from "react";
import Link from "next/link";
import { FaFacebookF } from "react-icons/fa";
import { SiInstagram } from "react-icons/si";
import { MdLocationPin } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";

export default function Footer() {
  return (
    <div className="w-full bg-theme-gray font-sf px-5 md:px-[45px]">
      <div className="flex items-center gap-2 pt-8 sm:hidden">
        <div className="size-10 sm:size-14 overflow-hidden">
          <img
            className="w-full h-full object-contain"
            src="/images/logo.png"
            alt=""
          />
        </div>

        <h4 className="font-youth font-bold text-sm text-theme-darkBlue">
          Just dry cleaners
        </h4>
      </div>
      <div className="w-full max-w-[1290px] flex flex-wrap gap-4 justify-between pt-8 sm:pt-16 sm:pb-[50px] mx-auto">
        <div className="space-y-3 sm:space-y-5">
          <h4 className="font-semibold text-lg sm:text-2xl">Explore</h4>
          <ul className="text-base sm:text-lg space-y-1.5 sm:space-y-3 text-black/70">
            <li>
              <Link
                href="/how-it-works"
                className="hover:text-theme-blue transition-colors"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="hover:text-theme-blue transition-colors"
              >
                Prices & Services
              </Link>
            </li>
            <li>
              <Link href="/help-center" className="hover:text-theme-blue transition-colors">
                Help centre
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2 sm:space-y-5">
          <h4 className="font-semibold text-lg sm:text-2xl">Our Solution</h4>
          <ul className="text-base sm:text-lg space-y-1.5 sm:space-y-3 text-black/70">
            <li>
              <Link href="/pricing" className="hover:text-theme-blue transition-colors">
                Laundry
              </Link>
            </li>
            <li>
              <Link
                href="/pricing/service-detail?id=2"
                className="hover:text-theme-blue transition-colors"
              >
                Dry Cleaning
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2 sm:space-y-5">
          <h4 className="font-semibold text-lg sm:text-2xl">Our Company</h4>
          <ul className="text-base sm:text-lg space-y-1.5 sm:space-y-3 text-black/70">
            <li>Locations</li>
            <li>
              <Link href="/blog" className="hover:text-theme-blue transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-theme-blue transition-colors">
                Customer reviews
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2 sm:space-y-5">
          <h4 className="font-semibold text-lg sm:text-2xl whitespace-nowrap">Work With Us</h4>
          <ul className="text-base sm:text-lg space-y-1.5 sm:space-y-3 text-black/70">
            <li>
              <Link href="/become-partner" className="hover:text-theme-blue transition-colors">
                Cleaning Partner
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between flex-wrap max-w-[1290px] mx-auto pb-5 sm:pb-10 border-gray-300 border-b-1.5 space-y-4">
        <div className="flex items-center gap-2 max-sm:hidden pt-3">
          <div className="size-10 sm:size-14 overflow-hidden">
            <img
              className="w-full h-full object-contain"
              src="/images/logo.png"
              alt=""
            />
          </div>

          <h4 className="font-youth font-bold text-sm sm:text-xl text-theme-darkBlue sm:leading-5">
            Just dry <br /> cleaners
          </h4>
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <p className="text-base font-medium text-black/70">
            Download our mobile app
          </p>

          <div className="flex gap-2">
            <img src="/images/googlePlay.png" alt="" />
            <img src="/images/appStore.png" alt="" />
          </div>
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <p className="text-base font-medium text-black/70">Follow us</p>

          <div className="flex items-center gap-2">
            <div className="size-9 rounded-full shrink-0 bg-black/70 flex justify-center items-center">
              <FaFacebookF size={20} color="white" />
            </div>
            <div className="size-9 rounded-full shrink-0 bg-black/70 flex justify-center items-center">
              <SiInstagram size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-x-5 items-center max-w-[1290px] mx-auto py-5">
        <p className="text-xs sm:text-sm md:text-base text-black/70">
          All rights reserved. © Just Dry Cleaners 2025. By visiting this page
          you agree to our{" "}
          <a className="underline" href="#">
            Privacy policy
          </a>{" "}
          and
          <a className="underline" href="#">
            terms and conditions.
          </a>
        </p>

        <div className="border-[1px] border-black rounded-full items-center flex gap-2 h-[52px] px-2 cursor-pointer max-sm:hidden">
          <MdLocationPin size={20} />
          <p className="text-base text-black/70 whitespace-nowrap">
            London
          </p>
          <IoIosArrowDown />
        </div>
      </div>
    </div>
  );
}
