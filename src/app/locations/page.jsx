import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function page() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header />
        </div>
        <div className="w-full px-5 sm:px-[45px] h-[900px]">
          <h4 className="w-full text-center font-youth font-bold text-[64px] pt-48 pb-20">
            Locations
          </h4>

          <div className="max-w-[1290px] mx-auto">
            <h4 className="font-youth font-bold text-[40px] pb-3">General</h4>
            <div className="flex justify-between w-full max-w-[1290px] mx-auto">
              <div className="[&>p]:text-theme-blue text-2xl font-medium">
                <p>Bedfordshire</p>
              </div>
              <div className="[&>p]:text-theme-blue text-2xl font-medium space-y-3">
                <p>Aley Green</p>
                <p>Aley Green</p>
                <p>Aley Green</p>
              </div>
              <div className="[&>p]:text-theme-blue text-2xl font-medium space-y-3">
                <p>Aley Green</p>
                <p>Aley Green</p>
                <p>Aley Green</p>
              </div>
              <div className="[&>p]:text-theme-blue text-2xl font-medium space-y-3">
                <p>Aley Green</p>
                <p>Aley Green</p>
                <p>Aley Green</p>
              </div>
            </div>
          </div>
        </div>

        <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </>
  );
}
