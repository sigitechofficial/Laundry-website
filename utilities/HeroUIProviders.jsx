"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";

/*
 * HeroUI context + toasts. Rendered on the server like the rest of the page: it used to
 * return nothing until the browser had mounted it (and was loaded with ssr: false), so
 * every page arrived blank and was drawn only after the JavaScript ran.
 * toastOffset clears the fixed header (88px desktop, 70px phones); the toast area sits
 * above popups (z-jdc-toast), so a message about a popup is not hidden behind it.
 */
export default function HeroUIProviders({ children }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={96} regionProps={{ classNames: { base: "z-jdc-toast" } }} />
      {children}
    </HeroUIProvider>
  );
}