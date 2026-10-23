"use client";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import HomeClientWrapper from "../../utilities/Test";
import { cx } from "./cx";

/**
 * Base type, colour and focus styles for design-system pages (was the `.jdc`
 * class in tokens.css). Descendant rules keep the old specificity.
 */
export const PAGE_SCOPE = [
  "overflow-x-clip bg-jdc-paper font-body text-jdc-lg leading-[1.6] text-jdc-text antialiased [text-rendering:optimizeLegibility]",
  // Keyboard focus ring for links/buttons. Text fields are left out: they already turn their
  // own border blue on focus, and a second ring around them looked like a double border.
  "[&_:focus-visible:not(input):not(textarea):not(select)]:rounded-md [&_:focus-visible:not(input):not(textarea):not(select)]:outline [&_:focus-visible:not(input):not(textarea):not(select)]:outline-[3px] [&_:focus-visible:not(input):not(textarea):not(select)]:outline-offset-[3px] [&_:focus-visible:not(input):not(textarea):not(select)]:outline-jdc-blue",
  "[&_img]:block [&_img]:max-w-full [&_video]:block [&_video]:max-w-full",
  // reduced motion: switch off animations and transitions everywhere inside
  "motion-reduce:[&_*]:![animation-duration:0.01ms] motion-reduce:[&_*]:![animation-iteration-count:1] motion-reduce:[&_*]:![transition-duration:0.01ms] motion-reduce:[&_*]:![scroll-behavior:auto]",
  "motion-reduce:[&_*::before]:![animation-duration:0.01ms] motion-reduce:[&_*::before]:![animation-iteration-count:1] motion-reduce:[&_*::before]:![transition-duration:0.01ms]",
  "motion-reduce:[&_*::after]:![animation-duration:0.01ms] motion-reduce:[&_*::after]:![animation-iteration-count:1] motion-reduce:[&_*::after]:![transition-duration:0.01ms]",
].join(" ");

/**
 * Standard page frame on the design system: skip link, header, main,
 * footer, and the global navigation loading overlay.
 *
 * @param {"overlay"|"solid"} [header="overlay"] use "overlay" when the page
 *   starts with a dark hero (PageHero), "solid" otherwise.
 */
export default function PageShell({ header = "overlay", children, mainClassName }) {
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
          className={cx(header === "solid" && "pt-jdc-header", mainClassName)}
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </HomeClientWrapper>
  );
}
