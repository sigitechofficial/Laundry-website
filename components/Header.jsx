"use client";
import { useEffect, useState } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import CustomMenuBtn from "./CustomMenuBtn";

const Header = (props) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`xl:hidden fixed w-full h-[70px] 2xl:h-[80px] shadow-md duration-500  ${
          isScrolled ? "top-0 " : "top-[-100px] "
        } left-0 bg-white`}
      ></div>
      <div className="w-full h-[70px] 2xl:h-[80px] flex justify-center items-center px-5 md:px-[45px] relative">
        <div className="w-full max-w-[1290px] flex justify-center xl:justify-between items-center">
          <div className="flex items-center justify-center gap-14">
            <div className="flex items-center gap-2 max-sm:justify-center">
              <div className="size-9 overflow-hidden">
                <img
                  className="w-full h-full object-contain"
                  src="/images/logo.png"
                  alt=""
                />
              </div>

              <h4 className="font-youth font-bold text-base text-theme-blue">
                Just dry cleaners
              </h4>
            </div>

            <div className="max-xl:hidden">
              <ul className="flex items-center gap-10 font-sf text-xl">
                <li>Home</li>
                <li>Pricing</li>
                <li>How it works</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="max-xl:hidden">
            <button className="w-48 2xl:w-52 h-[50px] 2xl:h-[60px] rounded-full font-youth font-bold text-xl flex justify-center items-center border-black border-[2px]">
              Join Us
            </button>
          </div>
        </div>

        <div className="absolute top-3 left-4 sm:left-12 xl:hidden">
          {/* <HiOutlineMenuAlt2 size={30} /> */}
          <CustomMenuBtn />
        </div>
      </div>
    </>
  );
};

export default Header;
