import { Suspense } from "react";
import PriceDetailView from "../../../../components/pricing/PriceDetailView";

// Previous version: see git history (before the 2026 redesign)

export const metadata = {
  title: "Service prices | Just Dry Cleans",
  description: "Item-by-item prices for every Just Dry Cleans service, with a quick estimate before you book.",
};

export default function Page() {
  // PriceDetailView reads the ?id= search param, which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <PriceDetailView />
    </Suspense>
  );
}
