import React from "react";

// Animated ☰ that folds into an ✕ while its hidden checkbox is checked.
const LINE =
  "fill-none stroke-[#000099] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3] [transition:stroke-dasharray_600ms_cubic-bezier(0.4,0,0.2,1),stroke-dashoffset_600ms_cubic-bezier(0.4,0,0.2,1)]";

const CustomMenuBtn = ({ onClick }) => {
  return (
    <label onClick={onClick} className="group cursor-pointer">
      <input type="checkbox" className="hidden" />
      <svg
        viewBox="0 0 32 32"
        className="h-[3em] [transition:transform_600ms_cubic-bezier(0.4,0,0.2,1)] group-has-[:checked]:-rotate-45"
      >
        <path
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          className={`${LINE} [stroke-dasharray:12_63] group-has-[:checked]:[stroke-dasharray:20_300] group-has-[:checked]:[stroke-dashoffset:-32.42]`}
        ></path>
        <path d="M7 16 27 16" className={LINE}></path>
      </svg>
    </label>
  );
};

export default CustomMenuBtn;
