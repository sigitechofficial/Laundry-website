"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "./cx";

/**
 * Fades content up as it scrolls into view.
 *
 * Progressive enhancement: the server render and no-JS visitors always
 * see the content. Only elements that start below the fold are hidden,
 * after hydration, so there is no flash. Respects reduced motion.
 */
export default function Reveal({ as: Tag = "div", className, children, ...rest }) {
  const ref = useRef(null);
  const [state, setState] = useState("idle"); // idle | hidden | shown

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return undefined; // already on screen

    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cx(
        "[transition:opacity_0.7s_ease,transform_0.7s_ease] data-[reveal=hidden]:translate-y-[18px] data-[reveal=hidden]:opacity-0 motion-reduce:transition-none motion-reduce:data-[reveal=hidden]:transform-none motion-reduce:data-[reveal=hidden]:opacity-100",
        className
      )}
      data-reveal={state}
      {...rest}
    >
      {children}
    </Tag>
  );
}
