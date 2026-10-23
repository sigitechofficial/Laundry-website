# Just Dry Cleans design system

Built from the approved prototype (`Desktop/Prototype/web`). The landing page (`/`) is the first page on it. Other pages still use the legacy theme and move over one at a time.

## Where things live

| Path | What |
| --- | --- |
| `src/design-system/tokens.css` | All tokens as `--jdc-*` CSS variables (colour, type, layout, radius, shadow, motion), plus the `.jdc` page scope |
| `tailwind.config.js` | The same tokens as Tailwind utilities: `bg-jdc-navy`, `text-jdc-blue`, `font-display`, `font-body`, `rounded-jdc-lg`, `shadow-jdc-md` |
| `src/app/layout.js` | Outfit (display) and Figtree (body) via `next/font/google` |
| `components/ds/` | Shared primitives and the site shell |
| `components/home/` | Landing page sections. Copy and images are in `content.js` |
| `public/jdc/brand`, `public/jdc/media` | Logos and photography |
| `utilities/useStartBooking.js` | One hook for every "Book" CTA: signed out goes to `/sign-in`, signed in to `/place-order` or `/checkout/order` |

## Tokens

- **Brand:** navy `#1B2230`, navy-deep `#0F141C`, blue `#0278FE` (hover `#0060D6`), blue-tint `#EAF3FF`, sky `#7DB8FF`
- **Neutrals:** paper `#F7F9FC` (page background), mist `#EEF2F8` (alternate sections), line `#DDE3EE`, text `#1D2740`, muted `#56617A`
- **Type:** display = Outfit 600–800 (headings, uppercase for hero and bands); body = Figtree 400–700. Section headings use one size, `--jdc-h2`. Headings stay a single colour, with no accent words.
- **Layout:** side gutter 96px on desktop, 48px on tablet (≤1080px), 20px on phones (≤720px). Breakpoints are 1080 and 720.
- **Shape:** pill buttons; cards use 24–28px corners; hover is a faint shadow only, with no lifting or zooming.

## Components (`components/ds`)

- `Button` takes `variant` (`primary` | `white` | `ghost`) and `size` (`sm` | `md` | `lg`) and supports `block`. It renders a `<Link>` when given `href`.
- `Container`, `Section` (`tone`: `paper` | `mist` | `white`), `SectionHead`, `Lead`, `Display`
- `Icon` covers the Phosphor set used in the prototype (`<Icon name="truckBold" />`) and `ChevronDown`
- `Reveal` fades content in on scroll. It is progressive: content is visible without JS and with reduced motion.
- `BackgroundVideo` shows a poster first, picks SD/HD by screen and Save-Data, and shows the still only for reduced motion.
- `SiteHeader` (`variant`: `overlay` | `solid`), `SiteFooter`, `StoreBadges`, `BrandLockup`, `BrandLogo`
- `siteConfig.js` holds the brand constants, nav, footer links, app store and social URLs
- `PageShell` is the standard page frame (skip link, header, main, footer, loading overlay)
- `PageHero` is the navy inner-page hero, with optional photo, breadcrumbs and `size="sm"`
- `Blocks`: `PageHead`, `IconTile`, `HeroChips`, `FeatureGrid`, `LinkCard`, `CheckList`, `CtaBand`, `ArrowLink`
- `Form`: `FormCard`, `FormRow`, `TextField`, `SelectField`, `TextAreaField`, `FormNote`, `FormAlert`. Labels, hints, errors, `aria-invalid` and `aria-describedby` are wired automatically.
- `FaqList` + `toFaqList` give a native `<details>` accordion and normalise the FAQ API response
- `LegalPage` is the long-form legal layout with a sticky contents list

## Migration status

| Page | Status |
| --- | --- |
| `/` home | Rebuilt |
| `/pricing`, `/pricing/service-detail` | Rebuilt (live prices, search, estimate) |
| `/how-it-works`, `/contact-us`, `/help-center`, `/locations` | Rebuilt |
| `/blog`, `/blog/[id]` (new) | Rebuilt (sanitised CMS HTML) |
| `/privacy-policy`, `/terms` | Rebuilt (same legal text) |
| `/become-partner` | Rebuilt |
| `/become-partner/registration` | New shell and theme |
| `/sign-in` | Rebuilt layout (split card); all auth logic unchanged |
| `/profile` | No-sidebar account layout (menu lives in the header drawer); order list + details panel use full width |
| `/place-order` | "Book your pickup" single-column form (prototype `book.html`) |
| `/checkout/order` | "Add your services" rows + Pickup / Services summary (prototype `services.html`) |
| `/checkout/payment` | Pay-method tiles, info cards, order summary with frequency / tip pills (prototype `checkout.html`) |

Design rule: flat. No drop shadows or glows; surfaces are separated by a 1px `--jdc-line` border. Shadow tokens are `none` and HeroUI shadows are mapped to a 1px edge.
| Header (signed in) | Avatar + account drawer (restyled), push notifications kept |
| `/reviews` | Not migrated: contains placeholder reviews (see below) |

Legacy shared components (`Buttons`, `InputHeroUi`, `SelectHero`, `PhoneInputComp`, `Drawer`, `DrawerItem`) were restyled with the same props. Legacy Tailwind tokens (`theme-*`, `font-youth`, `font-sf`) now alias the design system, so older inner screens (order history, modals) use the new brand.

Previous versions of every migrated page are kept in `src/legacy/`.

Shared helpers added: `utilities/formatPrice.js`, `utilities/ukPostcode.js`, `utilities/sanitizeHtml.js`, `utilities/useStartBooking.js`. New API endpoint: `getSupportContact` (`customer/supportContact`).

## Building a new page on the system

```jsx
<div className="jdc">
  <SiteHeader variant="solid" />
  <main id="main">...</main>
  <SiteFooter />
</div>
```

Use CSS Modules with `var(--jdc-*)`, or the `jdc` Tailwind utilities. Don't hard-code colours.

## Before launch

- `components/home/content.js`: set `FIRST_ORDER_OFFER.amount`, `GUARANTEE.reportWindowDays` and `GUARANTEE.stats`. Until they are set, the UI leaves them out rather than showing placeholders.
- `components/ds/siteConfig.js`: set the real App Store, Google Play and social URLs.
- `utilities/URL.js`: point `BASE_URL` back at production.
- The hero and studio videos are streamed from Pexels. Self-host them or put them on a CDN for production.
- Contact form: there is no message endpoint, so it opens the visitor's email app addressed to the admin support email. Add a backend endpoint to submit in-page.
- `/reviews` lists hard-coded names, quotes and rating counts. Replace it with real reviews (the backend stores per-shop reviews behind auth) before it is published.
