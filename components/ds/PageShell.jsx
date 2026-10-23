"use client";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import HomeClientWrapper from "../../utilities/Test";
import { cx } from "./cx";
import { useIsClient } from "./useIsClient";

/**
 * Base type and colour for design-system pages. The focus ring and the reduced-motion
 * rule live in globals.css for the whole document, so popups drawn outside this
 * wrapper (components/ds/Dialog, HeroUI modals, toasts) get them too.
 */
export const PAGE_SCOPE =
  "overflow-x-clip bg-jdc-paper font-body text-jdc-lg leading-[1.6] text-jdc-text antialiased [text-rendering:optimizeLegibility] [&_img]:block [&_img]:max-w-full [&_video]:block [&_video]:max-w-full";

/**
 * Standard page frame on the design system: skip link, header, main,
 * footer, and the global navigation loading overlay.
 *
 * @param {"overlay"|"solid"} [header="overlay"] use "overlay" when the page
 *   starts with a dark hero (PageHero), "solid" otherwise.
 * @param {boolean} [clientOnly] the page content comes from this browser (saved cart,
 *   signed-in account in localStorage), which the server cannot see. Header and footer
 *   are still server-rendered; the content is drawn once the page runs in the browser
 *   (at once when arriving from another page of the site), so the server never renders
 *   an empty cart that the browser then has to replace (a hydration mismatch).
 */
export default function PageShell({ header = "overlay", children, mainClassName, clientOnly = false }) {
  const isClient = useIsClient();
  return (
    <HomeClientWrapper>
      <div className={PAGE_SCOPE}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:text-jdc-navy focus:shadow-jdc-lg"
        >
          Skip to content
        </a>
        <SiteHeader variant={header} />
        <main
          id="main"
          tabIndex={-1}
          // Inner pages fill at least the screen, so the footer stays at the bottom
          // while a step is loading instead of jumping up under the header.
          className={cx(header === "solid" && "min-h-[100svh] pt-jdc-header", mainClassName)}
        >
          {clientOnly && !isClient ? null : children}
        </main>
        <SiteFooter />
      </div>
    </HomeClientWrapper>
  );
}
