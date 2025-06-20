import React from "react";
import Header from "../../../components/Header";
import { IoSearchOutline } from "react-icons/io5";
import { SlQuestion } from "react-icons/sl";

export default function Help() {
  return (
    <div className="w-full relative">
      <div className="max-xl:fixed max-xl:z-50 w-full">
        <Header />
      </div>
      <div className="w-full flex justify-center items-center relative px-5 sm:px-[45px]">
        <div className="flex justify-center items-end pb-4 w-full h-[525px] max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0 overflow-hidden">
          <div className="w-full text-white relative z-10 space-y-10">
            <h2 className="font-youth font-bold text-[44px]">
              Hi there! Welcome to our help Centre.
            </h2>
            <div className="bg-inputBg relative rounded-lg w-full h-14">
              <div className="absolute top-1/2 -translate-y-1/2 left-3">
                <IoSearchOutline className="text-2xl text-black" />
              </div>

              <input
                className="w-full h-full pl-12 pr-2 text-theme-gray-3 outline-none bg-transparent"
                type="text"
                placeholder="Search for articles...."
              />
            </div>

            <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
              <div className="flex items-center gap-x-4">
                <SlQuestion size={40} className="text-theme-blue" />

                <div className="font-sf text-black space-y-2">
                  <h6 className="text-xl font-semibold">
                    How Just Dry Cleaners works
                  </h6>
                  <p className="text-xl text-theme-psGray">
                    Learn more about what to expect on your Just Dry Cleaners
                    journey and available location.
                  </p>
                  <p className="text-base text-theme-psGray">10 articles</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute z-[-1] top-0 left-0 w-full h-full bg-gradient-to-b from-theme-blue/80 to-theme-blue-2/10"></div>
        </div>
      </div>

      <div className="w-full flex justify-center items-center relative pt-1 px-5 sm:px-[45px]">
        <div className="w-full max-w-[1290px] mx-auto space-y-5 pb-10">
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">
                  More about Just Dry Cleaner services
                </h6>
                <p className="text-xl text-theme-psGray">
                  Read further information about Just Dry Cleaners most common
                  services.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">
                  Help with your booking
                </h6>
                <p className="text-xl text-theme-psGray">
                  Learn how to schedule a collection, make changes and what to
                  do if you're not at home.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">Pricing and billing</h6>
                <p className="text-xl text-theme-psGray">
                  Learn how and when you will be charged and VAT receipts.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">
                  Discounts and benefits
                </h6>
                <p className="text-xl text-theme-psGray">
                  Find out what extra benefits are available with Just Dry
                  Cleaners.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">My Account</h6>
                <p className="text-xl text-theme-psGray">
                  Learn how to keep your information up to date and about repeat
                  orders.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">
                  Reimbursement policies
                </h6>
                <p className="text-xl text-theme-psGray">
                  Read more on our policies for compensation.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">Protecting your data</h6>
                <p className="text-xl text-theme-psGray">
                  Read more about how we protect your data.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/90 rounded-xl px-6 py-8 shadow-theme-shadow-light">
            <div className="flex items-center gap-x-4">
              <SlQuestion size={40} className="text-theme-blue" />

              <div className="font-sf text-black space-y-2">
                <h6 className="text-xl font-semibold">
                  Other helpful information
                </h6>
                <p className="text-xl text-theme-psGray">
                  Learn about the different cleaning processes, how dry cleaning
                  works and some tips for healthy clothes.
                </p>
                <p className="text-base text-theme-psGray">10 articles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
