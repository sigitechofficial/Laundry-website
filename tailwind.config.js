import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./utilities/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Backups of pre-Tailwind files: never generate CSS from them
    // Local-only backups (git-ignored). Never scan them: old code there can break the CSS build.
    "!./src/legacy/**",
  ],
  theme: {
    extend: {
      /*
       * Legacy token names (theme-*, font-youth, font-sf, font-omnes) are
       * aliases of the Just Dry Cleans design system so every pre-existing
       * screen picks up the new brand. Hex values (not CSS vars) keep
       * opacity modifiers such as bg-theme-darkBlue/30 working.
       * Previous values: theme-blue/darkBlue #000099, theme-blue-2 #146EF5,
       * theme-skyBlue #DDEEFC, theme-gray #F0F0F0, fonts Youth / SF Pro.
       */
      fontFamily: {
        inter: "var(--font-inter)",
        omnes: "var(--jdc-font-display)",
        sf: "var(--jdc-font-body)",
        youth: "var(--jdc-font-display)",
        // Design system (src/design-system/tokens.css)
        display: "var(--jdc-font-display)",
        body: "var(--jdc-font-body)",
      },

      backgroundColor: {
        "theme-blue": "#0278FE",
        "theme-blue-2": "#0278FE",
        "theme-skyBlue": "#EAF3FF",
        "theme-darkBlue": "#1B2230",
        "theme-gray": "#EEF2F8",
        "inputBg": "#E8E7E3",
        "bgAvailable": "#55ACEE99",
        "card-dark-orange": "#F7B587",
        "card-light-orange": "#F7D787",
        "card-green": "#54EA6C",
        "card-pink": "#FFC8F3",
      },
      colors: {
        "theme-black-2": "#1B2230",
        "theme-blue": "#0278FE",
        "theme-blue-2": "#0278FE",
        "theme-skyBlue": "#EAF3FF",
        "theme-darkBlue": "#1B2230",
        "theme-gray": "#EEF2F8",
        "theme-gray-2": "#56617A",
        "theme-gray-3": "#1D2740",
        "theme-psGray": "#56617A",
        "theme-brightBlue": "#0278FE",
        "Available": "#55ACEE99",
        // Design system palette: bg-jdc-navy, text-jdc-blue, border-jdc-line ...
        jdc: {
          navy: "var(--jdc-navy)",
          "navy-deep": "var(--jdc-navy-deep)",
          "navy-2": "var(--jdc-navy-2)",
          blue: "var(--jdc-blue)",
          "blue-dark": "var(--jdc-blue-dark)",
          "blue-tint": "var(--jdc-blue-tint)",
          "blue-line": "var(--jdc-blue-line)",
          sky: "var(--jdc-sky)",
          paper: "var(--jdc-paper)",
          mist: "var(--jdc-mist)",
          line: "var(--jdc-line)",
          "line-strong": "var(--jdc-line-strong)",
          text: "var(--jdc-text)",
          muted: "var(--jdc-muted)",
          star: "var(--jdc-star)",
          danger: "var(--jdc-danger)",
          "danger-tint": "var(--jdc-danger-tint)",
          white: "var(--jdc-white)",
          "on-dark": "var(--jdc-on-dark)",
          "on-dark-muted": "var(--jdc-on-dark-muted)",
          "on-dark-line": "var(--jdc-on-dark-line)",
        },
      },
      // Type scale from tokens.css: text-jdc-sm, text-jdc-h2 ...
      // (also registered in components/ds/cx.js so tailwind-merge treats them as sizes)
      fontSize: {
        "jdc-xs": "var(--jdc-text-xs)",
        "jdc-sm": "var(--jdc-text-sm)",
        "jdc-base": "var(--jdc-text-base)",
        "jdc-lg": "var(--jdc-text-lg)",
        "jdc-xl": "var(--jdc-text-xl)",
        "jdc-h3": "var(--jdc-h3)",
        "jdc-h2": "var(--jdc-h2)",
        "jdc-h1": "var(--jdc-h1)",
      },
      // Layout tokens (responsive via CSS vars): px-jdc-gutter, h-jdc-header, py-jdc-section
      spacing: {
        "jdc-gutter": "var(--jdc-gutter)",
        "jdc-header": "var(--jdc-header-h)",
        "jdc-section": "var(--jdc-section-y)",
      },
      transitionTimingFunction: {
        jdc: "var(--jdc-ease)",
      },
      transitionDuration: {
        jdc: "var(--jdc-duration)",
      },
      borderRadius: {
        "jdc-sm": "var(--jdc-radius-sm)",
        "jdc-md": "var(--jdc-radius-md)",
        "jdc-lg": "var(--jdc-radius-lg)",
        "jdc-xl": "var(--jdc-radius-xl)",
        "jdc-2xl": "var(--jdc-radius-2xl)",
        "jdc-pill": "var(--jdc-radius-pill)",
      },
      boxShadow: {
        // Flat brand: legacy shadow classes render as a 1px line instead of elevation.
        // Previous: theme-shadow "0 0 6px #00000029", theme-shadow-light "0 0 4px #00000029".
        "theme-shadow": "0 0 0 1px #DDE3EE",
        "theme-shadow-light": "0 0 0 1px #DDE3EE",
        "jdc-sm": "none",
        "jdc-md": "none",
        "jdc-lg": "none",
        "jdc-blue": "none",
      },
      screens: {
        extraSmall: "375px",
        small: "425px",
        tablet: "841px",
        smallDesktop: "1200px",
        desktop: "1430px",
        largeDesktop: "1600px",
        extraLargeDesktop: "1920px",
        ultraLargeDesktop: "2100px",
      },
      height: {
        "screen-minus-5vh": "calc(100vh - 5vh)",
        "screen-minus-9vh": "calc(100vh - 9vh)",
        "screen-minus-12vh": "calc(100vh - 12vh)",
        "screen-minus-18vh": "calc(100vh - 18vh)",
        "screen-minus-10vh": "calc(100vh - 20vh)",
        "screen-minus-30vh": "calc(100vh - 30vh)",
        "screen-minus-40vh": "calc(100vh - 40vh)",
        "screen-minus-50vh": "calc(100vh - 50vh)",
        "screen-minus-53vh": "calc(100vh - 53vh)",
        "screen-minus-60vh": "calc(100vh - 60vh)",
      },
      // Animations formerly in CSS modules (blog/pricing skeletons, home marquee)
      keyframes: {
        "jdc-shimmer": { to: { backgroundPosition: "-200% 0" } },
        "jdc-marquee": { to: { transform: "translateX(calc(-50% - 17px))" } },
        "jdc-addrs-in": { from: { opacity: "0", transform: "translateY(-6px)" }, to: { opacity: "1", transform: "none" } },
        // Three-dot button loader (was an inline <style> in components/Loader.jsx)
        "bounce-ball": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Order tracking: live pulse on the current status (was globals.css)
        "track-current-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "70%, 100%": { transform: "scale(2.35)", opacity: "0" },
        },
        "track-current-core": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(2, 120, 254, 0.35)" },
          "50%": { transform: "scale(1.08)", boxShadow: "0 0 0 4px rgba(2, 120, 254, 0.12)" },
        },
        "track-current-core-exception": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.35)" },
          "50%": { transform: "scale(1.08)", boxShadow: "0 0 0 4px rgba(239, 68, 68, 0.14)" },
        },
      },
      animation: {
        "bounce-ball": "bounce-ball 0.6s ease-in-out infinite",
        "track-pulse": "track-current-pulse 2.2s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
        "track-core": "track-current-core 2.2s ease-in-out infinite",
        "track-core-exception": "track-current-core-exception 2.2s ease-in-out infinite",
        "jdc-addrs-in": "jdc-addrs-in 0.22s ease-out",
        "jdc-shimmer": "jdc-shimmer 1.4s ease-in-out infinite",
        "jdc-marquee": "jdc-marquee 38s linear infinite",
      },
      backgroundImage: {
        // Navy chevron used by design-system <select> fields (was Form.module.css)
        "jdc-chevron":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231B2230' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        "sign-in": "url('/images/signIn.jpg')",
        "discount": "url('/images/about-us/discount.png')",
        "pricing": "url('/images/pricing/clothes.png')",
        "registration": "url('/images/partner/partner.png')",
      },
    },
  },
  darkMode: "class",
  plugins: [
    // Scrollbar helpers (were plain CSS in globals.css): thin grey scrollbar, hidden scrollbar
    function scrollbars({ addUtilities }) {
      addUtilities({
        ".modal-scroll": {
          "&::-webkit-scrollbar": { width: "2px", height: "6px" },
          "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
          "&::-webkit-scrollbar-thumb": { background: "gray", borderRadius: "10px" },
        },
        // Slim, light scrollbar for dropdown lists (no Windows arrow buttons)
        ".thin-scroll": {
          scrollbarWidth: "thin",
          scrollbarColor: "#D5DAE3 transparent",
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-button": { display: "none" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#D5DAE3", borderRadius: "6px" },
        },
        ".hideScrollbar": {
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    },
    heroui({
      // HeroUI components (spinners, toggles, tabs, toasts) use the brand blue.
      themes: {
        light: {
          // Flat brand: modals, drawers and dropdowns get a 1px edge instead of a shadow.
          layout: {
            boxShadow: {
              small: "0 0 0 1px #DDE3EE",
              medium: "0 0 0 1px #DDE3EE",
              large: "0 0 0 1px #DDE3EE",
            },
          },
          colors: {
            primary: { DEFAULT: "#0278FE", foreground: "#FFFFFF" },
            focus: "#0278FE",
          },
        },
      },
    }),
  ],
};
