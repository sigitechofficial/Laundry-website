"use client";

import { setPage } from "@/app/store/slices/cartItemSlice";
import { Spinner } from "@heroui/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HomeClientWrapper({ children }) {
  const page = useSelector((state) => state.cart.page);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  // const currentTab = searchParams.get("tab");

  useEffect(() => {
    // After render, reset the loader state
    dispatch(setPage(false));
  }, [pathname, searchParams.toString()]);

  return (
    <div className="relative">
      {page && (
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
