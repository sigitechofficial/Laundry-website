"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";

export function HeroUIProviders({ children }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={60} />
      {children}
    </HeroUIProvider>
  );
}
