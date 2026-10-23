/**
 * Formats an API price for display.
 *
 * Prices arrive as numbers or numeric strings. When the API gives an ISO
 * currency code (e.g. "GBP") we use Intl so grouping and decimals are
 * correct; otherwise we fall back to the currency symbol.
 *
 * @param {number|string} value
 * @param {{ code?: string, symbol?: string }} [currency]
 * @returns {string|null} null when the value is not a number
 */
export function formatPrice(value, currency = {}) {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return null;

  const code = typeof currency.code === "string" ? currency.code.trim().toUpperCase() : "";
  if (/^[A-Z]{3}$/.test(code)) {
    try {
      return new Intl.NumberFormat("en-GB", { style: "currency", currency: code }).format(n);
    } catch {
      // Unknown code: fall through to the symbol.
    }
  }
  return `${currency.symbol ?? ""}${n.toFixed(2)}`;
}

/** Reads `{ code, symbol }` from a serviceDetail response. */
export function currencyFromResponse(data) {
  const c = data?.data?.currency ?? data?.currency;
  return { code: c?.name ?? c?.code, symbol: c?.symbol ?? "£" };
}
