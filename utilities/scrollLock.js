/**
 * Lock / unlock page scrolling while a sheet, drawer or popup is open.
 * Hiding the page scrollbar would otherwise widen the page and shift
 * everything sideways, so its width is put back as padding on <html>
 * (the same thing HeroUI / react-aria do for their modals).
 */
export function lockPageScroll(on) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (on) {
    if (body.style.overflow === "hidden") return;
    const gap = window.innerWidth - html.clientWidth;
    if (gap > 0) html.style.paddingRight = `${gap}px`;
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "";
    html.style.paddingRight = "";
  }
}
