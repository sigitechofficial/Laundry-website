"use client";

import { IoChevronForward } from "react-icons/io5";

/*
 * Account menu row, restyled to the design system (tinted icon tile,
 * subtle hover). Props unchanged, plus optional tone="danger".
 * Previous version: see git history (before the 2026 redesign)
 */
export default function DrawerItem({ Icon, text, onClick, tone }) {
  const danger = tone === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left font-body text-[15px] font-semibold transition-colors ${
        danger ? "text-jdc-danger hover:bg-[#FDECEA]" : "text-jdc-navy hover:bg-jdc-mist"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-[11px] ${
          danger ? "bg-[#FDECEA] text-jdc-danger" : "bg-[#F1F3F7] text-[#6B7385]"
        }`}
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">{text}</span>
      {danger ? null : (
        <IoChevronForward size={16} className="shrink-0 text-[#C7CEDA] transition-colors group-hover:text-[#6B7385]" aria-hidden="true" />
      )}
    </button>
  );
}
