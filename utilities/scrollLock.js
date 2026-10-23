/**
 * Lock / unlock page scrolling while a sheet, drawer or popup is open.
 * Hiding the page scrollbar would otherwise widen the page and shift
 * everything sideways, so its width is put back as padding on <html>
 * (the same thing HeroUI / react-aria do for their modals).
 *
 * Several popups can be open at once (e.g. the bags check closes as the card
 * popup opens), so each caller locks under its own name and the page only
 * unlocks when no one holds a lock. Calls are idempotent per name.
 *
 *   lockPageScroll(true, "bags-warning")   // lock
 *   lockPageScroll(false, "bags-warning")  // release this lock
 *
 * Callers that pass no name share the "page" lock (the original behaviour).
 */
const holders = new Set();

export function lockPageScroll(on, owner = "page") {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;

  if (on) {
    const wasLocked = holders.size > 0;
    holders.add(owner);
    if (wasLocked || body.style.overflow === "hidden") return;
    const gap = window.innerWidth - html.clientWidth;
    if (gap > 0) html.style.paddingRight = `${gap}px`;
    body.style.overflow = "hidden";
    return;
  }

  holders.delete(owner);
  if (holders.size > 0) return;
  body.style.overflow = "";
  html.style.paddingRight = "";
}
