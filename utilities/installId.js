/**
 * This browser's install id, sent to the backend as `deviceId` on every customer sign-in
 * (login, social login, sign-up, sign-up OTP).
 *
 * The backend keys each sign-in session by `deviceId` (Redis session field + JWT claim),
 * so signing out here revokes only this browser's session. The push (FCM) token is not the
 * session id: browsers without notification permission have none. It is sent as `dvToken`
 * when known, and an empty `dvToken` simply means "no push address".
 *
 * Stored in localStorage (one id per browser profile, generated once). If localStorage is
 * unavailable (private mode, blocked site data), a tab-scoped id in sessionStorage is used:
 * that tab's session ends when the tab closes. If neither is available, sign-in fails with
 * a visible message. The server never invents an id.
 */

export const INSTALL_ID_KEY = "jdcDeviceId";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class InstallIdUnavailableError extends Error {
  constructor() {
    super(
      "Sign-in needs this browser to allow site storage. Please enable cookies and site data for this site (or leave private browsing) and try again."
    );
    this.name = "InstallIdUnavailableError";
  }
}

export const isValidInstallId = (value) => typeof value === "string" && UUID_V4.test(value);

/** RFC 4122 version-4 UUID (lower case) from the Web Crypto API. */
export function generateInstallId(cryptoImpl = globalThis.crypto) {
  if (cryptoImpl && typeof cryptoImpl.randomUUID === "function") {
    return cryptoImpl.randomUUID().toLowerCase();
  }
  if (!cryptoImpl || typeof cryptoImpl.getRandomValues !== "function") {
    throw new InstallIdUnavailableError();
  }
  const bytes = cryptoImpl.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Read the id from `storage`, creating it there if missing; null if the storage is unusable. */
function readOrCreateIn(storage, cryptoImpl) {
  try {
    if (!storage) return null;
    const stored = storage.getItem(INSTALL_ID_KEY);
    if (isValidInstallId(stored)) return stored;
    const id = generateInstallId(cryptoImpl);
    storage.setItem(INSTALL_ID_KEY, id);
    // Some browsers accept setItem and drop it (quota 0): only trust what reads back.
    return storage.getItem(INSTALL_ID_KEY) === id ? id : null;
  } catch (e) {
    if (e instanceof InstallIdUnavailableError) throw e;
    return null; // SecurityError / QuotaExceededError: storage not usable
  }
}

function storageOf(scope, win) {
  try {
    return win ? win[scope] : null; // accessing the property itself can throw
  } catch {
    return null;
  }
}

/**
 * This browser's install id: the localStorage one, else a tab-scoped sessionStorage one.
 * @throws {InstallIdUnavailableError} when no storage is usable.
 */
export function getInstallId({ win = typeof window !== "undefined" ? window : undefined, cryptoImpl = globalThis.crypto } = {}) {
  const id =
    readOrCreateIn(storageOf("localStorage", win), cryptoImpl) ||
    readOrCreateIn(storageOf("sessionStorage", win), cryptoImpl);
  if (!id) throw new InstallIdUnavailableError();
  return id;
}

/**
 * RTK Query `queryFn` for a sign-in endpoint: adds this browser's `deviceId` to the body.
 * When no id can be kept, returns an error in the backend's shape ({ status: "0", message,
 * error }) so the sign-in screen shows it like any server refusal.
 */
export function signInQueryFn(url) {
  return async (body, _api, _extraOptions, baseQuery) => {
    let deviceId;
    try {
      deviceId = getInstallId();
    } catch (e) {
      const message = e instanceof InstallIdUnavailableError ? e.message : String(e);
      return { error: { status: 400, data: { status: "0", message, error: message, data: {} } } };
    }
    return baseQuery({ url, method: "POST", body: { ...body, deviceId } });
  };
}
