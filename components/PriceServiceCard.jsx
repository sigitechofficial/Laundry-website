import React from "react";
import { IoChevronForward } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { getServiceMeta } from "../utilities/serviceMeta";

export default function PriceServiceCard({
  name,
  description,
  onClick,
  isSelected = false,
  showChevron = true,
}) {
  const meta = getServiceMeta(name);
  const { Icon, iconBg, iconColor } = meta;
  const displayDescription =
    (typeof description === "string" && description.trim()) || meta.description;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-white rounded-xl shadow-theme-shadow-light cursor-pointer text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-blue ${
        isSelected
          ? "ring-2 ring-theme-blue shadow-[0px_2px_8px_0px_#00000029]"
          : "hover:shadow-[0px_2px_8px_0px_#00000029]"
      }`}
    >
      <div
        className={`shrink-0 size-12 sm:size-14 rounded-full flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`text-xl sm:text-2xl ${iconColor}`} aria-hidden />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-youth font-bold text-lg sm:text-xl text-black capitalize">
          {name}
        </p>
        <p className="font-sf text-sm sm:text-base text-theme-psGray mt-1 leading-snug">
          {displayDescription}
        </p>
      </div>

      {showChevron ? (
        <IoChevronForward
          className="shrink-0 text-xl sm:text-2xl text-theme-gray-2"
          aria-hidden
        />
      ) : isSelected ? (
        <span className="shrink-0 size-8 rounded-full bg-theme-blue text-white flex items-center justify-center">
          <FaCheck className="text-sm" aria-hidden />
        </span>
      ) : null}
    </button>
  );
}
