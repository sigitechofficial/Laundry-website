import React from "react";
import Header from "../../../components/Header";
import { DarkBlueButton } from "../../../components/Buttons";
import { FaArrowRight } from "react-icons/fa6";
import Footer from "../../../components/Footer";

export default function AboutUs() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="aboutUs" />
        </div>

        <div className="w-full flex items-center relative h-[600px] sm:h-[750px] 2xl:h-[825px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0">
            <h2 className="font-youth font-bold text-[64px] leading-tight max-w-[945px]">
              Leading the Next Generation of Laundry and Dry Cleaning
            </h2>

            <p className="font-sf font-medium text-2xl max-w-[945px] pt-6">
              With Just Dry Cleaners, laundry is simple. Quick, dependable, and
              designed to fit your life.
            </p>
          </div>
        </div>

        <div className="bg-theme-gray w-full">
          <div className="w-full max-w-[1290px] mx-auto">
            {/* 1 */}
            <div className="flex justify-between items-center flex-row-reverse gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <h4 className="font-youth font-bold text-5xl">Who are we</h4>

                <p className="text-base text-theme-psGray">
                  Founded in 2025 in London, Just Dry Cleaners is the
                  next-generation laundry and dry cleaning company. We provide
                  professional cleaning services delivered to your doorstep in
                  as little as 24 hours.
                </p>
              </div>

              <div className="rounded-lg overflow-hidden">
                <img src="/images/about-us/clothes.png" alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* meet the team */}

        <div className="bg-theme-blue text-white w-full py-[75px]">
          <h2 className="font-youth font-bold text-6xl text-center">
            Meet the team
          </h2>
          <div className="w-full max-w-[1290px] mx-auto grid grid-cols-4 gap-10 py-20">
            <div className="bg-theme-gray h-[284px]"></div>
            <div className="bg-theme-gray h-[284px]"></div>
            <div className="bg-theme-gray h-[284px]"></div>
            <div className="bg-theme-gray h-[284px]"></div>
            <div className="bg-theme-gray h-[284px] col-start-2"></div>
            <div className="bg-theme-gray h-[284px]"></div>
          </div>
        </div>

        {/* we are committed */}

        <div className="w-full">
          <div className="w-full max-w-[1290px] mx-auto">
            {/* 1 */}
            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <h6 className="font-youth font-bold text-[28px] leading-tight">
                  We're committed to making your life easier, one clean at a
                  time.
                </h6>

                <p className="text-xl font-medium">
                  In the 21st century, managing your laundry and dry cleaning
                  should be simple, seamless, and accessible from anywhere.
                </p>
                <p className="text-LG text-theme-psGray">
                  We’ve built an app that lets you schedule an order in under 2
                  minutes—whether you're at home, at work, or on the go. No
                  calls, no hassle. Manage everything easily through our website
                  or mobile app.
                </p>

                <div className="w-full rounded-3xl bg-bgAvailable flex flex-col items-center sm:flex-row gap-5 p-6 mt-8">
                  <div className="space-y-2 sm:space-y-6 flex flex-col items-center">
                    <img
                      className="size-14"
                      src="/images/logo.png"
                      alt="logo"
                    />

                    <p className="text-sm sm:text-lg text-theme-gray font-sf">
                      Available on iOS and Android
                    </p>

                    <div className="flex gap-2 sm:gap-5 [&>img]:max-w-[120px]">
                      <img src="/images/googlePlay.png" alt="google play" />
                      <img src="/images/appStore.png" alt="app store" />
                    </div>
                  </div>

                  <div className="ml-auto">
                    <img
                      className="max-h-[129px]"
                      src="/images/landingPage/qr.png"
                      alt=""
                    />
                    <p className="text-center text-sm text-white font-sf mt-2">
                      Or scan QR code <br /> with your device
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden">
                <img
                  className="hover:scale-105 duration-500 transition-all"
                  src="/images/about-us/clothes.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        {/* where quality */}

        <div className="w-full bg-theme-gray">
          <div className="w-full max-w-[1290px] mx-auto">
            {/* 1 */}
            <div className="flex justify-between items-center flex-row-reverse gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <h6 className="font-youth font-bold text-[28px] leading-tight">
                  Where quality is never sacrificed.
                </h6>

                <p className="text-xl font-medium">
                  We work with carefully selected local cleaning and delivery
                  partners to ensure your items receive the highest level of
                  care.
                </p>
                <p className="text-LG text-theme-psGray">
                  We never compromise on quality or speed. Our partner drivers
                  are fairly compensated, and we proudly collaborate with dozens
                  of reliable local cleaning facilities to minimize transport
                  and maximize efficiency.
                </p>
              </div>

              <div className="rounded-lg overflow-hidden">
                <img
                  className="hover:scale-105 duration-500 transition-all"
                  src="/images/about-us/clothes.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        {/* don't let your chores */}

        <div className="w-full bg-theme-skyBlue">
          <div className="w-full max-w-[1290px] mx-auto">
            {/* 1 */}
            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <h6 className="font-youth font-bold text-4xl leading-tight">
                  Don’t let your chores define you—let us handle the laundry.
                </h6>

                <p className="text-xl font-semibold">
                  Enter your address and schedule a pickup today.
                </p>

                <div className="w-max">
                  <DarkBlueButton text="book your laundry now" />
                </div>
              </div>

              <div className="rounded-lg overflow-hidden">
                <img
                  className="hover:scale-105 duration-500 transition-all"
                  src="/images/about-us/clothes.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        {/* our blog */}

        <div className="w-full py-16">
          <div className="w-full max-w-[1290px] mx-auto">
            <div className="flex justify-between items-center font-youth pb-9">
              <h6 className="font-bold text-4xl">Our blog</h6>
              <p className="font-bold text-base text-theme-blue">View all</p>
            </div>

            <div className="grid grid-cols-3 gap-5 pb-16">
              <div className="space-y-2">
                <img
                  className="rounded-md"
                  src="/images/about-us/blog1.png"
                  alt=""
                />

                <p className="text-base text-theme-psGray">
                  5 Mistake You Might Be Making When Washing Your Gym Clothes
                </p>
              </div>
              <div className="space-y-2">
                <img
                  className="rounded-md"
                  src="/images/about-us/blog2.png"
                  alt=""
                />

                <p className="text-base text-theme-psGray">
                  Removing Sunscreen Stains From Clothes
                </p>
              </div>
              <div className="space-y-2">
                <img
                  className="rounded-md"
                  src="/images/about-us/blog3.png"
                  alt=""
                />

                <p className="text-base text-theme-psGray">
                  5 Ways to Reduce Sweating Through Your Clothes
                </p>
              </div>
            </div>

            <div className="w-full max-w-[932px] h-[462px] mx-auto bg-discount bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center relative">
              <div className="flex flex-col justify-center items-center max-w-[655px] z-10">
                <h6 className="font-youth font-bold text-4xl leading-tight text-center text-white pb-8">
                  Want a discount? Refer your friends and earn rewards!
                </h6>

                <button className="bg-white rounded-full text-black flex items-center gap-x-2 px-4 h-12 sm:h-[60px] group">
                  <FaArrowRight className="text-2xl -rotate-45 group-hover:rotate-0 duration-200" />

                  <p className="font-youth font-bold text-xl uppercase">
                    Refer a friend and earn
                  </p>
                </button>
              </div>

              <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-0"></div>
            </div>
          </div>
        </div>

        {/* footer */}

        <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </>
  );
}
