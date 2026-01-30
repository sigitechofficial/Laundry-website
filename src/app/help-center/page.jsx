"use client";
import React, { useState, useMemo } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import HomeClientWrapper from "../../../utilities/Test";
import HelpCenterCard from "../../../components/HelpCenterCard";
import { IoSearchOutline } from "react-icons/io5";

const helpCenterItems = [
  {
    heading: "How Just Dry Cleaners works",
    description: "Learn more about what to expect on your Just Dry Cleaners journey and available location.",
  },
  {
    heading: "More about Just Dry Cleaner services",
    description: "Read further information about Just Dry Cleaners most common services.",
  },
  {
    heading: "Help with your booking",
    description: "Learn how to schedule a collection, make changes and what to do if you're not at home.",
  },
  {
    heading: "Pricing and billing",
    description: "Learn how and when you will be charged and VAT receipts.",
  },
  {
    heading: "Discounts and benefits",
    description: "Find out what extra benefits are available with Just Dry Cleaners.",
  },
  {
    heading: "My Account",
    description: "Learn how to keep your information up to date and about repeat orders.",
  },
  {
    heading: "Reimbursement policies",
    description: "Read more on our policies for compensation.",
  },
  {
    heading: "Protecting your data",
    description: "Read more about how we protect your data.",
  },
  {
    heading: "Other helpful information",
    description: "Learn about the different cleaning processes, how dry cleaning works and some tips for healthy clothes.",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return helpCenterItems;
    }

    const query = searchQuery.toLowerCase().trim();
    return helpCenterItems.filter(
      (item) =>
        item.heading.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredItems.length > 0 ? (
                <HelpCenterCard
                  heading={filteredItems[0].heading}
                  description={filteredItems[0].description}
                />
              ) : searchQuery.trim() ? (
                <div className="w-full bg-white/90 rounded-xl px-4 sm:px-6 py-6 sm:py-8 shadow-theme-shadow-light">
                  <p className="text-center font-sf text-base sm:text-lg text-theme-psGray">
                    No articles found matching your search.
                  </p>
                </div>
              ) : (
                <HelpCenterCard
                  heading={helpCenterItems[0].heading}
                  description={helpCenterItems[0].description}
                />
              )}
            </div>

            <div className="absolute z-[-1] top-0 left-0 w-full h-full bg-gradient-to-b from-theme-blue/80 to-theme-blue-2/10"></div>
          </div>
        </div>

        <div className="w-full flex justify-center items-center relative pt-6 sm:pt-8 px-5 sm:px-[45px] pb-12 sm:pb-16">
          <div className="w-full max-w-[1290px] mx-auto space-y-4 sm:space-y-5">
            {filteredItems.length > 1 &&
              filteredItems.slice(1).map((item, index) => (
                <HelpCenterCard
                  key={index}
                  heading={item.heading}
                  description={item.description}
                />
              ))}
          </div>
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </HomeClientWrapper>
  );
}
