// node --test utilities/installId.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  INSTALL_ID_KEY,
  InstallIdUnavailableError,
  generateInstallId,
  getInstallId,
  isValidInstallId,
  signInQueryFn,
} from "./installId.js";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}
class ThrowingStorage {
  getItem() { throw Object.assign(new Error("denied"), { name: "SecurityError" }); }
  setItem() { throw Object.assign(new Error("denied"), { name: "SecurityError" }); }
}
class DroppingStorage { // Safari private mode style: setItem "works", nothing kept
  getItem() { return null; }
  setItem() {}
}

test("generates v4 UUIDs, with randomUUID or getRandomValues", () => {
  assert.ok(isValidInstallId(generateInstallId(webcrypto)));
  const noRandomUUID = { getRandomValues: (a) => webcrypto.getRandomValues(a) };
  for (let i = 0; i < 50; i++) assert.ok(isValidInstallId(generateInstallId(noRandomUUID)));
  assert.throws(() => generateInstallId({}), InstallIdUnavailableError);
});

test("one id per browser: created once in localStorage, then reused", () => {
  const win = { localStorage: new MemoryStorage(), sessionStorage: new MemoryStorage() };
  const id = getInstallId({ win, cryptoImpl: webcrypto });
  assert.ok(isValidInstallId(id));
  assert.equal(win.localStorage.getItem(INSTALL_ID_KEY), id);
  assert.equal(getInstallId({ win, cryptoImpl: webcrypto }), id);
  assert.equal(win.sessionStorage.getItem(INSTALL_ID_KEY), null);
});

test("an invalid stored value is replaced", () => {
  const win = { localStorage: new MemoryStorage(), sessionStorage: new MemoryStorage() };
  win.localStorage.setItem(INSTALL_ID_KEY, "web-123-abc");
  const id = getInstallId({ win, cryptoImpl: webcrypto });
  assert.ok(isValidInstallId(id));
  assert.equal(win.localStorage.getItem(INSTALL_ID_KEY), id);
});

test("localStorage blocked or dropping writes: tab-scoped sessionStorage id", () => {
  for (const local of [new ThrowingStorage(), new DroppingStorage()]) {
    const win = { localStorage: local, sessionStorage: new MemoryStorage() };
    const id = getInstallId({ win, cryptoImpl: webcrypto });
    assert.ok(isValidInstallId(id));
    assert.equal(win.sessionStorage.getItem(INSTALL_ID_KEY), id);
    assert.equal(getInstallId({ win, cryptoImpl: webcrypto }), id, "stable within the tab");
  }
  // Accessing window.localStorage itself throws in some browsers.
  const win = { sessionStorage: new MemoryStorage() };
  Object.defineProperty(win, "localStorage", { get() { throw new Error("SecurityError"); } });
  assert.ok(isValidInstallId(getInstallId({ win, cryptoImpl: webcrypto })));
});

test("no usable storage: visible error, never an invented id", () => {
  const win = { localStorage: new ThrowingStorage(), sessionStorage: new DroppingStorage() };
  assert.throws(() => getInstallId({ win, cryptoImpl: webcrypto }), InstallIdUnavailableError);
  assert.throws(() => getInstallId({ win: undefined, cryptoImpl: webcrypto }), InstallIdUnavailableError);
});

test("sign-in queryFn adds deviceId to the body; storage failure becomes a server-shaped error", async () => {
  const calls = [];
  const baseQuery = async (args) => { calls.push(args); return { data: { status: "1" } }; };

  globalThis.window = { localStorage: new MemoryStorage(), sessionStorage: new MemoryStorage() };
  try {
    const res = await signInQueryFn("customer/loginUser")({ email: "a@b.c", dvToken: "" }, {}, {}, baseQuery);
    assert.deepEqual(res, { data: { status: "1" } });
    assert.equal(calls[0].url, "customer/loginUser");
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].body.email, "a@b.c");
    assert.equal(calls[0].body.dvToken, "", "empty push token is fine: no push address");
    assert.ok(isValidInstallId(calls[0].body.deviceId));

    globalThis.window = { localStorage: new ThrowingStorage(), sessionStorage: new ThrowingStorage() };
    const failed = await signInQueryFn("customer/loginUser")({ email: "a@b.c" }, {}, {}, baseQuery);
    assert.equal(calls.length, 1, "nothing sent without an id");
    assert.equal(failed.error.status, 400);
    assert.equal(failed.error.data.status, "0");
    assert.match(failed.error.data.message, /allow site storage/);
    assert.equal(failed.error.data.error, failed.error.data.message);
  } finally {
    delete globalThis.window;
  }
});

test("sign-in queryFn sends extra fields (the push token's firebaseProjectId) with deviceId", async () => {
  const calls = [];
  const baseQuery = async (args) => { calls.push(args); return { data: { status: "1" } }; };
  globalThis.window = { localStorage: new MemoryStorage(), sessionStorage: new MemoryStorage() };
  try {
    const queryFn = signInQueryFn("customer/loginUser", { firebaseProjectId: "project-a" });
    await queryFn({ email: "a@b.c", dvToken: "tok" }, {}, {}, baseQuery);
    assert.equal(calls[0].body.dvToken, "tok");
    assert.equal(calls[0].body.firebaseProjectId, "project-a");
    assert.ok(isValidInstallId(calls[0].body.deviceId));

    await signInQueryFn("customer/loginUser")({ email: "a@b.c" }, {}, {}, baseQuery);
    assert.equal("firebaseProjectId" in calls[1].body, false, "no extra fields unless given");
  } finally {
    delete globalThis.window;
  }
});
