export const parseServiceBooleanFlag = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

export const parseQuantityCount = (value) => {
  const parsed = parseInt(String(value ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

/**
 * Returns service names that require bags/items but have none specified.
 */
export function getServicesMissingBagsOrItems({
  preferencesData,
  serviceList,
  orderData,
  useSharedBags,
}) {
  const missing = [];
  const sharedBags = parseQuantityCount(orderData?.totalBags);

  (preferencesData || [])
    .filter((p) => p?.serviceId)
    .forEach((pref) => {
      const svc = (serviceList || []).find(
        (s) => Number(s.id) === Number(pref.serviceId)
      );
      if (!svc) return;

      const needsBags = parseServiceBooleanFlag(svc.numberOfBags);
      const needsItems = parseServiceBooleanFlag(svc.numberOfItems);
      const hasBags = useSharedBags
        ? sharedBags > 0
        : parseQuantityCount(pref.bagsCount) > 0;
      const hasItems = parseQuantityCount(pref.itemsCount) > 0;

      if ((needsBags && !hasBags) || (needsItems && !hasItems)) {
        missing.push(svc.name || pref.serviceName || "Service");
      }
    });

  return [...new Set(missing)];
}
