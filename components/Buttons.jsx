"use client";
import React, { useRef, useState } from "react";

/*
 * Legacy button API, restyled to the Just Dry Cleans design system
 * (components/ds, src/design-system/tokens.css). Props are unchanged so
 * every existing page keeps working. Previous version:
 * see git history (before the 2026 redesign)
 */

const base =
  "relative inline-flex justify-center items-center gap-2.5 text-center whitespace-nowrap rounded-full font-body font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-jdc-blue";
const primary = "bg-jdc-blue text-white hover:bg-jdc-blue-dark";
const disabledCls = "opacity-50 cursor-not-allowed pointer-events-none";

// Small spinner shown inside a busy button (uses the text colour)
const Spinner = () => (
  <span className="inline-block size-[18px] flex-none animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
);

/*
 * While an async onClick (login, sign up, verify, ...) is running the button shows a
 * spinner, greys out and ignores more taps, so nothing is sent twice. Pages can also
 * pass isPending themselves.
 */
function useBusyClick(onClick) {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const handle = (e) => {
    if (busyRef.current || typeof onClick !== "function") return;
    const r = onClick(e);
    if (r && typeof r.then === "function") {
      busyRef.current = true;
      setBusy(true);
      Promise.resolve(r)
        .catch(() => {})
        .finally(() => {
          busyRef.current = false;
          setBusy(false);
        });
    }
  };
  return [busy, handle];
}

// Legacy labels were written in lower case for an all-caps style ("continue").
// Sentence case reads better in the new design.
const label = (text) =>
  typeof text === "string" && text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

export default function Buttons() {
  return <div>Buttons</div>;
}

export function DarkBlueButton({ width, text }) {
  return (
    <button className={`${width || "w-full"} ${base} ${primary} h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base`}>
      {label(text)}
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
  variant = "primary",
  size = "default",
}) {
  const variantClasses =
    variant === "outline"
      ? "bg-white text-jdc-navy border-[1.5px] border-jdc-navy hover:bg-jdc-navy hover:text-white"
      : primary;
  const sizeClasses = size === "compact" ? "h-12 min-h-12 px-5 text-sm" : "h-14 px-6 sm:px-8 text-base";
  const [busy, handleClick] = useBusyClick(onClick);
  const loading = Boolean(isPending || busy);

  return (
    <button
      type="button"
      disabled={isDisabled || loading}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={[width || "w-full", base, variantClasses, sizeClasses, isDisabled || loading ? disabledCls : "", className || ""]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? <Spinner /> : null}
      {label(text)}
    </button>
  );
}

export function BlackButton({ width }) {
  return (
    <button className={`${width || "w-full"} ${base} bg-jdc-navy text-white hover:bg-jdc-navy-deep h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base`}>
      Start Cleaning
    </button>
  );
}

/**
 * Social / secondary button. When a filled `bg` is passed (e.g. the
 * partner form's "Continue"), it renders as the primary button.
 */
export function ButtonContinueWith({ width, bg, color, text, shortText, src, onClick, disabled, className }) {
  const [busy, handleClick] = useBusyClick(onClick);
  const filled = typeof bg === "string" && /jdc-blue|theme-blue|theme-darkBlue/.test(bg);
  const look = filled
    ? primary
    : `bg-white ${color || "text-jdc-navy"} border-[1.5px] border-jdc-line hover:border-jdc-line-strong hover:bg-jdc-paper`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      aria-label={shortText ? text : undefined}
      className={`${width || "w-full"} ${base} ${look} h-14 px-6 text-[15px] ${disabled || busy ? disabledCls : ""} ${className || ""}`}
    >
      {busy ? <Spinner /> : src ? <img src={src} alt="" className="h-5 w-5 object-contain" /> : null}
      {shortText ? (
        // Short label (e.g. "Google") where buttons sit side by side on wide screens
        <>
          <span className="min-[1081px]:hidden">{label(text)}</span>
          <span className="hidden min-[1081px]:inline">{label(shortText)}</span>
        </>
      ) : (
        label(text)
      )}
    </button>
  );
}

export function PurpleButton({ bg, color, text, onClick }) {
  const filled = typeof bg === "string" && /theme-blue|jdc-blue/.test(bg);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full h-14 ${base} !rounded-[14px] ${
        filled ? primary : `bg-jdc-blue-tint ${color || "text-jdc-blue"} hover:bg-[#dcebff]`
      }`}
    >
      {label(text)}
    </button>
  );
}
