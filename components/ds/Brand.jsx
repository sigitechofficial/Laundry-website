import Image from "next/image";
import { BRAND } from "./siteConfig";

/**
 * Horizontal brand lockup (mark + wordmark) for headers.
 * @param {"light"|"dark"} tone light = white artwork for dark backgrounds
 */
export function BrandLockup({ tone = "light", markClassName, wordClassName, priority = false }) {
  const t = tone === "light" ? "white" : "navy";
  return (
    <>
      <Image
        className={markClassName}
        src={`/jdc/brand/mark-${t}.png`}
        alt=""
        width={120}
        height={106}
        priority={priority}
      />
      <Image
        className={wordClassName}
        src={`/jdc/brand/wordmark-${t}.png`}
        alt={BRAND.name}
        width={320}
        height={87}
        priority={priority}
      />
    </>
  );
}

/** Stacked logo with tagline, used in the footer. */
export function BrandLogo({ tone = "dark", className }) {
  const t = tone === "light" ? "white" : "navy";
  return (
    <Image
      className={className}
      src={`/jdc/brand/logo-${t}.png`}
      alt={`${BRAND.name}. ${BRAND.tagline}`}
      width={420}
      height={370}
    />
  );
}
