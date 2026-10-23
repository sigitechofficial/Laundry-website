"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * false while the server renders and while the page hydrates, true afterwards.
 * Unlike a useState + useEffect "mounted" flag, a component mounted later (e.g. after
 * moving to another page in the app) gets true on its first render, so it does not
 * flash its "not yet" state on every navigation.
 */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
