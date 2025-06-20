import React from "react";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

export default function page() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="blog" />
        </div>
        <div className="max-w-[1290px] py-20 mx-auto">
          <div className="rounded-2xl overflow-hidden w-full h-[529px]">
            <img
              className="w-full h-full object-cover hover:scale-105 duration-500"
              src="/images/blog/blog.jpg"
              alt=""
            />
          </div>
        </div>
      </div>

      {/*footer section  */}
      <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
    </>
  );
}
