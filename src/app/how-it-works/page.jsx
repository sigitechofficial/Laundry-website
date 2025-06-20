import React from "react";
import Header from "../../../components/Header";
import { DarkBlueButton } from "../../../components/Buttons";
import FAQs from "../../../components/FAQs";
import Footer from "../../../components/Footer";
import HomeClientWrapper from "../../../utilities/Test";

export default function HowItWorks() {
  return (
    <>
      <HomeClientWrapper>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="how" />
        </div>

        <div className="w-full flex items-center relative h-[600px] sm:h-[750px] 2xl:h-[875px] px-5 sm:px-[45px]">
          <div className="w-full grid grid-cols-2 gap-10 max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0">
            <div className="max-w-[512px]">
              <h2 className="font-youth font-bold text-[64px] leading-tight">
                What to expect from your first pickup
              </h2>
              <p className="font-sf text-2xl text-theme-psGray my-8">
                Say goodbye to laundry day and trips to the cleaners. Here’s how
                Rinse works for you.
              </p>

              <div className="w-max">
                <DarkBlueButton text="book now" />
              </div>
            </div>

            <div>
              <img src="/images/howItWorks/pickup.png" alt="" />
            </div>
          </div>
        </div>

        {/* ////////1/////// */}

        <div className="bg-theme-gray w-full pt-24 pb-10 px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <h2 className="font-youth font-bold text-6xl text-center">
              How Just Dry Cleaners Work
            </h2>
            {/* 1 */}
            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Flexible Pickup & Delivery</p>
                <h4 className="font-youth font-bold text-2xl">
                  1. Schedule Your Collection
                </h4>

                <p className="text-base text-theme-psGray">
                  Enjoy total flexibility—choose a pickup and delivery time that
                  fits your schedule.
                </p>
                <ul className="text-base font-semibold space-y-2">
                  <li>
                    🌙 Evening and weekend slots available for your convenience
                  </li>
                  <li>🗓️ Book anytime online or through our mobile app</li>
                  <li>⏱️ Plan your day without disruption</li>
                </ul>
              </div>

              <div className="">
                <img src="/images/howItWorks/schedule.png" alt="" />
              </div>
            </div>

            {/* 2 */}

            <div className="flex justify-between flex-row-reverse items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Quick & Easy</p>
                <h4 className="font-youth font-bold text-2xl">
                  2. Pack Your Laundry
                </h4>

                <p className="text-base text-theme-psGray">
                  Getting started is effortless. Place your items in a
                  disposable bag—use one bag per service type. Our driver will
                  transfer your clothes into reusable Just Dry Cleaners bags,
                  which you can keep for your next order.
                </p>
                <ul className="text-base font-semibold space-y-2">
                  <li>
                    🎒 One bag per service (e.g., dry cleaning, wash & fold)
                  </li>
                  <li>✅ No need to count or weigh items</li>
                  <li>♻️ Reusable bags provided for future use</li>
                </ul>
              </div>

              <div className="">
                <img src="/images/howItWorks/pack.png" alt="" />
              </div>
            </div>

            {/* 3 */}

            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Transparent & Reliable</p>
                <h4 className="font-youth font-bold text-2xl">
                  3. Wait for Our Driver
                </h4>

                <p className="text-base text-theme-psGray">
                  Stay informed every step of the way. You'll receive a
                  notification when your Just Dry Cleaners driver is nearby.
                  They’ll collect your bags and deliver them to your local
                  cleaning facility.
                </p>
                <ul className="text-base font-semibold space-y-2">
                  <li>📲 Real-time driver tracking</li>
                  <li>🔔 Regular order updates</li>
                  <li>🚚 Professional pickup and delivery</li>
                </ul>
              </div>

              <div className="">
                <img src="/images/howItWorks/wait.png" alt="" />
              </div>
            </div>

            {/* 4 */}

            <div className="flex justify-between items-center flex-row-reverse gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Convenient & Hassle-Free</p>
                <h4 className="font-youth font-bold text-2xl">
                  4. Relax While We Handle the Rest
                </h4>

                <p className="text-base text-theme-psGray">
                  Your laundry is in good hands. Our trusted local partner will
                  clean your items with care, and your Just Dry Cleaners driver
                  will deliver them back at your preferred time. Not home? No
                  problem—you’re in full control and can easily reschedule.
                </p>
                <ul className="text-base font-semibold space-y-2">
                  <li>⏱️ Free 24h delivery</li>
                  <li>🔄 Easy to reschedule deliveries</li>
                </ul>
                <div className="w-max">
                  <DarkBlueButton text="book your laundry now" />
                </div>
              </div>

              <div className="">
                <img src="/images/howItWorks/relax.png" alt="" />
              </div>
            </div>
          </div>
        </div>
        {/* ///////2//////// */}

        <div className="w-full bg-theme-blue mt-[150px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <div className="flex justify-between items-center relative">
              <div className="font-youth text-white py-16 max-w-[559px]">
                <h4 className="font-bold text-5xl">Your Laundry, Our Care!</h4>
                <p className="font-bold text-xl pt-4 pb-10">
                  Convenient, Fast, and Fresh Every Time
                </p>
                <div className="w-max">
                  <DarkBlueButton text="Book your laundry now" />
                </div>
              </div>

              <div className="absolute bottom-0 right-0">
                <img src="/images/howItWorks/chair.png" alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* ///////3//////// */}

        <div>
          <FAQs />
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
      </HomeClientWrapper>
    </>
  );
}
