/**
 * Brand constants and site navigation shared by the design system shell
 * (header, drawer, footer). Routes point at the existing Next.js pages.
 */
export const BRAND = Object.freeze({
  name: "Just Dry Cleans",
  tagline: "Cleaner clothes. Better everyday.",
  city: "London",
  themeColor: "#031443",
});

export const ROUTES = Object.freeze({
  home: "/",
  signIn: "/sign-in",
  pricing: "/pricing",
  howItWorks: "/how-it-works",
  blog: "/blog",
  contact: "/contact-us",
  helpCenter: "/help-center",
  locations: "/locations",
  partner: "/become-partner",
  privacy: "/privacy-policy",
  terms: "/terms",
});

export const MAIN_NAV = Object.freeze([
  { label: "Pricing", href: ROUTES.pricing },
  { label: "How it works", href: ROUTES.howItWorks },
  { label: "Blog", href: ROUTES.blog },
  { label: "Contact us", href: ROUTES.contact },
]);

export const FOOTER_NAV = Object.freeze([
  {
    title: "Explore",
    links: [
      { label: "How it works", href: ROUTES.howItWorks },
      { label: "Prices & Services", href: ROUTES.pricing },
      { label: "Help centre", href: ROUTES.helpCenter },
    ],
  },
  {
    title: "Our solution",
    links: [
      { label: "Laundry", href: ROUTES.pricing },
      { label: "Dry Cleaning", href: ROUTES.pricing },
      { label: "Alterations", href: ROUTES.pricing },
      { label: "Duvets & bulky items", href: ROUTES.pricing },
    ],
  },
  {
    title: "Our company",
    links: [
      { label: "Locations", href: ROUTES.locations },
      { label: "Blog", href: ROUTES.blog },
      { label: "Contact us", href: ROUTES.contact },
    ],
  },
  {
    title: "Work with us",
    links: [{ label: "Cleaning partner", href: ROUTES.partner }],
  },
]);

// Replace "#" with the live store and social URLs before launch.
export const APP_LINKS = Object.freeze({ appStore: "#", googlePlay: "#" });

export const SOCIAL_LINKS = Object.freeze([
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "TikTok", href: "#", icon: "tiktok" },
]);
