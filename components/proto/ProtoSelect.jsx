"use client";

import { useEffect, useRef, useState } from "react";
import ProtoIcon from "./ProtoIcon";
import { cx } from "../ds/cx";
import { CTRL, CTRL_CHEV, CTRL_ICON, CTRL_INPUT, CTRL_SELECT } from "../booking/ui";

/*
 * Custom dropdown used for the Handover fields on the booking form: a hidden
 * native <select> (for forms and screen readers), the chosen value drawn over
 * it, and a list of options with an icon each.
 *
 * options: [{ key, label, icon? }]
 */

// Option list under the field (.csel__menu / .csel__opt)
const MENU =
  "absolute left-0 right-0 top-[calc(100%+8px)] z-[60] thin-scroll max-h-[280px] overflow-auto rounded-[14px] border border-jdc-line bg-white p-1.5 [-webkit-overflow-scrolling:touch] [box-shadow:0_20px_44px_rgba(27,34,48,0.18)]";
const OPT =
  "flex w-full cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-none px-3.5 py-[13px] text-left text-[15.5px] text-jdc-navy transition-[background] duration-[120ms] hover:bg-jdc-paper";

export function handoverIcon(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("in person")) return "person";
  if (t.includes("reception") || t.includes("porter")) return "bell";
  if (t.includes("door")) return "atDoor";
  if (t.includes("safe")) return "safe";
  if (t.includes("outside")) return "home";
  return "door";
}

export default function ProtoSelect({ id, name, value, options, onChange, disabled = false, fieldIcon = "door" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const current = options.find((o) => o.key === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", outside, true);
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    return () => {
      document.removeEventListener("click", outside, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={cx(CTRL, "cursor-pointer", disabled && "cursor-not-allowed opacity-60")}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-haspopup="listbox"
      aria-expanded={open ? "true" : "false"}
      aria-disabled={disabled ? "true" : undefined}
      onClick={(e) => {
        if (disabled || e.target.closest('[role="listbox"]')) return;
        setOpen((o) => !o);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
        }
      }}
    >
      <span className={CTRL_ICON}>
        <ProtoIcon name={current?.icon || handoverIcon(current?.label) || fieldIcon} size={18} />
      </span>
      <select
        className={cx(CTRL_INPUT, CTRL_SELECT, "pointer-events-none !text-transparent [-webkit-text-fill-color:transparent] [&_option]:text-jdc-text [&_option]:[-webkit-text-fill-color:currentColor]")}
        id={id}
        name={name}
        tabIndex={-1}
        disabled={disabled}
        value={current?.key || ""}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <span className={cx(CTRL_CHEV, open && "[transform:translateY(-50%)_rotate(180deg)]")} aria-hidden="true">
        <ProtoIcon name="chevDown" size={14} />
      </span>
      <span className="pointer-events-none absolute left-[46px] right-[38px] top-1/2 -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-semibold text-jdc-navy">{current?.label || ""}</span>
      <div className={cx(MENU, !(open) && "hidden")} role="listbox" hidden={!open} ref={menuRef}>
        {options.map((o) => {
          const sel = o.key === current?.key;
          return (
            <button
              key={o.key}
              type="button"
              role="option"
              aria-selected={sel ? "true" : "false"}
              className={cx(OPT, sel && "bg-jdc-blue-tint font-bold text-jdc-blue hover:bg-jdc-blue-tint")}
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(o.key);
                setOpen(false);
              }}
            >
              <span className={cx("flex flex-none text-[#6B7385]", sel && "text-jdc-blue")}>
                <ProtoIcon name={o.icon || handoverIcon(o.label)} size={18} />
              </span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
