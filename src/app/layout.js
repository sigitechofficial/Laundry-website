
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./store/Providers";
import { HeroUIProviders } from "../../utilities/HeroUIProviders";
// import GoogleMapsProvider from "../../utilities/GoogeMapsProvider";


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const sfPro = localFont({
  src: [
    {
      path: "/fonts/sf/SF-Pro-Text-Ultralight.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Thin.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "/fonts/sf/SF-Pro-Text-Black.otf",
      weight: "900",
      style: "italic",
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
    },
    {
      path: "/fonts/youth/Youth-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
    {
      path: "/fonts/youth/Youth-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "/fonts/youth/Youth-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "/fonts/youth/Youth-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "/fonts/youth/Youth-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "/fonts/youth/Youth-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "/fonts/youth/Youth-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "/fonts/youth/Youth-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "/fonts/youth/Youth-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "/fonts/youth/Youth-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "/fonts/youth/Youth-ThinItalic.woff2",
      weight: "100",
      style: "italic",
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
    <html lang="en">
      <body className={`${sfPro.variable} ${youth.variable} antialiased`}>
        <Providers>
          <HeroUIProviders>
            {/* <GoogleMapsProvider> */}
              
              {children}
              
              {/* </GoogleMapsProvider> */}
          </HeroUIProviders>
        </Providers>
      </body>
    </html>
  );
}
