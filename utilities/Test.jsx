"use client";

import { setPage } from "@/app/store/slices/cartItemSlice";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HomeClientWrapper({ children }) {
  const page = useSelector((state) => state.cart.page);
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPage(false));
  }, [pathname, dispatch]);

  // The overlay is switched off by the page change above. If it is switched on for a
  // move to the page we are already on (e.g. a second "Verify" finishing after the first
  // one navigated), the path never changes and it spun until a manual refresh.
  // Safety net: never keep it longer than 8 seconds.
  useEffect(() => {
    if (!page) return undefined;
    const t = setTimeout(() => dispatch(setPage(false)), 8000);
    return () => clearTimeout(t);
  }, [page, dispatch]);

  // While moving to another page: a thin blue progress line along the top instead of
  // the old white full-screen "Loading..." cover, so the current page stays visible
  // and the next one replaces it without a flash.
  return (
    <div className="relative">
      {page ? (
        <div
          role="progressbar"
          aria-label="Loading page"
          className="pointer-events-none fixed inset-x-0 top-0 z-jdc-progress h-[3px] overflow-hidden"
        >
          <div className="h-full origin-left animate-jdc-progress bg-jdc-blue" />
        </div>
      ) : null}
      {children}
    </div>
  );
}
