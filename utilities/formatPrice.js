/**
 * Money display for API amounts.
 *
 * The currency always comes from the API: a zone's currency unit
 * (`{ name: "GBP", symbol: "£" }`, from the backend `units` table) or a
 * booking's `paymentSummary.currencySymbol`. The API returns an empty
 * currency when there is no single answer (no zone, or zones in different
 * currencies); amounts are then shown without a symbol. Nothing here
 * defaults to a currency.
 */

/**
 * Display symbol of an API currency object (`{ name | code, symbol }`): its
 * symbol, else its ISO code followed by a space ("CHF 5.00"), else "" when the
 * API names no currency.
 *
 * @param {{ name?: string, code?: string, symbol?: string } | null | undefined} currency
 * @returns {string}
 */
export function currencySymbol(currency) {
  const symbol = typeof currency?.symbol === "string" ? currency.symbol.trim() : "";
  if (symbol) return symbol;
  const code = currency?.name ?? currency?.code;
  const iso = typeof code === "string" ? code.trim().toUpperCase() : "";
  return iso ? `${iso} ` : "";
}

/**
 * Display symbol of a booking's amounts (bookingDetailsById `data`): the bill's
 * `paymentSummary.currencySymbol` (the booking zone's currency), else the
 * booking zone's currency unit; "" when neither is known.
 *
 * @param {object | null | undefined} booking
 * @returns {string}
 */
export function bookingCurrencySymbol(booking) {
  const fromSummary = booking?.paymentSummary?.currencySymbol;
  if (typeof fromSummary === "string" && fromSummary.trim()) return fromSummary.trim();
  return currencySymbol(booking?.zone?.currencyUnitZ);
}

/**
 * Formats an API price for display.
 *
 * Prices arrive as numbers or numeric strings. When the API gives an ISO
 * currency code (e.g. "GBP") we use Intl so grouping and decimals are
 * correct; otherwise the API's symbol is used, and no currency at all shows
 * the bare amount.
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
      // Code Intl does not know: fall through to the API's symbol.
    }
  }
  return `${currency.symbol ?? ""}${n.toFixed(2)}`;
}

/** Reads `{ code, symbol }` from a serviceDetail response; both "" when it names no currency. */
export function currencyFromResponse(data) {
  const c = data?.data?.currency ?? data?.currency;
  const code = c?.name ?? c?.code;
  return {
    code: typeof code === "string" ? code.trim().toUpperCase() : "",
    symbol: currencySymbol(c),
  };
}
