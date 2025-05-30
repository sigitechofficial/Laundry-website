import React from "react";

export default function Buttons() {
  return <div>Buttons</div>;
}

export function DarkBlueButton({ width }) {
  return (
    <button
      className={`${
        width || "w-full"
      } bg-theme-darkBlue rounded-full flex justify-center items-center px-4 sm:px-8 h-12 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl`}
    >
      Book Now
    </button>
  );
}

export function BlueButtonLowerCase({ width }) {
  return (
    <button
      className={`${
        width || "w-full"
      } bg-theme-darkBlue rounded-full flex justify-center items-center px-4 sm:px-8 h-12 sm:h-[60px] uppercase font-sf text-white text-sm sm:text-lg`}
    >
      Book Now
    </button>
  );
}

export function BlackButton({ width }) {
  return (
    <button
      className={`${
        width || "w-full"
      } bg-black rounded-full flex justify-center items-center px-4 sm:px-8 h-12 sm:h-[60px] font-sf font-medium text-white text-sm sm:text-lg`}
    >
      Start Cleaning
    </button>
  );
}
