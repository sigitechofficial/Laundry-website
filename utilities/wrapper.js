"use client";

import dynamic from "next/dynamic";

const Header = dynamic(() => import("../components/Header"), { ssr: false });
const HeroUIProviders = dynamic(
  () => import("../utilities/HeroUIProviders").then((mod) => mod.default),
  { ssr: false }
);
const GoogleMapsProvider = dynamic(() => import("./GoogleMapsProvider"), {
  ssr: false,
});

export default function HeaderWrapper(props) {
  return <Header {...props} />;
}

export function HeroUIProvidersNoSSR({ children }) {
  return <HeroUIProviders>{children}</HeroUIProviders>;
}
export function GoogleMapsProviderWrapper({ children }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}
