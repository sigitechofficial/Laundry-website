"use client";

import { useEffect, useState } from "react";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "../ds/cx";
import { BAR, BAR_GO, BAR_IN, BAR_TXT, BTN } from "./ui";

/**
 * Bottom "N services selected · Continue" bar, prototype markup (.svc-bar).
 * Same rule as the prototype (pages.js showBar/barBelow): visible only while
 * at least one service is selected AND the "Continue to checkout" button (or,
 * if that is not rendered, the FAQ section) is still below the screen.
 * Toggles `has-svc-bar` on the page root, like the prototype does on <body>.
 */
export default function ServiceBar({ count, targetId, fallbackId, rootId, isDisabled, onContinue, barId, label, goText = "Continue", innerClassName }) {
  const [below, setBelow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      const target = document.getElementById(targetId);
      const ref = target && target.offsetParent ? target : document.getElementById(fallbackId);
      setBelow(Boolean(ref) && ref.getBoundingClientRect().top > window.innerHeight - 24);
    };
    const on = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        measure();
      });
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [targetId, fallbackId, count]);

  const show = count > 0 && below;

  useEffect(() => {
    const root = rootId && document.getElementById(rootId);
    if (root) root.classList.toggle("has-svc-bar", show);
  }, [rootId, show]);

  return (
    <div className={cx(BAR, !(show) && "hidden")} id={barId} hidden={!show}>
      <div className={cx(BAR_IN, innerClassName)}>
        {label || (
          <span className={BAR_TXT}>
            <b>{count}</b>
            <span>{count === 1 ? "service selected" : "services selected"}</span>
          </span>
        )}
        <button type="button" className={cx(BTN, BAR_GO)} disabled={isDisabled} onClick={onContinue}>
          {goText}
          <ProtoIcon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}
