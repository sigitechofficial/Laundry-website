"use client";
import { useState, useMemo, useEffect } from "react";
import Header from "../../components/Header";
import { PiArrowRight } from "react-icons/pi";
import Footer from "../../components/Footer";
import ClientSwiper from "../../components/ClientSwiper";
import FAQs from "../../components/FAQs";
import HomeClientWrapper from "../../utilities/Test";
import Link from "next/link";
import { ClientBtn } from "../../utilities/HelperFunctions";
import { useGetServiceDetailsQuery } from "./store/services/api";
import { Spinner } from "@heroui/react";
import { BASE_URL } from "../../utilities/URL";

const getServiceImageUrl = (image) => {
  if (!image) return "/images/landingPage/wash.png";
  if (typeof image === "string" && image.startsWith("http")) return image;
  if (typeof image === "string") return `${BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  return "/images/landingPage/wash.png";
};

const getServiceKey = (name) => {
  if (!name) return "service";
  return String(name).toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
};

export default function Home() {
  const { data, isLoading, isError } = useGetServiceDetailsQuery();
  const serviceData = data?.data?.serviceData ?? data?.serviceData ?? [];
  const services = Array.isArray(serviceData) ? serviceData.filter((s) => s?.service?.status !== false) : [];

  const firstServiceKey = useMemo(() => (services[0] ? getServiceKey(services[0].service?.name) : "wash-fold"), [services]);
  const [activeTab, setActiveTab] = useState(firstServiceKey);

  useEffect(() => {
    if (services.length > 0 && !services.some((s) => getServiceKey(s.service?.name) === activeTab)) {
      setActiveTab(firstServiceKey);
    }
  }, [services, firstServiceKey, activeTab]);
  return (
    <HomeClientWrapper>
      <div className="w-full relative">
        {/* Header — always fixed so it overlays the hero */}
        <div className="fixed z-50 w-full">
          <Header type="home" />
        </div>

        {/* ── HERO ── */}
        <div className="w-full min-h-screen bg-theme-blue flex items-center relative px-5 sm:px-[45px] overflow-hidden">
          {/* Decorative blobs (from index.html) */}
          <div className="absolute -top-32 -right-32 size-[600px] rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 left-[30%] size-[400px] rounded-full bg-white/[0.04] pointer-events-none" />

          <div className="w-full max-w-[1290px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-10 xl:gap-16 pt-24 pb-14 xl:py-0 min-h-screen">

            {/* ── Left content ── */}
            <div className="flex-1 max-w-[560px] z-10">
              <h4 className="uppercase font-youth font-black text-white tracking-tight mb-4">
                <span className="block whitespace-nowrap text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px]">Do your laundry</span>
                <span className="block text-yellow-400 text-5xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[90px]">smartly</span>
              </h4>

              <p className="text-base sm:text-lg text-white/80 mb-7 font-sf max-w-[440px] leading-relaxed">
                Welcome to Bubbles Laundry Services, where we transform your
                laundry day into a breeze!
              </p>

              {/* Booking widget */}
              <div className="w-max sm:w-[340px] flex items-center gap-3 font-sf bg-white rounded-2xl px-3 py-3 2xl:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.22)]">
                <div className="border-r-1 border-gray-400 sm:pl-2 pr-2">
                  <h6 className="text-md sm:text-[22px] font-semibold">Pickup</h6>
                  <p className="text-sm sm:text-lg text-black/60">Today</p>
                </div>
                <div className="pr-3">
                  <h6 className="text-md sm:text-[22px] font-semibold">Where</h6>
                  <p className="text-sm sm:text-lg text-black/60">Add zip code</p>
                </div>
                <ClientBtn>
                  <p className="size-10 sm:size-14 rounded-lg bg-theme-darkBlue flex justify-center items-center cursor-pointer ml-auto">
                    <PiArrowRight className="text-2xl sm:text-[40px]" color="white" />
                  </p>
                </ClientBtn>
              </div>
            </div>

            {/* ── Right visual ── */}
            <div className="flex-1 justify-center items-center hidden xl:flex z-10 relative">
              <img
                src="/images/mem.png"
                alt="Laundry service"
                className="w-[540px] 2xl:w-[640px] h-auto object-contain select-none"
                draggable={false}
              />
              {/* Floating badge */}
              <div className="absolute top-10 -right-2 bg-white rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center gap-2 font-sf text-sm font-semibold text-black">
                <div className="size-2.5 rounded-full bg-green-500 shrink-0" />
                Available today in your area
              </div>
            </div>

          </div>
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

            {isLoading ? (
              <div className="min-h-[400px] flex justify-center items-center rounded-[20px] bg-white">
                <Spinner size="lg" color="primary" />
              </div>
            ) : isError ? (
              <div className="min-h-[400px] flex justify-center items-center rounded-[20px] bg-white">
                <p className="font-sf text-lg text-red-500">Unable to load services. Please try again later.</p>
              </div>
            ) : services.length === 0 ? (
              <div className="min-h-[400px] flex justify-center items-center rounded-[20px] bg-white">
                <p className="font-sf text-lg text-theme-gray-3">No services available at the moment.</p>
              </div>
            ) : (
              <>
                <div className="w-full max-sm:max-w-[468px] overflow-scroll hideScrollbar sm:w-max mx-auto bg-black rounded-full p-2 flex gap-2 font-sf [&>div]:whitespace-nowrap [&>div]:text-sm sm:[&>div]:text-base [&>div]:px-2 [&>div]:py-2 [&>div]:rounded-full [&>div]:text-white [&>div]:cursor-pointer relative -bottom-7">
                  {services.map((item) => {
                    const key = getServiceKey(item.service?.name);
                    return (
                      <div
                        key={item.serviceId ?? item.service?.id ?? key}
                        onClick={() => setActiveTab(key)}
                        className={`transition-all duration-300 ${activeTab === key ? "bg-theme-blue text-white" : "bg-white/35"}`}
                      >
                        {item.service?.name || "Service"}
                      </div>
                    );
                  })}
                </div>

                <div className="w-full rounded-[20px] bg-white px-4 sm:px-12 pb-5 pt-14 sm:py-14 flex gap-10 font-sf">
                  {services.map((item) => {
                    const key = getServiceKey(item.service?.name);
                    if (activeTab !== key) return null;

                    const description =
                      item.service?.description ||
                      item.categories?.[0]?.category?.description ||
                      `Our ${item.service?.name || "service"} provides professional care for your garments.`;
                    const categories = item.categories || [];

                    return (
                      <div key={key} className="w-full flex gap-10 animate-fadeIn">
                        <div className="font-sf flex-1">
                          <h4 className="font-youth font-black text-2xl sm:text-4xl tracking-tighter uppercase">
                            {item.service?.name || "Service"}
                          </h4>
                          <div
                            className="text-sm sm:text-xl text-theme-gray-2 mt-4 md:leading-8 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: description }}
                          />

                          <div className="rounded-xl overflow-hidden md:h-[469px] flex-1 mt-5 sm:mt-10 xl:hidden">
                            <img
                              className="w-full h-full object-cover hover:scale-105 duration-500"
                              src={getServiceImageUrl(item.service?.image)}
                              alt={item.service?.name || "service"}
                            />
                          </div>
                          <h6 className="font-semibold uppercase text-xl mt-5 sm:mt-10 mb-5">
                            What we offer
                          </h6>
                          <div className="grid grid-cols-2 gap-3 sm:gap-x-10">
                            {categories.slice(0, 4).map((cat) => (
                              <div key={cat.categoryId ?? cat.category?.id} className="flex gap-2">
                                <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                                <p className="text-theme-psGray text-sm sm:text-base">
                                  {cat.category?.name || "Category"}
                                </p>
                              </div>
                            ))}
                            <ClientBtn>
                              <p
                                className="bg-theme-darkBlue rounded-full flex justify-center items-center sm:w-52 h-10 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl sm:mt-4 col-span-2"
                              >
                                Start Cleaning
                              </p>
                            </ClientBtn>
                          </div>
                        </div>

                        <div className="rounded-xl overflow-hidden h-[469px] flex-1 max-xl:hidden">
                          <img
                            className="w-full h-full object-cover hover:scale-105 duration-500"
                            src={getServiceImageUrl(item.service?.image)}
                            alt={item.service?.name || "service"}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

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
        <div className="w-full bg-theme-darkBlue flex items-center px-5 md:px-[45px] py-8 sm:py-16">
          <div className="w-full max-w-[1290px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="flex flex-col justify-center text-white">
              <h4 className="uppercase font-youth font-black tracking-tight text-2xl sm:text-5xl">
                pricing
              </h4>

              <p className="max-w-[560px] text-sm sm:text-lg xl:text-xl tracking-tight py-4 font-sf leading-7 sm:leading-8 xl:leading-9">
                We provide top-quality services at affordable prices. Our transparent
                pricing structure ensures you get the best value for your money
                without any hidden fees.
              </p>
            </div>

            {services.length > 0 ? (
              services.map((item) => {
                const categories = item.categories || [];
                const includeItems = categories.slice(0, 3).map((c) => c.category?.name).filter(Boolean);
                const allPrices = categories.flatMap((c) => (c.subCategories || []).map((s) => s?.price)).filter((p) => typeof p === "number");
                const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

                return (
                  <div
                    key={item.serviceId ?? item.service?.id}
                    className="bg-white rounded-[20px] py-5 px-3 sm:p-5 flex gap-3 sm:gap-5 justify-between"
                  >
                    <div className="space-y-1 sm:space-y-3 font-sf">
                      <h6 className="font-semibold font-sf text-lg sm:text-xl tracking-tight uppercase">
                        {item.service?.name || "Service"}
                      </h6>
                      <h6 className="font-black font-sf text-sm tracking-tight uppercase">
                        Includes
                      </h6>

                      {includeItems.length > 0 ? (
                        includeItems.map((name) => (
                          <div key={name} className="flex gap-2">
                            <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                            <p className="text-theme-psGray text-sm sm:text-base">{name}</p>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                            <p className="text-theme-psGray text-sm sm:text-base">Professional cleaning</p>
                          </div>
                          <div className="flex gap-2">
                            <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                            <p className="text-theme-psGray text-sm sm:text-base">Quality care</p>
                          </div>
                          <div className="flex gap-2">
                            <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                            <p className="text-theme-psGray text-sm sm:text-base">Convenient delivery</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="">
                      <div className="rounded-xl py-5 px-3 sm:p-5 text-white bg-theme-blue-2 w-[150px] sm:w-[223px]">
                        <p className="text-sm font-sf text-white">{item.service?.name || "Service"}</p>
                        {minPrice != null ? (
                          <>
                            <span className="text-[40px] font-black font-youth">${minPrice}</span>{" "}
                            <span className="text-xs font-sf text-white">from /item</span>
                          </>
                        ) : (
                          <span className="text-lg font-sf text-white">Ask for quote</span>
                        )}
                      </div>

                      <ClientBtn>
                        <p className="bg-black rounded-full flex justify-center items-center w-full h-[36px] sm:h-[55px] font-sf font-medium text-white text-sm sm:text-lg mt-2">
                          Start Cleaning
                        </p>
                      </ClientBtn>
                    </div>
                  </div>
                );
              })
            ) : (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[20px] py-5 px-3 sm:p-5 flex gap-3 sm:gap-5 justify-between"
                >
                  <div className="space-y-1 sm:space-y-3 font-sf">
                    <h6 className="font-semibold font-sf text-lg sm:text-xl tracking-tight uppercase">
                      Service
                    </h6>
                    <h6 className="font-black font-sf text-sm tracking-tight uppercase">Includes</h6>
                    <div className="flex gap-2">
                      <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                      <p className="text-theme-psGray text-sm sm:text-base">Professional cleaning</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                      <p className="text-theme-psGray text-sm sm:text-base">Quality care</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="size-6 rounded-md bg-theme-darkBlue shrink-0"></p>
                      <p className="text-theme-psGray text-sm sm:text-base">Convenient delivery</p>
                    </div>
                  </div>
                  <div className="">
                    <div className="rounded-xl py-5 px-3 sm:p-5 text-white bg-theme-blue-2 w-[150px] sm:w-[223px]">
                      <p className="text-sm font-sf text-white">Service</p>
                      <span className="text-lg font-sf text-white">Ask for quote</span>
                    </div>
                    <ClientBtn>
                      <p className="bg-black rounded-full flex justify-center items-center w-full h-[36px] sm:h-[55px] font-sf font-medium text-white text-sm sm:text-lg mt-2">
                        Start Cleaning
                      </p>
                    </ClientBtn>
                  </div>
                </div>
              ))
            )}
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
