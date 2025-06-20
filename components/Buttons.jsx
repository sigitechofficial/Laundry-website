
"use client"
import { Spinner } from "@heroui/react";
import React from "react";

export default function Buttons() {
  return <div>Buttons</div>;
}

export function DarkBlueButton({ width, text }) {
  return (
    <button
      className={`${
        width || "w-full"
      } bg-theme-darkBlue rounded-full flex justify-center items-center px-4 sm:px-8 h-12 sm:h-[60px] uppercase font-youth font-bold text-white text-sm sm:text-xl`}
    >
      {text}
    </button>
  );
}

export function ButtonYouth70018({
  width,
  text,
  className,
  onClick,
  isDisabled,
  isPending,
}) {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={
        className ||
        `${width || "w-full"} ${
          isDisabled ? "bg-theme-darkBlue/30" : "bg-theme-darkBlue"
        } relative rounded-full flex justify-center items-center font-bold px-4 sm:px-8 h-12 sm:h-[60px] font-youth text-white text-sm sm:text-lg`
      }
    >
    {isPending?  <div className="absolute  left-[calc(50%-70px)] flex items-center h-full">
        <Spinner classNames={{ label: "text-foreground" }} variant="simple" />
      </div>:""}
      {text}
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

export function ButtonContinueWith({
  width,
  bg,
  color,
  size,
  text,
  src,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`${
        width || "w-full"
      } ${bg} rounded-full flex gap-8 justify-center items-center border-black border uppercase px-4 sm:px-8 h-12 sm:h-[60px] font-youth font-bold ${color} text-sm sm:${size}`}
    >
      <img src={src} alt="" />
      {text}
    </button>
  );
}

export function PurpleButton({
  width,
  bg = "bg-[#0000991A]",
  color = "text-theme-blue",
  size,
  text,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-[56px] rounded-lg text-center font-sf font-semibold ${bg} ${color}`}
    >
      {text}
    </button>
  );
}
