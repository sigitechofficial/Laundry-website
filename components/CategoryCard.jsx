import { removePreference } from "@/app/store/slices/cartItemSlice";
import React, { useState } from "react";
import { FaCheck, FaPlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { useDispatch } from "react-redux";

export default function CategoryCard({
  bg,
  h,
  p,
  Icon,
  src,
  right,
  onClick,
  type,
  serviceId,
}) {
  const [hovered, setHovered] = useState(false);
  const dispatch = useDispatch();
  return (
    <>
      <div
        onClick={onClick}
        className={`rounded-xl w-full h-[200px] sm:h-[264px] flex relative overflow-hidden cursor-pointer ${
          bg === "1"
            ? "bg-bgAvailable"
            : bg === "2"
            ? "bg-card-dark-orange"
            : bg === "3"
            ? "bg-card-green"
            : bg === "4"
            ? "bg-card-pink"
            : bg === "5"
            ? "bg-card-light-orange"
            : bg
        }`}
      >
        <div className="pl-5 pr-40 py-4 h-full">
          <div className="flex items-center gap-x-3">
            <div className="bg-white rounded-full shrink-0 size-10 flex justify-center items-center">
              <Icon size="25" />
            </div>

            <p className="font-youth font-bold text-2xl whitespace-nowrap">{h}</p>
          </div>

          <p className="font-sf text-sm sm:text-base pt-[22px] max-w-[342px] line-clamp-5">
            From delicate fabrics to everyday wear, our washing service ensures
            your clothes stay fresh and vibrant
          </p>

          {/* <div className="font-sf absolute bottom-4 left-5">
            <p className=" sm:text-xl text-black/60">Pricing per weight</p>
            <p className="font-medium">
              $17.880 <span className="text-black/60">/6kg</span>
            </p>
          </div> */}
        </div>

        <div className={`absolute top-0 ${right} h-full`}>
          <img className="h-full object-contain" src={src} alt="" />
        </div>

        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="absolute bottom-2 right-2 size-12 sm:size-16 rounded-full sh bg-theme-blue text-white flex justify-center items-center"
        >
          {type === "plus" ? (
            <FaPlus size={30} />
          ) : type === "check" ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (type === "check") {
                  dispatch(removePreference(serviceId));
                }
              }}
              className="relative flex justify-center items-center"
            >
              <IoClose
                className={`absolute transition-all duration-500 ${
                  hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
                size={40}
              />
              <FaCheck
                className={`absolute transition-all duration-500 ${
                  hovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
                }`}
                size={35}
              />
            </div>
          ) : (
            // hovered ? (
            //   <IoClose
            //     className={`absolute transition-all duration-500 ${
            //       hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
            //     }`}
            //     size={40}
            //   />
            // ) : (
            //   <FaCheck
            //     className={`absolute transition-all duration-500 ${
            //       hovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
            //     }`}
            //     size={40}
            //   />
            // )
            <MdNavigateNext size={40} />
          )}
        </div>
      </div>
    </>
  );
}
