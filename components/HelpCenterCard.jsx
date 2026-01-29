import React from "react";
import { SlQuestion } from "react-icons/sl";

export default function HelpCenterCard({ heading, description, articleCount = "10 articles" }) {
  return (
    <div className="w-full bg-white/90 rounded-xl px-4 sm:px-6 py-6 sm:py-8 shadow-theme-shadow-light cursor-pointer hover:bg-white transition-colors">
      <div className="flex items-center gap-x-3 sm:gap-x-4">
        <SlQuestion size={32} className="sm:w-10 sm:h-10 text-theme-blue shrink-0" />

        <div className="font-sf text-black space-y-1.5 sm:space-y-2">
          <h6 className="text-lg sm:text-xl font-semibold">{heading}</h6>
          <p className="text-base sm:text-xl text-theme-psGray">{description}</p>
          <p className="text-sm sm:text-base text-theme-psGray">{articleCount}</p>
        </div>
      </div>
    </div>
  );
}
