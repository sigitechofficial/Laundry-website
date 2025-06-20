import React from "react";
import { DarkBlueButton } from "../../../components/Buttons";
import Header from "../../../components/Header";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import Footer from "../../../components/Footer";

export default function page() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="partner" />
        </div>

        <div className="w-full flex items-center relative h-[600px] sm:h-[750px] 2xl:h-[875px] px-5 sm:px-[45px]">
          <div className="w-full grid grid-cols-2 gap-10 max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0">
            <div className="max-w-[583px]">
              <h2 className="font-youth font-bold text-[64px] leading-tight">
                Attract more customers without the stress
              </h2>
              <p className="font-sf text-2xl text-theme-psGray my-8">
                Become a trusted partner
              </p>

              <div className="w-max">
                <DarkBlueButton text="apply as a cleaning partner" />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden">
              <img
                className="hover:scale-105 duration-500"
                src="/images/partner/attract.png"
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="bg-theme-gray w-full">
          <div className="w-full max-w-[1290px] mx-auto">
            {/* 1 */}
            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Unlock Rapid Growth</p>
                <h4 className="font-youth font-bold text-2xl">
                  1. Grow with a Leader
                </h4>

                <p className="text-base text-theme-psGray">
                  We’re one of the biggest names in UK laundry and dry cleaning.
                  Join us and grow your business faster than ever.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden">
                <img
                  className="hover:scale-105 duration-500"
                  src="/images/partner/grow.png"
                  alt=""
                />
              </div>
            </div>
            {/* 2 */}
            <div className="flex justify-between items-center flex-row-reverse gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Hassle-Free</p>
                <h4 className="font-youth font-bold text-2xl">
                  2. Focus on Great Service
                </h4>

                <p className="text-base text-theme-psGray">
                  Our Partner Drivers handle all pickups and deliveries—so you
                  can concentrate on what you do best: delivering exceptional
                  laundry and dry cleaning. No worries about logistics or
                  customer support—we’ve got it covered.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden">
                <img
                  className="hover:scale-105 duration-500"
                  src="/images/partner/focus.png"
                  alt=""
                />
              </div>
            </div>
            {/* 3 */}
            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="font-sf space-y-3">
                <p className="text-base">Support</p>
                <h4 className="font-youth font-bold text-2xl">
                  3. We’re in this Together
                </h4>

                <p className="text-base text-theme-psGray">
                  Our dedicated Facility Support team is here to assist you at
                  every step—because your success is our success.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden">
                <img
                  className="hover:scale-105 duration-500"
                  src="/images/partner/together.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        {/* our cleaning partners */}

        <div className="bg-theme-skyBlue w-full py-[123px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <h4 className="font-youth font-bold text-[56px] text-center">
              Our cleaning patners
            </h4>

            <div className="w-full font-sf my-10 space-y-5 relative">
              <RiDoubleQuotesL className="text-4xl text-[#55ACEE]" />

              <p className="text-xl text-theme-psGray">
                Since partnering with Just Dry Cleaners, the team has
                consistently shown appreciation for our efforts. They go above
                and beyond to provide valuable feedback, helping us continuously
                improve. Working with Just Dry Cleaners has truly been a
                pleasure. I would describe the team as 'supportive,
                understanding, and professional'—10/10."
              </p>

              <RiDoubleQuotesR className="text-4xl text-[#55ACEE] ml-auto" />
              <p className="text-2xl text-black/80 text-center">
                Our local cleaning partner in London
              </p>
            </div>
          </div>
        </div>

        <div className="w-full py-[70px]">
          <div className="w-full max-w-[1290px] mx-auto">
            <h2 className="font-youth font-bold text-[56px] leading-tight text-center">
              No sign-up fee, no hidden costs, and full support from our team.
            </h2>

            <div className="flex justify-between items-center gap-10 [&>div]:max-w-[512px] py-[75px]">
              <div className="space-y-7">
                <div className="font-sf">
                  <div>
                    <img src="/images/partner/check.png" alt="" />

                    <h4 className="font-youth font-bold text-[28px] pt-2">
                      No hidden costs
                    </h4>
                    <p className="font-sf text-lg text-theme-psGray">
                      No sign-up fee. Just pure opportunity.
                    </p>
                  </div>
                </div>
                <div className="font-sf">
                  <div>
                    <img src="/images/partner/check.png" alt="" />

                    <h4 className="font-youth font-bold text-[28px] pt-2">
                      Support team
                    </h4>
                    <p className="font-sf text-lg text-theme-psGray">
                      Need help? Our Facility Support team is always available.
                    </p>
                  </div>
                </div>
                <div className="font-sf">
                  <div>
                    <img src="/images/partner/check.png" alt="" />

                    <h4 className="font-youth font-bold text-[28px] pt-2">
                      Do what you do best
                    </h4>
                    <p className="font-sf text-lg text-theme-psGray">
                      Provide top-quality dry cleaning.
                    </p>
                  </div>
                </div>
                <div className="font-sf">
                  <div>
                    <img src="/images/partner/check.png" alt="" />

                    <h4 className="font-youth font-bold text-[28px] pt-2">
                      We'll handle everything else.
                    </h4>
                    <p className="font-sf text-lg text-theme-psGray">
                      We will take care of all customer service, deliveries,
                      marketing, technology developments, sales and much more
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden max-h-[594px]">
                <img
                  className="hover:scale-105 duration-500 w-full h-full object-cover object-bottom"
                  src="/images/partner/no-sign.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-theme-blue mt-20">
          <div className="w-full max-w-[1290px] mx-auto">
            <div className="flex justify-between items-center relative">
              <div className="font-youth text-white py-16 max-w-[728px]">
                <h4 className="font-bold text-[44px] leading-tight pb-9">
                  Apply as a Cleaning Partner—no sign-up fees or hidden costs.
                </h4>

                <div className="w-max">
                  <DarkBlueButton text="Apply as a cleaning partner" />
                </div>
              </div>

              <div className="absolute bottom-0 right-0">
                <img src="/images/howItWorks/chair.png" alt="" />
              </div>
            </div>
          </div>
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </>
  );
}
