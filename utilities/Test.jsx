"use client";

import { setPage } from "@/app/store/slices/cartItemSlice";
import { Spinner } from "@heroui/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const NO_OVERLAY_PATHS = ["/pricing", "/blog", "/contact-us", "/how-it-works"];

export default function HomeClientWrapper({ children }) {
  const page = useSelector((state) => state.cart.page);
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPage(false));
  }, [pathname, dispatch]);

  const showOverlay = page && !NO_OVERLAY_PATHS.some((p) => pathname?.startsWith(p));

  return (
    <div className="relative">
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-xl font-semibold">
            <Spinner
              classNames={{
                label:
                  "text-foreground mt-4 font-youth font-semibold text-theme-blue animate-pulse",
              }}
              size="lg"
              label="Loading..."
              variant="wave"
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
