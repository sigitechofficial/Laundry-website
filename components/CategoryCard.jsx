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
  turnaroundDays = 0,
  Icon,
  src,
  right,
  onClick,
  type,
  serviceId,
}) {
  const days = Number(turnaroundDays);
  const showTurnaround = Number.isFinite(days) && days > 0;
  const [hovered, setHovered] = useState(false);
  const dispatch = useDispatch();
  return (
    <>
      <div
        onClick={onClick}
        className={`rounded-xl w-full h-[160px] sm:h-[264px] flex relative overflow-hidden cursor-pointer ${bg === "1"
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
        {/* Text — left column */}
        <div className="flex-1 min-w-0 pl-3 sm:pl-5 pr-3 py-4 h-full">
          <div className="flex items-center gap-x-3">
            <div className="bg-white rounded-full shrink-0 size-8 sm:size-10 flex justify-center items-center">
              <Icon className="text-xl sm:text-2xl" />
            </div>

            <p className="font-youth font-bold sm:text-2xl whitespace-nowrap">{h}</p>
          </div>

          {showTurnaround && (
            <p className="font-sf text-xs sm:text-sm font-semibold text-theme-darkBlue pt-2 sm:pt-3">
              Turnaround: {days} day{days !== 1 ? "s" : ""}
            </p>
          )}

          {p ? (
            <p
              className={`font-sf text-sm sm:text-base text-theme-psGray line-clamp-3 sm:line-clamp-4 ${
                showTurnaround ? "pt-1.5 sm:pt-2" : "pt-2 sm:pt-[22px]"
              }`}
            >
              {p}
            </p>
          ) : null}
        </div>

        {/* Image — right column, fixed width */}
        <div className="w-[50%] flex-shrink-0 h-full flex items-end justify-end">
          <img
            className="max-h-full max-w-full object-contain object-right-bottom"
            src={src}
            alt={h ? String(h) : ""}
          />
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
                className={`absolute transition-all duration-500 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                size={40}
              />
              <FaCheck
                className={`absolute transition-all duration-500 ${hovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
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
