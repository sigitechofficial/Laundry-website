"use client";

import { IoChevronForward } from "react-icons/io5";

export default function DrawerItem(props) {
  const { Icon } = props;
  return (
    <button
      onClick={props.onClick}
      className="w-full flex items-center justify-between px-0 py-5 border-b border-b-[#e4e4e5]"
    >
      <div className="flex items-center gap-x-5">
        <Icon size={24} className="text-theme-black-2" />
        <span className="font-medium text-base text-theme-black-2">
          {props.text}
        </span>
      </div>
      <IoChevronForward size={20} className="text-theme-black-2" />
    </button>
  );
}
