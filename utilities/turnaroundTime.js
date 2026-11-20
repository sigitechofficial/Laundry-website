/**
 * Turnaround (timeRequired) helpers for collection / delivery scheduling.
 * Dates are ISO yyyy-mm-dd strings (local calendar days).
 */

/**
 * Days a service needs, from its "time required" text: "24-48 hours", "48-72 hours",
 * "2 days" or a bare day count. Takes the largest number (the top of a range) and turns
 * hours into whole days, rounding up. Same rule as the backend (utils/turnaroundTime.js),
 * so the delivery dates offered here match what the backend accepts.
 * Never join the digits together: "24-48 hours" is 2 days, not 2448.
 */
export function parseTimeRequiredDays(value) {
  if (value == null || value === "") return 0;
  const str = String(value).trim().toLowerCase();
  const nums = (str.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return 0;
  const maxNum = Math.max(...nums);
  if (/hour|hr\b|hrs\b/.test(str)) return Math.max(1, Math.ceil(maxNum / 24));
  return Math.ceil(maxNum);
}

export function addDaysToIsoDate(isoDate, days) {
  if (!isoDate || typeof isoDate !== "string") return "";
  const parts = isoDate.split("-").map(Number);
  if (parts.length < 3) return "";
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + (Number(days) || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Minimum delivery date for a collection date and turnaround days. */
export function getMinDeliveryDate(collectionIso, turnaroundDays) {
  if (!collectionIso) return "";
  const days = parseTimeRequiredDays(turnaroundDays);
  if (days === 0) {
    return addDaysToIsoDate(collectionIso, 1);
  }
  return addDaysToIsoDate(collectionIso, days);
}

export function getMaxTurnaroundDays(serviceList, serviceIds) {
  if (!Array.isArray(serviceList) || !serviceIds?.length) return 0;
  let max = 0;
  const labels = [];
  for (const id of serviceIds) {
    const svc = serviceList.find((s) => Number(s.id) === Number(id));
    if (!svc) continue;
    const d = parseTimeRequiredDays(svc.timeRequired);
    if (d > max) {
      max = d;
      labels.length = 0;
      labels.push(svc.name || `Service ${id}`);
    } else if (d === max && d > 0) {
      labels.push(svc.name || `Service ${id}`);
    }
  }
  return { maxDays: max, serviceLabels: labels };
}

export function isDeliveryTooEarly(collectionIso, deliveryIso, turnaroundDays) {
  if (!collectionIso || !deliveryIso) return false;
  const minDelivery = getMinDeliveryDate(collectionIso, turnaroundDays);
  return deliveryIso < minDelivery;
}

export function getTurnaroundConflict({
  serviceList,
  serviceIds,
  collectionDate,
  deliveryDate,
}) {
  const { maxDays, serviceLabels } = getMaxTurnaroundDays(serviceList, serviceIds);
  if (!maxDays || !collectionDate || !deliveryDate) {
    return { conflict: false, maxDays: 0, minDeliveryDate: "", serviceLabels: [] };
  }
  const minDeliveryDate = getMinDeliveryDate(collectionDate, maxDays);
  const conflict = deliveryDate < minDeliveryDate;
  return { conflict, maxDays, minDeliveryDate, serviceLabels };
}

export function formatIsoDateLong(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-").map(Number);
  if (parts.length < 3) return isoDate;
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Pick first delivery slot on or after minDeliveryDate.
 */
export function buildDeliveryUpdateForMinDate(
  slotsDelivery,
  collectionDate,
  collectionTimeTo,
  minDeliveryDate,
  parseTimeToMinutes
) {
  if (!slotsDelivery?.length || !minDeliveryDate) return null;
  const slot = slotsDelivery.find((s) => s.date >= minDeliveryDate);
  if (!slot) return null;
  let timeSlots = slot.timeSlots || [];
  if (
    slot.date === collectionDate &&
    collectionTimeTo &&
    typeof parseTimeToMinutes === "function"
  ) {
    const endMins = parseTimeToMinutes(collectionTimeTo);
    timeSlots = timeSlots.filter(
      (t) => parseTimeToMinutes(t?.start) >= endMins
    );
  }
  const first = timeSlots[0] || slot.timeSlots?.[0];
  if (!first) return { deliveryDate: slot.date, availableTimeSlots: slot.timeSlots || [] };
  return {
    deliveryDate: slot.date,
    deliveryTimeFrom: first.start,
    deliveryTimeTo: first.end,
    availableTimeSlots: slot.timeSlots || [],
  };
}
