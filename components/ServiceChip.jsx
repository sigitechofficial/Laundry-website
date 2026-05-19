import React from "react";

export default function ServiceChip({ label, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 font-youth font-bold text-[11px] sm:text-xs uppercase tracking-wide whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-blue ${
        isSelected
          ? "bg-theme-blue-2 text-white"
          : "bg-theme-gray text-theme-psGray hover:text-black"
      }`}
    >
      {label}
    </button>
  );
}
