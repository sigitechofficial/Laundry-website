"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "../utilities/URL";

function formatWindow(minutes) {
  const mins = Number(minutes);
  if (!Number.isFinite(mins) || mins <= 0) return null;
  if (mins % 60 === 0) {
    const hours = mins / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${mins} minute${mins === 1 ? "" : "s"}`;
}

const FALLBACK =
  "You may cancel or reschedule a collection free of charge within the free-cancellation window shown at checkout. Cancellations after that window may be subject to a cancellation fee as shown at the time of booking. Once items have been collected, the order cannot be cancelled.";

export default function CancellationTermsBody() {
  const [text, setText] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_URL}admin/getActivePolicies`)
      .then((res) => res.json())
      .then((json) => {
        const mins =
          json?.data?.activeCancellationPolicy?.cancellationConfig
            ?.prePickupFreeChargeWindowMinutes;
        const windowLabel = formatWindow(mins);
        if (!cancelled && windowLabel) {
          setText(
            `You may cancel or reschedule a collection free of charge up to ${windowLabel} before the scheduled collection window. Cancellations within ${windowLabel} may be subject to a cancellation fee as shown at the time of booking. Once items have been collected, the order cannot be cancelled.`
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return text;
}
