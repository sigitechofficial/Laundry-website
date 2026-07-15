const DELIVERY_FAILED_STATUS_ID = 15;
const AWAITING_COLLECTION_STATUS_ID = 3;

function resolveStatusId(order) {
  const raw = order?.bookingStatusId ?? order?.bookingStatus?.id;
  const statusId = Number(raw);
  return Number.isFinite(statusId) ? statusId : null;
}

/**
 * Returns "pickup" | "delivery" | null — which leg (if any) most recently
 * failed a no-show attempt and still needs the customer's attention.
 */
export function getFailedAttemptType(order) {
  const statusId = resolveStatusId(order);
  if (statusId === DELIVERY_FAILED_STATUS_ID) return "delivery";

  const pickupAttemptCount = Number(order?.pickupAttemptCount) || 0;
  if (statusId === AWAITING_COLLECTION_STATUS_ID && pickupAttemptCount > 0) {
    return "pickup";
  }

  return null;
}

export function hasFailedAttempt(order) {
  return getFailedAttemptType(order) !== null;
}

export function getFailedAttemptBookings(orders) {
  if (!Array.isArray(orders)) return [];
  return orders
    .map((order) => ({ order, attemptType: getFailedAttemptType(order) }))
    .filter((entry) => entry.attemptType !== null);
}
