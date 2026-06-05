const DEFAULT_OPERATIONAL_TZ = "Europe/London";

function isValidIanaTimeZone(tz) {
  if (!tz || typeof tz !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
    return true;
  } catch {
    return false;
  }
}

function parseCalendarDate(dateValue) {
  if (!dateValue) return null;
  const raw = String(dateValue);
  return raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
}

function normalizeTimePart(timeValue) {
  if (!timeValue) return "00:00:00";
  const raw = String(timeValue).trim();
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(raw)) return raw;
  if (/^\d{1,2}:\d{2}$/.test(raw)) return `${raw}:00`;
  return raw;
}

export function formatTo24Hour(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return "";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return timeStr;
  const [, h, m] = match;
  return `${String(Number(h)).padStart(2, "0")}:${m}`;
}

function utcMsForWallClock(dateStr, timeStr, timeZone) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi, s = 0] = normalizeTimePart(timeStr).split(":").map(Number);
  const want = { year: y, month: mo, day: d, hour: h, minute: mi, second: s };

  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  const read = (ms) =>
    Object.fromEntries(
      fmt
        .formatToParts(new Date(ms))
        .filter((p) => p.type !== "literal")
        .map((p) => [p.type, Number(p.value)])
    );

  const cmp = (ms) => {
    const p = read(ms);
    if (p.year !== want.year) return p.year - want.year;
    if (p.month !== want.month) return p.month - want.month;
    if (p.day !== want.day) return p.day - want.day;
    if (p.hour !== want.hour) return p.hour - want.hour;
    if (p.minute !== want.minute) return p.minute - want.minute;
    return p.second - want.second;
  };

  let lo = Date.UTC(y, mo - 1, d - 2);
  let hi = Date.UTC(y, mo - 1, d + 2, 23, 59, 59);

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const c = cmp(mid);
    if (c === 0) return mid;
    if (c < 0) lo = mid + 1;
    else hi = mid - 1;
  }

  return lo;
}

function formatUtcInTz(utcMs, timeZone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(utcMs));
}

function buildSlotDisplay(dateValue, timeFrom, timeTo, operationalTz, localTz) {
  const dateStr = parseCalendarDate(dateValue);
  if (!dateStr || !operationalTz) return null;

  const opFrom = formatTo24Hour(timeFrom);
  const opTo = formatTo24Hour(timeTo);
  if (!opFrom || !opTo) return null;

  const operational = {
    date: dateStr,
    timeFrom: opFrom,
    timeTo: opTo,
    label: `${opFrom} – ${opTo}`,
  };

  let local = null;
  if (localTz && localTz !== operationalTz && isValidIanaTimeZone(localTz)) {
    const utcFrom = utcMsForWallClock(dateStr, timeFrom, operationalTz);
    const utcTo = utcMsForWallClock(dateStr, timeTo, operationalTz);
    const lcFrom = formatUtcInTz(utcFrom, localTz);
    const lcTo = formatUtcInTz(utcTo, localTz);
    local = {
      ianaTimeZone: localTz,
      timeFrom: lcFrom,
      timeTo: lcTo,
      label: `${lcFrom} – ${lcTo}`,
    };
  }

  return { operational, local };
}

function buildScheduleFromBooking(booking) {
  if (!booking) return null;

  const operationalTz =
    (isValidIanaTimeZone(booking.operationalTimeZone) &&
      booking.operationalTimeZone.trim()) ||
    DEFAULT_OPERATIONAL_TZ;

  const customerLocalTz =
    (isValidIanaTimeZone(booking.customerLocalTimeZone) &&
      booking.customerLocalTimeZone.trim()) ||
    (typeof Intl !== "undefined" &&
    Intl.DateTimeFormat?.().resolvedOptions?.().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : null);

  const zone = booking.zone
    ? { id: booking.zone.id, name: booking.zone.name }
    : booking.zoneId
      ? { id: booking.zoneId, name: null }
      : null;

  const countryName =
    booking.zone?.country?.name ||
    (operationalTz === "Europe/London" ? "United Kingdom" : null);

  return {
    zone,
    operational: {
      ianaTimeZone: operationalTz,
      countryName,
      displayLabel: countryName
        ? `${countryName} (${operationalTz})`
        : operationalTz,
      shortLabel: countryName ? `${countryName} time` : "Service time",
    },
    customerLocal:
      customerLocalTz && customerLocalTz !== operationalTz
        ? {
            ianaTimeZone: customerLocalTz,
            displayLabel: customerLocalTz,
            shortLabel: "Your local time",
          }
        : null,
    collection: buildSlotDisplay(
      booking.collectionDate,
      booking.collectionTimeFrom,
      booking.collectionTimeTo,
      operationalTz,
      customerLocalTz
    ),
    delivery: buildSlotDisplay(
      booking.deliveryDate,
      booking.deliveryTimeFrom,
      booking.deliveryTimeTo,
      operationalTz,
      customerLocalTz
    ),
  };
}

/**
 * Use API scheduleContext when present; otherwise build from booking TZ fields.
 */
export function resolveBookingSchedule(booking) {
  if (!booking) return null;

  const fromApi = booking.scheduleContext;
  if (fromApi?.collection?.operational || fromApi?.delivery?.operational) {
    return fromApi;
  }

  return buildScheduleFromBooking(booking);
}
