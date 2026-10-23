import HomeView from "../../components/home/HomeView";

// The previous landing page is in git history (before the 2026 redesign).

export const metadata = {
  title: "Just Dry Cleans | Dry cleaning and laundry, collected and delivered",
  description:
    "Just Dry Cleans collects, cleans and delivers your dry cleaning and laundry across London, in a one-hour window that suits you.",
  openGraph: {
    title: "Just Dry Cleans | Dry cleaning and laundry, collected and delivered",
    description:
      "Free collection and delivery, one-hour windows and a free re-clean guarantee.",
    images: [{ url: "/jdc/brand/logo-navy.png", width: 720, height: 634 }],
    type: "website",
    locale: "en_GB",
  },
  icons: {
    icon: "/jdc/brand/favicon.png",
    apple: "/jdc/brand/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#031443",
};

export default function Page() {
  return <HomeView />;
}
