"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";
import { lockPageScroll } from "../../utilities/scrollLock";
import { useIsClient } from "./useIsClient";

/**
 * The one popup shell for the site: popups, bottom sheets and side drawers.
 * Every popup gets the same behaviour from here instead of copying it:
 *
 *  - drawn in <body> (a portal), so no parent's overflow, transform or z-index can clip it;
 *  - plain dimmed backdrop (bg-jdc-scrim, no blur: blur builds up over several frames
 *    and made the page flicker);
 *  - the same motion: a short rise-and-fade when centred, a slide-up sheet on phones
 *    (≤720px), a slide-in drawer for placement="side"; exits play before it unmounts;
 *  - page scroll locked while open (named lock, so stacked popups don't unlock early);
 *  - Escape and a backdrop click close it (unless dismissible={false});
 *  - focus moves into it, Tab stays inside, and focus goes back to the button that
 *    opened it when it closes;
 *  - role="dialog" with aria-modal and a label.
 *
 *   <Dialog open={open} onClose={close} labelledBy="payTitle" width="md">
 *     <div className={ui.MODAL_HEAD}><b id="payTitle">Payment method</b> …</div>
 *     …
 *   </Dialog>
 *
 * @param {boolean} open
 * @param {() => void} [onClose]       Escape / backdrop click / caller's own buttons
 * @param {boolean} [dismissible=true] false: Escape and the backdrop do nothing
 * @param {string} [labelledBy]        id of the visible title
 * @param {string} [label]             aria-label when there is no visible title
 * @param {"center"|"side"} [placement="center"]  side: drawer on the right from 721px
 * @param {"sm"|"md"|"lg"} [width="lg"] centred width: 400 / 440 / 560px
 * @param {"dialog"|"alert"} [layer="dialog"] alert sits above other popups
 * @param {boolean} [keepMounted]      keep the content (and its state) while closed,
 *                                     e.g. the Stripe card form
 * @param {boolean} [handle=true]      grab bar at the top of the phone sheet
 * @param {React.RefObject} [initialFocus] element to focus on open (else the first
 *                                     [data-autofocus], else the popup itself)
 * @param {string} [className]         extra classes for the panel (height etc.)
 */

const EXIT_MS = 200; // longest exit animation (sheet / drawer)
const openStack = []; // ids of open dialogs, topmost last: only the top one reacts to keys

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const ROOT = "fixed inset-0 flex";
const ROOT_AT = {
  center: "items-center justify-center p-6 max-[720px]:items-end max-[720px]:p-0",
  side: "items-stretch justify-end max-[720px]:items-end",
};
const LAYER = { dialog: "z-jdc-dialog", alert: "z-jdc-alert" };

// Inherits nothing from the page (it lives in <body>), so it sets the page's base type.
const PANEL =
  "relative flex w-full flex-col overflow-hidden bg-white font-body text-jdc-lg leading-[1.6] text-jdc-text antialiased outline-none";
const PANEL_AT = {
  center:
    "max-h-[calc(100vh-48px)] rounded-[22px] border border-jdc-line max-[720px]:max-h-[92vh] max-[720px]:max-w-none max-[720px]:rounded-[22px_22px_0_0] max-[720px]:border-x-0 max-[720px]:border-b-0",
  side:
    "h-full max-w-[480px] border-l border-jdc-line max-[720px]:h-auto max-[720px]:max-h-[94vh] max-[720px]:max-w-none max-[720px]:rounded-[22px_22px_0_0] max-[720px]:border-l-0 max-[720px]:border-t",
};
const WIDTH = { sm: "max-w-[400px]", md: "max-w-[440px]", lg: "max-w-[560px]" };
const ENTER = {
  center: "animate-jdc-pop-in max-[720px]:animate-jdc-sheet-in",
  side: "animate-jdc-side-in max-[720px]:animate-jdc-sheet-in",
};
const EXIT = {
  center: "animate-jdc-pop-out max-[720px]:animate-jdc-sheet-out",
  side: "animate-jdc-side-out max-[720px]:animate-jdc-sheet-out",
};
const HANDLE = "mx-auto mt-2.5 hidden h-[5px] w-10 flex-none rounded-[3px] bg-[#D5DAE3] max-[720px]:block";

export default function Dialog({
  open: isOpen,
  onClose,
  dismissible = true,
  labelledBy,
  label,
  placement = "center",
  width = "lg",
  layer = "dialog",
  keepMounted = false,
  handle = true,
  initialFocus,
  className,
  children,
}) {
  const id = useId();
  const client = useIsClient();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // While the exit plays, show the content as it was when it closed: callers usually
  // reset their state on close, which would otherwise change the popup as it fades.
  const lastChildren = useRef(children);
  if (isOpen || keepMounted) lastChildren.current = children;

  const [present, setPresent] = useState(isOpen); // stays true while the exit plays

  useEffect(() => {
    if (isOpen) {
      setPresent(true);
      return undefined;
    }
    const t = setTimeout(() => setPresent(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [isOpen]);

  // scroll lock, own name per dialog
  useEffect(() => {
    if (!isOpen) return undefined;
    const owner = `dialog${id}`;
    lockPageScroll(true, owner);
    return () => lockPageScroll(false, owner);
  }, [isOpen, id]);

  // focus in, keep Tab inside, Escape, focus back out
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    openStack.push(id);

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const target = initialFocus?.current || panel.querySelector("[data-autofocus]") || panel;
      target.focus({ preventScroll: true });
    });

    const onKey = (e) => {
      if (openStack[openStack.length - 1] !== id) return;
      if (e.key === "Escape") {
        if (!dismissible) return;
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length);
      if (!nodes.length) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const at = document.activeElement;
      if (e.shiftKey && (at === first || at === panel || !panel.contains(at))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (at === last || !panel.contains(at))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      const i = openStack.indexOf(id);
      if (i !== -1) openStack.splice(i, 1);
      // back to the opener, unless focus already moved somewhere real (e.g. a next popup)
      const at = document.activeElement;
      const lost = !at || at === document.body || panelRef.current?.contains(at);
      if (lost && opener && opener !== document.body && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [isOpen, id, dismissible, initialFocus]);

  if (!client) return null; // portals need document
  const shown = isOpen || present;
  if (!shown && !keepMounted) return null;
  const closing = !isOpen && present;

  return createPortal(
    // while the exit plays it no longer takes clicks
    <div className={cx(ROOT, ROOT_AT[placement], LAYER[layer], closing && "pointer-events-none", !shown && "hidden")}>
      <div
        className={cx("absolute inset-0 bg-jdc-scrim", closing ? "animate-jdc-fade-out" : "animate-jdc-fade-in")}
        onClick={dismissible ? () => onCloseRef.current?.() : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        className={cx(
          PANEL,
          PANEL_AT[placement],
          placement === "center" && WIDTH[width],
          closing ? EXIT[placement] : ENTER[placement],
          className,
        )}
      >
        {handle ? <span className={HANDLE} aria-hidden="true" /> : null}
        {lastChildren.current}
      </div>
    </div>,
    document.body,
  );
}
