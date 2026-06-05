import { useState, useEffect } from "react";

export function formatLiveTime(ianaTimeZone) {
  if (!ianaTimeZone) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: ianaTimeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "";
  }
}

export function formatLiveTzAbbreviation(ianaTimeZone) {
  if (!ianaTimeZone) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: ianaTimeZone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

/** Live wall-clock for an IANA timezone; updates every minute by default. */
export function useLiveClock(ianaTimeZone, intervalMs = 60000) {
  const [time, setTime] = useState(() => formatLiveTime(ianaTimeZone));
  const [abbrev, setAbbrev] = useState(() =>
    formatLiveTzAbbreviation(ianaTimeZone)
  );

  useEffect(() => {
    if (!ianaTimeZone) {
      setTime("");
      setAbbrev("");
      return undefined;
    }
    const tick = () => {
      setTime(formatLiveTime(ianaTimeZone));
      setAbbrev(formatLiveTzAbbreviation(ianaTimeZone));
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [ianaTimeZone, intervalMs]);

  return { time, abbrev };
}
