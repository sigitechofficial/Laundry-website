export function normalizePostcode(value) {
  return (value || "").trim().replace(/\s+/g, "").toUpperCase();
}

export function formatSpacedPostcode(normalized) {
  return normalized.replace(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/, "$1 $2");
}

/** Single-line label for address picker lists (matches Ideal fullAddress). */
export function formatAddressListLabel(address, fallbackPostcode = "") {
  if (address?.fullAddress) {
    return address.fullAddress;
  }

  const parts = [
    address?.line1,
    address?.line2,
    address?.town,
    address?.county,
    address?.postcode
      ? formatSpacedPostcode(normalizePostcode(address.postcode))
      : fallbackPostcode
        ? formatSpacedPostcode(normalizePostcode(fallbackPostcode))
        : "",
  ].filter(Boolean);

  return parts.join(", ");
}

export function isFullUkPostcode(value) {
  return /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?[0-9][A-Z]{2}$/.test(normalizePostcode(value));
}

export function isUkOutcodeOnly(value) {
  const compact = normalizePostcode(value);
  return /^[A-Z]{1,2}\d{1,2}[A-Z]?$/.test(compact) && !isFullUkPostcode(compact);
}

export function mapPostcodeAddressToFormFields(address) {
  return {
    streetAddress:
      address.fullAddress ||
      `${address.line1 || ""}${address.line2 ? `, ${address.line2}` : ""}`.trim(),
    district: address.locality || address.line2 || "",
    city: address.town || "",
    province: address.county || "",
    postalCode: address.postcode || "",
    lat: address.latitude ?? null,
    lng: address.longitude ?? null,
    save: true,
  };
}

const SESSION_ADDRESS_CACHE_PREFIX = "pcAddr:v2:";

export function readSessionAddressCache(postcode) {
  if (typeof window === "undefined") return null;
  try {
    const key = `${SESSION_ADDRESS_CACHE_PREFIX}${normalizePostcode(postcode)}`;
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSessionAddressCache(postcode, payload) {
  if (typeof window === "undefined") return;
  try {
    const key = `${SESSION_ADDRESS_CACHE_PREFIX}${normalizePostcode(postcode)}`;
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}

export function getRetryAfterSeconds(error) {
  return (
    error?.data?.data?.retryAfterSeconds ??
    error?.data?.retryAfterSeconds ??
    error?.data?.details?.retryAfterSeconds ??
    null
  );
}

export function filterAddresses(addresses, query) {
  if (!Array.isArray(addresses)) return [];

  const q = (query || "").trim().toLowerCase();
  if (!q) return addresses;

  return addresses.filter((addr) => {
    const haystack = [
      addr.line1,
      addr.line2,
      addr.line3,
      addr.fullAddress,
      addr.town,
      addr.locality,
      addr.county,
      addr.postcode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
