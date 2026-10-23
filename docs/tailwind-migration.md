# Tailwind migration plan

Goal: every page of the main website is styled with Tailwind CSS utility classes. No CSS modules and no hand-written page stylesheets. The site must look exactly the same afterwards.

## What stays as CSS (allowed)

- `src/app/globals.css`: only the `@tailwind` directives, font-face, and base element rules that cannot be utilities.
- `src/design-system/tokens.css`: the brand CSS variables (`--jdc-*`) that the Tailwind theme reads (`bg-jdc-navy`, `text-jdc-muted`, ...).
- Font files (`src/app/fonts/**`).

## What gets converted

| Group | Files | Pages affected |
|---|---|---|
| A. Shared layout | `components/ds/*` (SiteHeader, SiteFooter, PageHero, Blocks, Button, FaqList, Form, Layout, LegalPage, Reveal, StoreBadges) + `components/home/Hero.module.css` (shared with PageHero) | every page |
| B. Home | `components/home/*` (FaqSection, FirstPickup, Guarantee, Mosaic, OfferPromo, ServicesMarquee, ServicesSection, StudioBand, WhySection) | `/` |
| C. Content pages | account, auth, blog, contact, help, how-it-works, locations, partner, pricing | `/profile`, `/sign-in`, `/blog`, `/contact-us`, `/help-center`, `/how-it-works`, `/locations`, `/become-partner`, `/pricing` |
| D. Booking flow | `components/booking/Booking.module.css`, the scoped prototype stylesheet (`src/design-system/prototype.css`) and the 11 files using its classes | `/place-order`, `/checkout/order`, `/checkout/payment` |
| E. Leftovers | custom classes in `globals.css`, unused `ServiceRow.module.css`, remove the `prototype.css` import | all |

Order: A first (it touches every page), then B, C and D in parallel (separate files and pages), then E.

## Rules for each conversion

1. Keep the DOM exactly the same: same elements, same order. Only `className` changes. This is what lets the before/after check compare element by element.
2. Breakpoints: the old CSS uses `max-width: 1080px` / `720px`, so use `max-[1080px]:` / `max-[720px]:`. Do not round them to `md:`/`lg:`.
3. Colours, fonts and radii use the theme tokens (`jdc-*`). Otherwise use exact arbitrary values (`text-[15.5px]`, `rounded-[14px]`).
4. Selectors map as follows:
   - hover / focus → `hover:` / `focus-visible:`
   - descendant rules → classes on the child, or `[&_x]:`
   - pseudo-elements → `before:` / `after:`
   - JS-toggled states → conditional class strings
5. Class groups used many times go into small components or exported class-string constants. Do not use `@apply`.
6. Back up every converted stylesheet to `src/legacy/css-modules/` before removing its import. Nothing is deleted.

## Exactness gotchas (found during Group A)

These Tailwind utilities look equivalent but compute different values from the old CSS:

| Don't use | Because | Use |
|---|---|---|
| `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl` | they also set `line-height` | `text-[14px]` etc., or the `text-jdc-*` tokens (size only) |
| `shadow-[...]`, `shadow-none` | Tailwind adds two ring layers to `box-shadow` | `[box-shadow:0_1px_0_var(--jdc-line)]`; omit when the old value was `none` |
| `outline-none` | it is a transparent 2px outline, not `none` | `[outline:none]` |
| `rounded-full` for `border-radius: 50%` | it computes to `9999px` | `rounded-[50%]`; use `rounded-jdc-pill` for `999px` |
| `bg-[url("data:...")]` (any arbitrary value with quotes) | breaks the CSS build for the whole site | a named entry in `theme.extend.backgroundImage` (e.g. `bg-jdc-chevron`) |
| `[font:inherit]` next to a size class | arbitrary properties come after utilities, so it overrides the size | nothing (Tailwind's base already makes buttons/inputs inherit the font) |
| `items-start` for `align-items: start` | it is `flex-start` | `[align-items:start]` |
| `mx-auto` on a grid container that had `margin: 0 auto` | Chrome reports a different computed margin | `[margin:0_auto]` |
| `cond ? X : "hidden"` | the hidden element loses its other styles (the old CSS kept them) | `cx(X, !cond && "hidden")` |
| object screens like `{ raw: "..." }` in `tailwind.config.js` | switches off every `max-[…]` / `min-[…]` variant site-wide | an arbitrary media variant: `[@media(min-width:901px)_and_(max-height:860px)]:mt-4` |
| class names built at runtime (`` `x-${n}` ``, `.map`) | Tailwind only generates classes written out in full | write every class literally |
| class-like text in backup files under `src/legacy` | Tailwind scanned it and generated invalid CSS (site-wide 500) | `src/legacy` is now excluded in `tailwind.config.js` content |
| class strings joined with template literals when two utilities conflict | the winner depends on Tailwind's CSS order | `cx(a, b)` from `components/ds/cx.js` (tailwind-merge, so the later class wins) |

Other notes:
- Copy the original file and edit only `className`s. Don't retype content such as SVG paths or text; the check compares text too.
- Descendant rules (`.card h3`) become classes on the child element, or `[&_h3]:...` on the parent.
- `:last-child` → `last:`. `details[open] x` → `group` on details plus `group-open:` on x. `li + li::before` → a class on every li after the first.
- Tokens: `text-jdc-sm` (size), `text-jdc-navy` (colour), `px-jdc-gutter`, `h-jdc-header`, `py-jdc-section`, `rounded-jdc-pill`, `ease-jdc`, `bg-jdc-white`, `text-jdc-on-dark`.

## Verification

`snap.js` / `diff.js` (headless Chrome) record every element's box and about 40 computed styles on all 18 routes at 1440 / 1024 / 390. A group is done only when its routes show **zero differences** against the baseline taken before the migration. Interactive states (menus, modals, slot picker, dropdowns) are also checked by hand.

## Status

- [x] Baseline + harness
- [x] Shared keyframes added to `tailwind.config.js` (`animate-jdc-shimmer`, `animate-jdc-marquee`)
- [x] A. Shared layout (verified: zero differences on all routes at 1440/1024/390)
- [x] B. Home
- [x] C. Content pages
- [x] D. Booking flow (prototype stylesheet replaced by `components/booking/ui.js` class strings)
- [x] E. Leftovers: `prototype.css` and `Booking.module.css` no longer imported; `globals.css` trimmed to base rules,
      page scrollbar and Google autocomplete; scrollbar helpers and tracking-dot animations moved to `tailwind.config.js`;
      `.jdc` scope moved to `PAGE_SCOPE` in `components/ds/PageShell.jsx`.
- [x] Final full-site check: 18 routes × 1440/1024/390, **0 differing elements** against the pre-migration baseline

## What is still CSS (on purpose)
- `src/design-system/tokens.css`: brand CSS variables only (read by the Tailwind theme).
- `src/app/globals.css`: `@tailwind` directives, two element base rules, the page scrollbar, Google Places autocomplete.

## Old files kept (not imported anywhere)
The 32 `*.module.css` files, `src/design-system/prototype.css` and `scripts/build-prototype-css.js` are still on
disk, unused. Copies of everything are in `src/legacy/`. They can be removed once you're happy.
