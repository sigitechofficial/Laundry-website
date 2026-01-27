import React from "react";
import { DarkBlueButton } from "../../../components/Buttons";
import Header from "../../../components/Header";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import Footer from "../../../components/Footer";
import Link from "next/link";

export default function BecomePartnerPage() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="partner" />
        </div>

        {/* Hero Section */}
        <div className="w-full flex items-center relative h-[600px] sm:h-[750px] 2xl:h-[848px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
              <div className="flex flex-col gap-6 items-start max-w-[583px]">
                <h1 className="font-youth font-bold text-[48px] sm:text-[56px] md:text-[64px] leading-tight text-black">
                  Attract more customers without the stress
                </h1>
                <p className="font-sf text-[20px] sm:text-[22px] md:text-[24px] text-black">
                  Become a trusted partner
                </p>
                <div className="w-max">
                  <Link href="/become-partner/registration">
                    <DarkBlueButton text="apply as a cleaning partner" />
                  </Link>
                </div>
              </div>

              <div className="h-[300px] sm:h-[350px] md:h-[383px] relative rounded-xl overflow-hidden w-full max-w-[551px]">
                <img
                  className="w-full h-full object-cover hover:scale-105 duration-500 transition-transform"
                  src="/images/partner/attract.png"
                  alt="Partner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="bg-theme-gray w-full">
          <div className="w-full max-w-[1290px] mx-auto">
            {/* Feature 1: Grow with a Leader */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 py-[76px] px-5 sm:px-[45px]">
              <div className="flex flex-col gap-4 items-start justify-center max-w-[512px]">
                <p className="font-sf text-base text-black">Unlock Rapid Growth</p>
                <h2 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                  1. Grow with a Leader
                </h2>
                <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                  We're one of the biggest names in UK laundry and dry cleaning. Join us and grow your business faster than ever.
                </p>
              </div>

              <div className="h-[250px] sm:h-[300px] md:h-[342px] relative rounded-xl overflow-hidden w-full max-w-[512px]">
                <img
                  className="w-full h-full object-cover hover:scale-105 duration-500 transition-transform"
                  src="/images/partner/grow.png"
                  alt="Grow with a leader"
                />
              </div>
            </div>

            {/* Feature 2: Focus on Great Service */}
            <div className="flex flex-col lg:flex-row-reverse justify-between items-center gap-10 py-[76px] px-5 sm:px-[45px]">
              <div className="flex flex-col gap-4 items-start justify-center max-w-[512px]">
                <p className="font-sf text-base text-black">Hassle-Free</p>
                <h2 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                  1. Focus on Great Service
                </h2>
                <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                  Our Partner Drivers handle all pickups and deliveries—so you can concentrate on what you do best: delivering exceptional laundry and dry cleaning. No worries about logistics or customer support—we've got it covered.
                </p>
              </div>

              <div className="h-[250px] sm:h-[300px] md:h-[342px] relative rounded-xl overflow-hidden w-full max-w-[512px]">
                <img
                  className="w-full h-full object-cover hover:scale-105 duration-500 transition-transform"
                  src="/images/partner/focus.png"
                  alt="Focus on great service"
                />
              </div>
            </div>

            {/* Feature 3: We're in this Together */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 py-[76px] px-5 sm:px-[45px]">
              <div className="flex flex-col gap-4 items-start justify-center max-w-[512px]">
                <p className="font-sf text-base text-black">Support</p>
                <h2 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                  1. We're in this Together
                </h2>
                <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                  Our dedicated Facility Support team is here to assist you at every step—because your success is our success.
                </p>
              </div>

              <div className="h-[250px] sm:h-[300px] md:h-[342px] relative rounded-xl overflow-hidden w-full max-w-[512px]">
                <img
                  className="w-full h-full object-cover hover:scale-105 duration-500 transition-transform"
                  src="/images/partner/together.png"
                  alt="We're in this together"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="bg-theme-skyBlue w-full py-[100px] sm:py-[123px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <h2 className="font-youth font-bold text-[48px] sm:text-[52px] md:text-[56px] text-center mb-10">
              Our cleaning patners
            </h2>

            <div className="w-full font-sf space-y-5 relative max-w-[900px] mx-auto">
              <div className="flex items-start gap-4">
                <RiDoubleQuotesL className="text-[#55ACEE] text-[50px] sm:text-[60px] md:text-[70px] shrink-0" />
                <p className="font-sf text-[18px] sm:text-[20px] md:text-[22px] text-[rgba(0,0,0,0.8)] leading-relaxed">
                  Since partnering with Just Dry Cleaners, the team has consistently shown appreciation for our efforts. They go above and beyond to provide valuable feedback, helping us continuously improve. Working with Just Dry Cleaners has truly been a pleasure. I would describe the team as 'supportive, understanding, and professional'—10/10.
                </p>
                <RiDoubleQuotesR className="text-[#55ACEE] text-[50px] sm:text-[60px] md:text-[70px] shrink-0" />
              </div>
              <p className="font-sf text-[20px] sm:text-[22px] md:text-[24px] text-black/80 text-center">
                Our local cleaning partner in London
              </p>
            </div>
          </div>
        </div>

        {/* No Sign-up Fee Section */}
        <div className="w-full py-[70px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <h2 className="font-youth font-bold text-[48px] sm:text-[52px] md:text-[56px] leading-tight text-center mb-[75px]">
              No sign-up fee, no hidden costs, and full support from our team.
            </h2>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-[164px]">
              <div className="flex flex-col gap-10 items-start max-w-[554px] w-full">
                {/* Benefit 1 */}
                <div className="flex flex-col gap-[10px] items-start w-full">
                  <div className="flex flex-col gap-4 items-start w-full">
                    <div className="size-8 shrink-0">
                      <img src="/images/partner/check.png" alt="Check" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                      No hidden costs
                    </h3>
                  </div>
                  <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                    No sign-up fee. Just pure opportunity.
                  </p>
                </div>

                {/* Benefit 2 */}
                <div className="flex flex-col gap-[10px] items-start w-full">
                  <div className="flex flex-col gap-4 items-start w-full">
                    <div className="size-8 shrink-0">
                      <img src="/images/partner/check.png" alt="Check" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                      Support team
                    </h3>
                  </div>
                  <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                    Need help? Our Facility Support team is always available.
                  </p>
                </div>

                {/* Benefit 3 */}
                <div className="flex flex-col gap-[10px] items-start w-full">
                  <div className="flex flex-col gap-4 items-start w-full">
                    <div className="size-8 shrink-0">
                      <img src="/images/partner/check.png" alt="Check" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                      Do what you do best
                    </h3>
                  </div>
                  <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                    Provide top-quality dry cleaning.
                  </p>
                </div>

                {/* Benefit 4 */}
                <div className="flex flex-col gap-[10px] items-start w-full">
                  <div className="flex flex-col gap-4 items-start w-full">
                    <div className="size-8 shrink-0">
                      <img src="/images/partner/check.png" alt="Check" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-youth font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
                      We'll handle everything else.
                    </h3>
                  </div>
                  <p className="font-sf text-[16px] sm:text-[17px] md:text-[18px] text-[rgba(0,0,0,0.8)]">
                    We will take care of all customer service, deliveries, marketing, technology developments, sales and much more
                  </p>
                </div>
              </div>

              <div className="h-[400px] sm:h-[500px] md:h-[594px] relative rounded-xl overflow-hidden w-full max-w-[572px]">
                <img
                  className="w-full h-full object-cover hover:scale-105 duration-500 transition-transform"
                  src="/images/partner/no-sign.png"
                  alt="No sign-up fee"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="w-full bg-theme-blue mt-20 px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-center relative py-16 min-h-[331px]">
              <div className="font-youth text-white max-w-[728px] mb-8 lg:mb-0">
                <h3 className="font-bold text-[36px] sm:text-[40px] md:text-[44px] leading-tight mb-9">
                  Apply as a Cleaning Partner—no sign-up fees or hidden costs.
                </h3>
                <div className="w-max">
                  <Link href="/become-partner/registration">
                    <DarkBlueButton text="Apply as a cleaning partner" />
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 hidden lg:block">
                <img src="/images/howItWorks/chair.png" alt="Chair" className="max-h-[473px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </>
  );
}
