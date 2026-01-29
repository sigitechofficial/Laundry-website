"use client";
import { useState } from "react";
import Header from "../../components/Header";
import { PiArrowRight } from "react-icons/pi";
import Footer from "../../components/Footer";
import ClientSwiper from "../../components/ClientSwiper";
import FAQs from "../../components/FAQs";
import HomeClientWrapper from "../../utilities/Test";
import Link from "next/link";
import { ClientBtn } from "../../utilities/HelperFunctions";

export default function Home() {
  const [activeTab, setActiveTab] = useState("wash-fold");
  return (
    <HomeClientWrapper>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header />
        </div>

        <div className="w-full h-[600px] sm:h-[750px]  2xl:h-[900px] flex items-center relative px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0">
            <h4 className="uppercase font-youth font-black text-6xl md:text-7xl lg:text-[100px] xl:text-[120px] xl:leading-[120px] text-white">
              Do your <br /> laundry <br />
              <span className="text-theme-darkBlue">smartly</span>
            </h4>

            <p className="w-full text-md sm:text-xl mt-6 mb-10 text-white max-w-[440px]">
              Welcome to Bubbles Laundry Services, where we transform your
              laundry day into a breeze!
            </p>

            <div className="w-max sm:w-[340px] flex items-center gap-3 font-sf bg-white rounded-2xl px-3 py-3 2xl:py-4">
              <div className="border-r-1 border-gray-400 sm:pl-2 pr-2">
                <h6 className="text-md sm:text-[22px] font-semibold">Pickup</h6>
                <p className="text-sm sm:text-lg text-black/60">Today</p>
              </div>
              <div className=" pr-3">
                <h6 className="text-md sm:text-[22px] font-semibold">Where</h6>
                <p className="text-sm sm:text-lg text-black/60">Add zip code</p>
              </div>
              <ClientBtn>
                <p
                  //  href="/place-order"
                  className="size-10 sm:size-14 rounded-lg bg-theme-darkBlue flex justify-center items-center cursor-pointer ml-auto"
                >
                  <PiArrowRight
                    className="text-2xl sm:text-[40px]"
                    color="white"
                  />
                </p>
              </ClientBtn>
            </div>
          </div>

          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover absolute top-0 left-0 z-[-2]"
            src="/images/landingPage/heroSectionVideo.mp4"
            playsInline
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
          ></video>
          <div className="absolute top-0 left-0 w-full h-full bg-black/15 z-[-1]"></div>
        </div>

        <div className="w-full py-8 sm:py-14 bg-[#DDEEFC] px-5 md:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto flex flex-col items-center">
            <div className="w-full ">
              <h4 className="font-youth font-bold text-2xl sm:text-4xl 2xl:text-6xl text-center">
                How Laundry Services Works
              </h4>
            </div>

            <div className="w-full flex justify-center gap-4 sm:gap-x-14 xl:gap-28 mt-5 sm:mt-14 font-sf">
              <div className="flex flex-col items-center gap-y-4 sm:gap-y-5">
                <div className="size-14 sm:size-[100px] lg:size-[120px] flex justify-center items-center bg-white rounded-full shrink-0 shadow-theme-shadow">
                  <img
                    className="w-8 sm:w-[50px] object-contain"
                    src="/images/landingPage/youBook.png"
                    alt=""
                  />
                </div>

                <p className="font-semibold text-sm md:text-xl lg:text-2xl text-theme-gray-2">
                  You Book
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-4 sm:gap-y-5">
                <div className="size-14 sm:size-[100px] lg:size-[120px] flex justify-center items-center bg-white rounded-full shrink-0 shadow-theme-shadow">
                  <img
                    className="w-8 sm:w-[50px] object-contain"
                    src="/images/landingPage/weCollect.png"
                    alt=""
                  />
                </div>

                <p className="font-semibold text-sm md:text-xl lg:text-2xl text-theme-gray-2">
                  We Collect
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-4 sm:gap-y-5">
                <div className="size-14 sm:size-[100px] lg:size-[120px] flex justify-center items-center bg-white rounded-full shrink-0 shadow-theme-shadow">
                  <img
                    className="w-8 sm:w-[50px] object-contain"
                    src="/images/landingPage/weClean.png"
                    alt=""
                  />
                </div>

                <p className="font-semibold text-sm md:text-xl lg:text-2xl text-theme-gray-2">
                  We Clean
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-4 sm:gap-y-5">
                <div className="size-14 sm:size-[100px] lg:size-[120px] flex justify-center items-center bg-white rounded-full shrink-0 shadow-theme-shadow">
                  <img
                    className="w-8 sm:w-[50px] object-contain"
                    src="/images/landingPage/weDeliver.png"
                    alt=""
                  />
                </div>

                <p className="font-semibold text-sm md:text-xl lg:text-2xl text-theme-gray-2">
                  We Deliver
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full pt-8 sm:pt-28 2xl:pt-60 bg-theme-gray px-5 md:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <div className="w-full">
              <h4 className="font-youth font-bold text-2xl sm:text-[50px] text-center uppercase tracking-tighter">
                Our Services
              </h4>
              <p className="lg:w-[695px] text-base sm:text-xl text-center text-theme-gray-3 mx-auto py-6 sm:px-5">
                Established with the mission to simplify your life and elevate
                your laundry experience, we bring a blend of modern technology
                and eco-friendly practices.
              </p>
            </div>

            <div className="w-full max-sm:max-w-[468px] overflow-scroll hideScrollbar sm:w-max mx-auto bg-black rounded-full p-2 flex gap-2 font-sf [&>div]:whitespace-nowrap [&>div]:text-sm sm:[&>div]:text-base [&>div]:px-2 [&>div]:py-2 [&>div]:rounded-full [&>div]:text-white [&>div]:cursor-pointer relative -bottom-7">
              <div 
                onClick={() => setActiveTab("wash-fold")}
                className={`transition-all duration-300 ${activeTab === "wash-fold" ? "bg-theme-blue text-white" : "bg-white/35"}`}
              >
                Wash & Fold
              </div>
              <div 
                onClick={() => setActiveTab("dry-cleaning")}
                className={`transition-all duration-300 ${activeTab === "dry-cleaning" ? "bg-theme-blue text-white" : "bg-white/35"}`}
              >
                Dry Cleaning
              </div>
              <div 
                onClick={() => setActiveTab("ironing")}
                className={`transition-all duration-300 ${activeTab === "ironing" ? "bg-theme-blue text-white" : "bg-white/35"}`}
              >
                Ironing Service
              </div>
            </div>

            <div className="w-full rounded-[20px] bg-white px-4 sm:px-12 pb-5 pt-14 sm:py-14 flex gap-10 font-sf">
              {/* Wash & Fold Content */}
              {activeTab === "wash-fold" && (
                <div className="w-full flex gap-10 animate-fadeIn">
                  <div className="font-sf flex-1">
                    <h4 className="font-youth font-black text-2xl sm:text-4xl tracking-tighter uppercase">
                      Effortless Laundry, <br /> Perfectly Folded
                    </h4>
                    <p className="text-sm sm:text-xl text-theme-gray-2 mt-4 md:leading-8">
                      Our Wash & Fold service is designed to make your life easier.
                      Simply drop off your laundry, and we'll take care of the rest.
                      From sorting and washing to drying and folding, we handle each
                      step with precision and care.
                    </p>

                    <div className="rounded-xl overflow-hidden md:h-[469px] flex-1 mt-5 sm:mt-10 xl:hidden">
                      <img
                        className="w-full h-full object-cover hover:scale-105 duration-500"
                        src="/images/landingPage/wash.png"
                        alt="wash & fold"
                      />
                    </div>
                    <h6 className="font-semibold uppercase text-xl mt-5 sm:mt-10 mb-5">
                      What we offer
                    </h6>
                    <div className="grid grid-cols-2 gap-3 sm:gap-x-10 ">
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Comprehensive Cleaning
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Perfect Folding
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Attention to Detail
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Convenient Pickup & Delivery
                        </p>
                      </div>
                      <ClientBtn>
                        <p
                          //  href="/place-order"
                          className="bg-theme-darkBlue rounded-full flex justify-center items-center sm:w-52 h-10 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl sm:mt-4"
                        >
                          Start Cleaning
                        </p>
                      </ClientBtn>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden h-[469px] flex-1 max-xl:hidden">
                    <img
                      className="w-full h-full object-cover hover:scale-105 duration-500"
                      src="/images/landingPage/wash.png"
                      alt="wash & fold"
                    />
                  </div>
                </div>
              )}

              {/* Dry Cleaning Content */}
              {activeTab === "dry-cleaning" && (
                <div className="w-full flex gap-10 animate-fadeIn">
                  <div className="font-sf flex-1">
                    <h4 className="font-youth font-black text-2xl sm:text-4xl tracking-tighter uppercase">
                      Professional Dry Cleaning, <br /> Expert Care
                    </h4>
                    <p className="text-sm sm:text-xl text-theme-gray-2 mt-4 md:leading-8">
                      Our Dry Cleaning service provides professional care for your delicate and special garments.
                      Using advanced techniques and eco-friendly solvents, we ensure your clothes look and feel their best.
                      From suits to dresses, we handle each item with the utmost precision and attention.
                    </p>

                    <div className="rounded-xl overflow-hidden md:h-[469px] flex-1 mt-5 sm:mt-10 xl:hidden">
                      <img
                        className="w-full h-full object-cover hover:scale-105 duration-500"
                        src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop"
                        alt="dry cleaning"
                      />
                    </div>
                    <h6 className="font-semibold uppercase text-xl mt-5 sm:mt-10 mb-5">
                      What we offer
                    </h6>
                    <div className="grid grid-cols-2 gap-3 sm:gap-x-10 ">
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Professional Cleaning
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Stain Removal
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Expert Pressing
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Delicate Fabric Care
                        </p>
                      </div>
                      <ClientBtn>
                        <p
                          //  href="/place-order"
                          className="bg-theme-darkBlue rounded-full flex justify-center items-center sm:w-52 h-10 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl sm:mt-4"
                        >
                          Start Cleaning
                        </p>
                      </ClientBtn>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden h-[469px] flex-1 max-xl:hidden">
                    <img
                      className="w-full h-full object-cover hover:scale-105 duration-500"
                      src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop"
                      alt="dry cleaning"
                    />
                  </div>
                </div>
              )}

              {/* Ironing Service Content */}
              {activeTab === "ironing" && (
                <div className="w-full flex gap-10 animate-fadeIn">
                  <div className="font-sf flex-1">
                    <h4 className="font-youth font-black text-2xl sm:text-4xl tracking-tighter uppercase">
                      Crisp & Professional, <br /> Perfectly Pressed
                    </h4>
                    <p className="text-sm sm:text-xl text-theme-gray-2 mt-4 md:leading-8">
                      Our Ironing Service ensures your clothes look crisp and professional every time.
                      With expert pressing techniques and attention to detail, we transform wrinkled garments
                      into perfectly pressed pieces. From shirts to pants, we make sure you always look your best.
                    </p>

                    <div className="rounded-xl overflow-hidden md:h-[469px] flex-1 mt-5 sm:mt-10 xl:hidden">
                      <img
                        className="w-full h-full object-cover hover:scale-105 duration-500"
                        src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop"
                        alt="ironing service"
                      />
                    </div>
                    <h6 className="font-semibold uppercase text-xl mt-5 sm:mt-10 mb-5">
                      What we offer
                    </h6>
                    <div className="grid grid-cols-2 gap-3 sm:gap-x-10 ">
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Expert Pressing
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Wrinkle Removal
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Professional Finish
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="size-6 rounded-md bg-theme-darkBlue  shrink-0"></p>
                        <p className="text-theme-psGray text-sm sm:text-base">
                          Quick Turnaround
                        </p>
                      </div>
                      <ClientBtn>
                        <p
                          //  href="/place-order"
                          className="bg-theme-darkBlue rounded-full flex justify-center items-center sm:w-52 h-10 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl sm:mt-4"
                        >
                          Start Cleaning
                        </p>
                      </ClientBtn>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden h-[469px] flex-1 max-xl:hidden">
                    <img
                      className="w-full h-full object-cover hover:scale-105 duration-500"
                      src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop"
                      alt="ironing service"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center py-12 sm:py-[100px] lg:gap-20 2xl:py-[200px]">
              <div className="flex-1 rounded-xl overflow-hidden max-h-[793px] max-lg:hidden">
                <img
                  className="w-full h-full object-cover hover:scale-105 duration-500"
                  src="/images/landingPage/whyChooseUs.png"
                  alt="why choose us"
                />
              </div>

              <div className="flex-1 font-sf">
                <h6 className="font-youth font-black text-2xl sm:text-4xl tracking-tighter uppercase">
                  Why Choose Us?
                </h6>

                <p className="text-sm sm:text-xl text-theme-gray-2 mt-4 lg:mb-16 sm:leading-8">
                  Experience the ultimate in convenience and quality with
                  Bubbles Laundry Services’ Wash & Fold.
                </p>

                <div className="flex-1 rounded-xl overflow-hidden max-h-[600px] lg:max-h-[793px] my-8  lg:my-0 lg:hidden">
                  <img
                    className="w-full h-full object-cover hover:scale-105 duration-500"
                    src="/images/landingPage/whyChooseUs.png"
                    alt="why choose us"
                  />
                </div>

                <div className="space-y-5">
                  <div className="flex gap-x-3 bg-white rounded-[20px] p-2">
                    <div className="bg-theme-gray size-14 shrink-0 rounded-xl flex justify-center items-center">
                      <img src="/images/landingPage/timeSaving.png" />
                    </div>

                    <div className="sm:space-y-2 pt-1 pb-3">
                      <h6 className="font-semibold text-lg sm:text-xl uppercase tracking-tighter">
                        Time-Saving
                      </h6>
                      <p className="text-sm sm:text-base text-theme-psGray tracking-tight max-w-[450px]">
                        Free up your valuable time for more important things
                        while we handle your laundry.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-x-3 bg-white rounded-[20px] p-2">
                    <div className="bg-theme-gray size-14 shrink-0 rounded-xl flex justify-center items-center">
                      <img src="/images/landingPage/highQualityCare.png" />
                    </div>

                    <div className="sm:space-y-2 pt-1 pb-3">
                      <h6 className="font-semibold text-lg sm:text-xl uppercase tracking-tighter">
                        High-Quality Care
                      </h6>
                      <p className="text-sm sm:text-base text-theme-psGray tracking-tight max-w-[450px]">
                        Our professional team treats your clothes with the
                        utmost care, ensuring they look and feel their best.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-x-3 bg-white rounded-[20px] p-2">
                    <div className="bg-theme-gray size-14 shrink-0 rounded-xl flex justify-center items-center">
                      <img src="/images/landingPage/ecoFriendly.png" />
                    </div>

                    <div className="sm:space-y-2 pt-1 pb-3">
                      <h6 className="font-semibold text-lg sm:text-xl uppercase tracking-tighter">
                        Eco-Friendly Products
                      </h6>
                      <p className="text-sm sm:text-base text-theme-psGray tracking-tight max-w-[450px]">
                        We use safe, environmentally friendly detergents that
                        are tough on stains but gentle on your clothes and skin.
                      </p>
                    </div>
                  </div>
                </div>
                <ClientBtn>
                  <p
                    // href="/place-order"
                    className="bg-theme-darkBlue rounded-full flex justify-center items-center w-36 sm:w-52 h-12 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl mt-6 sm:mt-10"
                  >
                    Book Now
                  </p>
                </ClientBtn>
              </div>
            </div>
          </div>
        </div>

        {/* swiper part  */}

        <div className="w-full py-8 sm:py-14 xl:py-20 2xl:py-36 bg-white  px-5 md:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <ClientSwiper clients={[1, 2, 3, 4, 5]} />
          </div>
        </div>

        {/* after swiper section  */}

        <div className="w-full h-[400px] md:h-[600px] xl:h-[743px] bg-[url(/images/landingPage/readyToExperience.jpg)] bg-cover bg-center bg-no-repeat relative flex justify-center items-center  px-5 md:px-[45px]">
          <div className="absolute top-0 left-0 w-full h-full z-1 bg-black/30 pointer-events-none"></div>
          <div className="w-full max-w-[1290px] mx-auto relative z-10">
            <h4 className="text-2xl sm:text-5xl md:text-6xl xl:text-7xl text-white font-youth font-black uppercase text-center xl:leading-[90px]">
              Ready to Experience the Fresh & Clean Difference?
            </h4>

            <div className="w-max mx-auto rounded-3xl bg-[#55ACEE99] flex flex-col items-center sm:flex-row gap-5 p-6 mt-8">
              <div className="space-y-2 sm:space-y-6 flex flex-col items-center">
                <img className="size-14" src="/images/logo.png" alt="logo" />

                <p className="text-sm sm:text-lg text-theme-gray font-sf">
                  Available on iOS and Android
                </p>

                <div className="flex gap-2 sm:gap-5 [&>img]:max-w-[120px]">
                  <img src="/images/googlePlay.png" alt="google play" />
                  <img src="/images/appStore.png" alt="app store" />
                </div>
              </div>

              <div className="max-sm:hidden">
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
        </div>

        {/*theme dark blue section  */}
        <div className="w-full xl:h-[670px] bg-theme-darkBlue flex items-center px-5 md:px-[45px] py-8 sm:py-16 xl:py-0">
          <div className="w-full max-w-[1290px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="flex flex-col justify-center text-white">
              <h4 className="uppercase font-youth font-black tracking-tight text-2xl sm:text-5xl">
                pricing
              </h4>

              <p className="text-sm sm:text-xl tracking-tight py-4 font-sf md:leading-9">
                We providing top-quality services at affordable prices. <br />{" "}
                Our transparent pricing structure ensures you get the <br />{" "}
                best value for your money without any hidden fees.
              </p>
            </div>

            <div className="bg-white rounded-[20px] py-5 px-3 sm:p-5 flex gap-3 sm:gap-5 justify-between">
              <div className="space-y-1 sm:space-y-3 font-sf">
                <h6 className="font-semibold font-sf text-lg sm:text-xl tracking-tight uppercase">
                  Dry Cleaning
                </h6>
                <h6 className="font-black font-sf text-sm tracking-tight uppercase">
                  Includes
                </h6>

                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Sorting by color and fabric type
                  </p>
                </div>
                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Eco-friendly detergent
                  </p>
                </div>
                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Washing, drying, and neatly folding
                  </p>
                </div>
              </div>

              <div className="">
                <div className="rounded-xl py-5 px-3 sm:p-5 text-white bg-theme-blue-2 w-[150px] sm:w-[223px]">
                  <p className="text-sm font-sf text-white">Regular Laundry</p>
                  <span className="text-[40px] font-black font-youth">
                    $4.5
                  </span>{" "}
                  <span className="text-xs font-sf text-white">/lbs</span>
                </div>

                <ClientBtn>
                  <p
                    // href="/place-order"
                    className="bg-black rounded-full flex justify-center items-center w-full h-[36px] sm:h-[55px] font-sf font-medium text-white text-sm sm:text-lg mt-2"
                  >
                    Start Cleaning
                  </p>
                </ClientBtn>
              </div>
            </div>
            <div className="bg-white rounded-[20px] py-5 px-3 sm:p-5 flex gap-3 sm:gap-5 justify-between">
              <div className="space-y-1 sm:space-y-3 font-sf">
                <h6 className="font-semibold font-sf text-lg sm:text-xl  tracking-tight uppercase">
                  Dry Cleaning
                </h6>
                <h6 className="font-black font-sf text-sm tracking-tight uppercase">
                  Includes
                </h6>

                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Sorting by color and fabric type
                  </p>
                </div>
                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Eco-friendly detergent
                  </p>
                </div>
                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Washing, drying, and neatly folding
                  </p>
                </div>
              </div>

              <div className="">
                <div className="rounded-xl py-5 px-3 sm:p-5 text-white bg-theme-blue-2 w-[150px] sm:w-[223px]">
                  <p className="text-sm font-sf text-white">Regular Laundry</p>
                  <span className="text-[40px] font-black font-youth">
                    $4.5
                  </span>{" "}
                  <span className="text-xs font-sf text-white">/lbs</span>
                </div>
                <ClientBtn>
                  <p
                    // href="/place-order"
                    className="bg-black rounded-full flex justify-center items-center w-full h-[36px] sm:h-[55px] font-sf font-medium text-white text-sm sm:text-lg mt-2"
                  >
                    Start Cleaning
                  </p>
                </ClientBtn>
              </div>
            </div>

            <div className="bg-white rounded-[20px] py-5 px-3 sm:p-5 flex gap-3 sm:gap-5 justify-between">
              <div className="space-y-1 sm:space-y-3 font-sf">
                <h6 className="font-semibold font-sf text-lg sm:text-xl  tracking-tight uppercase">
                  Dry Cleaning
                </h6>
                <h6 className="font-black font-sf text-sm tracking-tight uppercase">
                  Includes
                </h6>

                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Sorting by color and fabric type
                  </p>
                </div>
                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Eco-friendly detergent
                  </p>
                </div>
                <div className="flex gap-2">
                  <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                  <p className="text-theme-psGray text-sm sm:text-base">
                    Washing, drying, and neatly folding
                  </p>
                </div>
              </div>

              <div className="">
                <div className="rounded-xl py-5 px-3 sm:p-5 text-white bg-theme-blue-2 w-[150px] sm:w-[223px]">
                  <p className="text-sm font-sf text-white">Regular Laundry</p>
                  <span className="text-[40px] font-black font-youth">
                    $4.5
                  </span>{" "}
                  <span className="text-xs font-sf text-white">/lbs</span>
                </div>

                <ClientBtn>
                  <p
                    // href="/place-order"
                    className="bg-black rounded-full flex justify-center items-center w-full h-[36px] sm:h-[55px] font-sf font-medium text-white text-sm sm:text-lg mt-2"
                  >
                    Start Cleaning
                  </p>
                </ClientBtn>
              </div>
            </div>
          </div>
        </div>

        {/*FAQs section  */}
        <div className="px-5 sm:px-8">
          <FAQs />
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </HomeClientWrapper>
  );
}
