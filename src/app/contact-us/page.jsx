import React from "react";
import Header from "../../../components/Header";
import { MdLocalPhone } from "react-icons/md";
import { ButtonYouth70018 } from "../../../components/Buttons";
import InputHeroUi from "../../../components/InputHeroUi";
import Footer from "../../../components/Footer";
import HomeClientWrapper from "../../../utilities/Test";

export default function ContactUs() {
  return (
    <>
     <HomeClientWrapper>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header />
        </div>

        <div className="w-full h-[433px] bg-theme-blue flex justify-center items-center text-white">
          <h4 className="font-youth font-bold text-7xl md:text-[96px]">
            Contact us
          </h4>
        </div>

        <div className="w-full bg-theme-gray px-[16px] sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-10 font-sf">
            <div className="bg-white p-6 space-y-2 rounded-[20px] relative -top-20 ">
              <div className="size-[60px] bg-theme-gray rounded-[20px] flex justify-center items-center">
                <MdLocalPhone size={35} />
              </div>
              <h6 className="font-semibold text-2xl">Our Address</h6>
              <p className="text-xl text-theme-psGray">Email</p>
              <p className="text-xl font-semibold break-words">
                abc123@gmail.com
              </p>
              <p className="text-xl text-theme-psGray">Phone</p>
              <p className="text-xl font-semibold">+92-3443543543</p>
            </div>
            <div className="bg-white p-6 space-y-2 rounded-[20px] relative -top-20">
              <div className="size-[60px] bg-theme-gray rounded-[20px] flex justify-center items-center">
                <MdLocalPhone size={35} />
              </div>
              <h6 className="font-semibold text-2xl">Our Address</h6>
              <p className="text-xl text-theme-psGray">Email</p>
              <p className="text-xl font-semibold break-words">
                abc123@gmail.com
              </p>
              <p className="text-xl text-theme-psGray">Phone</p>
              <p className="text-xl font-semibold">+92-3443543543</p>
            </div>
            <div className="bg-white p-6 space-y-2 rounded-[20px] relative -top-20 sm:col-span-2 lg:col-span-1">
              <div className="size-[60px] bg-theme-gray rounded-[20px] flex justify-center items-center">
                <MdLocalPhone size={35} />
              </div>
              <h6 className="font-semibold text-2xl">Our Address</h6>
              <p className="text-xl text-theme-psGray">Email</p>
              <p className="text-xl font-semibold break-words">
                abc123@gmail.com
              </p>
              <p className="text-xl text-theme-psGray">Phone</p>
              <p className="text-xl font-semibold">+92-3443543543</p>
            </div>
          </div>
        </div>

        <div className="w-full h-[1080px] relative flex justify-center items-center">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover absolute top-0 left-0 z-[-2]"
            src="/images/landingPage/heroSectionVideo.mp4"
          ></video>

          <div className="w-[630px] rounded-[30px] p-6 bg-white mx-[45px]">
            <h4 className="font-sf text-3xl sm:text-[40px] font-black sm:font-semibold text-center leading-10 pb-1">
              SEND US A MESSAGE
            </h4>

            <div className="space-y-4 py-4">
              <InputHeroUi type="text" label="Name" />
              <InputHeroUi type="number" label="Phone Number" />
              <InputHeroUi type="email" label="Email" />
              <textarea
                className="w-full h-40 bg-inputBg rounded-lg p-4 text-base text-theme-gray-2 resize-none outline-none"
                type="text"
                name=""
                placeholder="Enter message here"
                id=""
              />
            </div>
            <div className="">
              <ButtonYouth70018 text="login" />
            </div>
          </div>
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
      </HomeClientWrapper>
    </>
  );
}
