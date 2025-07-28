"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { useEffect, useState } from "react";

export default function HeroUIProviders({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={60} />
      {children}
    </HeroUIProvider>
  );
}
