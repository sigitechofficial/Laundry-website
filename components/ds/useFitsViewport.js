"use client";

import { useEffect, useState } from "react";

/**
 * `[ref, fits]`: `fits` is true while the element (plus `offset` px above it)
 * fits in the window height. Pass `ref` as the element's ref (a callback ref, so
 * it also works for elements that only render after data loads).
 *
 * Used to keep side columns sticky only when they fit: a sticky column taller than
 * the screen can never be scrolled to its end, and drag-selecting in it makes the
 * page jump as the browser auto-scrolls under a column that does not move.
 */
export function useFitsViewport(offset = 0) {
  const [el, setEl] = useState(null);
  const [fits, setFits] = useState(true);

  useEffect(() => {
    if (!el) return undefined;
    const check = () => setFits(el.offsetHeight + offset <= window.innerHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [el, offset]);

  return [setEl, fits];
}
