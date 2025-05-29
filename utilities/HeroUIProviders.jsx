"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";

export function HeroUIProviders({ children }) {
  return (
    <HeroUIProvider>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
