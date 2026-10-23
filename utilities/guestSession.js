import { BASE_URL } from "./URL";

let pending = null;

/**
 * Makes sure there is an access token for the customer API: a signed-in token,
 * or a guest session (customer/guest/start) for visitors. Public lookups such as
 * postcode suggestions need one. Safe to call often; it only starts one session.
 */
export function ensureGuestSession() {
  if (typeof window === "undefined") return Promise.resolve();
  try {
    if (localStorage.getItem("accessToken")) return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
  if (!pending) {
    pending = fetch(`${BASE_URL}customer/guest/start`, { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.accessToken) localStorage.setItem("accessToken", json.data.accessToken);
      })
      .catch(() => {
        // guest session is optional; signed-in customers still work
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}
