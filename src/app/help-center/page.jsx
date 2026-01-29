import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import HomeClientWrapper from "../../../utilities/Test";
import HelpCenterCard from "../../../components/HelpCenterCard";
import { IoSearchOutline } from "react-icons/io5";

export default function Help() {
  return (
    <HomeClientWrapper>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header />
        </div>
        <div className="w-full flex justify-center items-center relative px-5 sm:px-[45px] pt-24 md:pt-24 lg:pt-20 xl:pt-20">
          <div className="flex justify-center items-end pb-4 w-full  max-w-[1290px] mx-auto overflow-hidden">
            <div className="w-full text-white relative z-10 space-y-6 sm:space-y-8 lg:space-y-10">
              <h2 className="font-youth font-bold text-3xl sm:text-4xl lg:text-[44px] leading-tight">
                Hi there! Welcome to our help Centre.
              </h2>
              <div className="bg-inputBg relative rounded-lg w-full h-12 sm:h-14">
                <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4">
                  <IoSearchOutline className="text-xl sm:text-2xl text-black" />
                </div>

                <input
                  className="w-full h-full pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-theme-gray-3 outline-none bg-transparent"
                  type="text"
                  placeholder="Search for articles...."
                />
              </div>

              <HelpCenterCard
                heading="How Just Dry Cleaners works"
                description="Learn more about what to expect on your Just Dry Cleaners journey and available location."
              />
            </div>

            <div className="absolute z-[-1] top-0 left-0 w-full h-full bg-gradient-to-b from-theme-blue/80 to-theme-blue-2/10"></div>
          </div>
        </div>

        <div className="w-full flex justify-center items-center relative pt-6 sm:pt-8 px-5 sm:px-[45px] pb-12 sm:pb-16">
          <div className="w-full max-w-[1290px] mx-auto space-y-4 sm:space-y-5">
            <HelpCenterCard
              heading="More about Just Dry Cleaner services"
              description="Read further information about Just Dry Cleaners most common services."
            />
            <HelpCenterCard
              heading="Help with your booking"
              description="Learn how to schedule a collection, make changes and what to do if you're not at home."
            />
            <HelpCenterCard
              heading="Pricing and billing"
              description="Learn how and when you will be charged and VAT receipts."
            />
            <HelpCenterCard
              heading="Discounts and benefits"
              description="Find out what extra benefits are available with Just Dry Cleaners."
            />
            <HelpCenterCard
              heading="My Account"
              description="Learn how to keep your information up to date and about repeat orders."
            />
            <HelpCenterCard
              heading="Reimbursement policies"
              description="Read more on our policies for compensation."
            />
            <HelpCenterCard
              heading="Protecting your data"
              description="Read more about how we protect your data."
            />
            <HelpCenterCard
              heading="Other helpful information"
              description="Learn about the different cleaning processes, how dry cleaning works and some tips for healthy clothes."
            />
          </div>
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </HomeClientWrapper>
  );
}
