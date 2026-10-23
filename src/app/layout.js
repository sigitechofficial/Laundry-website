import localFont from "next/font/local";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";
import "../design-system/tokens.css";
import { Providers } from "./store/Providers";
import {
  GoogleMapsProviderWrapper,
  HeroUIProvidersWrapper,
} from "../../utilities/wrapper";

const sfPro = localFont({
  src: [
    {
      path: "/fonts/sf/SF-Pro-Text-Ultralight.otf",
      weight: "100",
      style: "normal",
      display: "swap",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Thin.otf",
      weight: "300",
      style: "normal",
      display: "swap",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
      display: "swap",
    },

    {
      path: "/fonts/sf/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
      display: "swap",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
      display: "swap",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
      display: "swap",
    },
  ],
  variable: "--font-sf-pro",
});

const youth = localFont({
  src: [
    {
      path: "/fonts/youth/Youth-Black.woff2",
      weight: "900",
      style: "normal",
      display: "swap",
    },

    {
      path: "/fonts/youth/Youth-Bold.woff2",
      weight: "700",
      style: "normal",
      display: "swap",
    },

    {
      path: "/fonts/youth/Youth-Medium.woff2",
      weight: "500",
      style: "normal",
      display: "swap",
    },

    {
      path: "/fonts/youth/Youth-Regular.woff2",
      weight: "400",
      style: "normal",
      display: "swap",
    },

    {
      path: "/fonts/youth/Youth-Light.woff2",
      weight: "300",
      style: "normal",
      display: "swap",
    },

    {
      path: "/fonts/youth/Youth-Thin.woff2",
      weight: "100",
      style: "normal",
      display: "swap",
    },
  ],
  variable: "--font-youth",
});

// Design system typefaces (Just Dry Cleans)
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-outfit",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata = {
  title: "Laundry Service",
  description: "Do your laundry smartly",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: "no",
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    // overscroll-none: no "rubber band" stretch / bounce when a drag or swipe goes past
    // the edge of the page (Microsoft Edge does this on Windows; Chrome does not).
    <html
      lang="en"
      className={`${sfPro.variable} ${youth.variable} ${outfit.variable} ${figtree.variable} overscroll-none`}
    >
      {/* Base text style for the whole site, so everything inherits it, including popups,
          dialogs and toasts drawn outside the page wrapper (PageShell). */}
      <body className="font-body text-jdc-text antialiased overscroll-none">
        <Providers>
          <HeroUIProvidersWrapper>
            <GoogleMapsProviderWrapper>{children}</GoogleMapsProviderWrapper>
          </HeroUIProvidersWrapper>
        </Providers>
      </body>
    </html>
  );
}

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${sfPro.variable} ${youth.variable} antialiased`}>
//         <Providers>
//           <HeroUIProviders>
//             {/* <GoogleMapsProvider> */}
//             {children}
//             {/* </GoogleMapsProvider> */}
//           </HeroUIProviders>
//         </Providers>
//       </body>
//     </html>
//   );
// }
