export function normalizeBookingStatusTitle(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pre-invoice steps — still shown under Active. */
const PRE_INVOICE_EXACT = new Set(
  [
    "order created",
    "confirmed",
    "awaiting collection",
    "driver out for pickup",
    "driver reached pickup",
    "pickingup and inspection",
    "picking up and inspection",
    "in transit to facility",
    "delivered laundry to shop",
    "agent added the services",
    "on hold/waiting for customer response",
    "on hold waiting for customer response",
    "onhold/waiting for agent response",
    "onhold waiting for agent response",
    // Failed attempts still need customer action → keep in Active
    "delivery failed",
    "pickup failed",
  ].map((s) => normalizeBookingStatusTitle(s))
);

function isExplicitlyPreInvoice(key) {
  if (PRE_INVOICE_EXACT.has(key)) return true;
  if (key === "in transit" || key.startsWith("in transit ")) return true;
  if (key === "pending" || key === "new") return true;
  if (key.includes("on hold") || key.includes("onhold") || key.includes("waiting for")) {
    return true;
  }
  if (key.includes("driver reached pickup")) return true;
  if (key.includes("driver out for pickup")) return true;
  if (key.includes("delivered laundry to shop")) return true;
  if (key.includes("agent added")) return true;
  return false;
}

function isInvoiceOrLaterByKeywords(key) {
  if (!key) return false;

  if (key.includes("invoice generated")) return true;
  if (key.includes("invoice creation")) return true;
  if (key.includes("invoice") && (key.includes("generat") || key.includes("creat"))) {
    return true;
  }

  if (/\bprocessing\b/.test(key)) return true;
  if (key.includes("out for delivery")) return true;
  if (key.includes("driver reached") && !key.includes("pickup")) return true;
  if (key.includes("at facility")) return true;
  if (key === "delivered" || (key.includes("delivered") && !key.includes("laundry to shop"))) {
    return true;
  }
  if (/\bcompleted\b/.test(key)) return true;

  return false;
}

function isTerminalPastStatus(key) {
  if (!key) return false;
  if (key.includes("cancel")) return true;
  if (key.includes("refunded")) return true;
  if (key.includes("processed")) return true;
  if (key.includes("finished")) return true;
  if (/\bdone\b/.test(key)) return true;
  return false;
}

/**
 * Past tab: cancelled/refunded/final states, or Invoice Generated (creation) onward.
 */
export function isPastBookingStatus(statusTitle) {
  const key = normalizeBookingStatusTitle(statusTitle);
  if (!key) return false;

  if (isTerminalPastStatus(key)) return true;
  if (isExplicitlyPreInvoice(key)) return false;
  if (isInvoiceOrLaterByKeywords(key)) return true;

  return false;
}

export function isActiveBookingStatus(statusTitle) {
  return !isPastBookingStatus(statusTitle);
}
