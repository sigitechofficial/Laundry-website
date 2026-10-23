// UK postcode, full form (e.g. "SW1A 1AA", "N1 9GU"). Case and spacing are normalised.
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function isValidUkPostcode(value) {
  return UK_POSTCODE.test(String(value ?? "").trim());
}

/** "sw1a1aa" -> "SW1A 1AA" */
export function normalisePostcode(value) {
  const compact = String(value ?? "").replace(/\s+/g, "").toUpperCase();
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}

/** Returns an error message, or "" when valid. */
export function postcodeError(value) {
  const v = String(value ?? "").trim();
  if (!v) return "Enter your postcode to check availability.";
  if (!isValidUkPostcode(v)) return "Enter a valid UK postcode, for example SW1A 1AA.";
  return "";
}
