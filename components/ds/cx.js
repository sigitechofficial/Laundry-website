import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom theme keys from tailwind.config.js, so e.g.
// `text-jdc-sm` (a font size) never cancels `text-jdc-navy` (a colour).
const twMerge = extendTailwindMerge({
  // Our sizes (text-[15px], text-jdc-sm) set only font-size, so a size class
  // must not cancel a leading-* class on the same element.
  override: {
    conflictingClassGroups: { "font-size": [] },
  },
  extend: {
    theme: {
      spacing: ["jdc-gutter", "jdc-header", "jdc-section"],
      borderRadius: ["jdc-sm", "jdc-md", "jdc-lg", "jdc-xl", "jdc-2xl", "jdc-pill"],
    },
    classGroups: {
      "font-size": [{ text: ["jdc-xs", "jdc-sm", "jdc-base", "jdc-lg", "jdc-xl", "jdc-h3", "jdc-h2", "jdc-h1"] }],
      "font-family": [{ font: ["display", "body", "sf", "youth", "omnes", "inter"] }],
      ease: [{ ease: ["jdc"] }],
      duration: [{ duration: ["jdc"] }],
    },
  },
});

/**
 * Join class names, skipping falsy values. Conflicting Tailwind utilities are
 * resolved so the later one wins (e.g. a caller's `h-[54px]` over a
 * component's default height), the same way CSS-module overrides worked.
 */
export function cx(...parts) {
  return twMerge(parts.filter(Boolean).join(" "));
}
