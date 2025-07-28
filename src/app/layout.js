import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./store/Providers";
import {
  GoogleMapsProviderWrapper,
  HeroUIProvidersNoSSR,
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
    <html lang="en" className={`${sfPro.variable} ${youth.variable}`}>
      <body className="antialiased">
        <Providers>
          <HeroUIProvidersNoSSR>
            <GoogleMapsProviderWrapper>{children}</GoogleMapsProviderWrapper>
          </HeroUIProvidersNoSSR>
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
