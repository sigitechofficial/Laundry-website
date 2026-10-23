"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { BrandLockup } from "./Brand";
import { BRAND, MAIN_NAV, ROUTES } from "./siteConfig";
import { cx } from "./cx";
import { lockPageScroll } from "../../utilities/scrollLock";
import { useAccountSession } from "../../utilities/useAccountSession";
import { useStartBooking } from "../../utilities/useStartBooking";
// Existing account drawer: menu items, profile tabs and logout logic.
import AccountDrawer from "../Drawer";

const SCROLL_SOLID_AT = 24;

// Nav link with a blue underline that grows on hover / for the current page.
const navLinkCls =
  "relative py-1.5 text-inherit no-underline after:absolute after:bottom-0 after:left-0 after:right-full after:h-0.5 after:bg-jdc-blue after:transition-[right] after:duration-[250ms] after:content-[''] hover:after:right-0 aria-[current=page]:after:right-0";

// Round ☰ button, shown at every width (site menu when signed out, account menu when signed in).
const menuBtnCls =
  "inline-flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center rounded-[50%] border-[1.5px] bg-transparent max-[420px]:h-[42px] max-[420px]:w-[42px]";

// Pill button in the header: white over the hero, navy once the header is solid.
const pillCls = (solid) =>
  cx(
    "inline-flex h-[42px] cursor-pointer items-center whitespace-nowrap rounded-jdc-pill border px-[22px] font-body text-jdc-sm font-semibold no-underline transition-colors max-[720px]:h-10 max-[720px]:px-4 max-[420px]:px-3 max-[420px]:text-[13.5px]",
    solid
      ? "border-jdc-navy bg-jdc-navy text-white hover:bg-[#13265A]"
      : "border-white bg-white text-jdc-navy hover:bg-white/90"
  );

/**
 * Global site header.
 * @param {"overlay"|"solid"} [variant="overlay"] overlay starts transparent
 *   over a dark hero and turns solid on scroll; solid is always white.
 */
export default function SiteHeader({ variant = "overlay" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const session = useAccountSession();
  const signedIn = session.mounted && session.isLoggedIn;
  const startBooking = useStartBooking();
  // No "Book a pickup" while already booking (address/time, services, payment)
  const inBooking = /^\/(place-order|checkout)(\/|$)/.test(pathname || "");

  useEffect(() => {
    if (variant !== "overlay") return undefined;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_SOLID_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const solid = variant === "solid" || scrolled;
  const menuTone = solid ? "text-jdc-navy border-[rgba(11,26,58,0.25)]" : "text-jdc-white border-white/55";

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-jdc-header bg-transparent [transition:background_0.3s,box-shadow_0.3s]",
          solid && "bg-white/[0.94] backdrop-blur-[14px] [box-shadow:0_1px_0_var(--jdc-line)]"
        )}
      >
        <div className="flex h-jdc-header items-center gap-10 px-jdc-gutter max-[720px]:gap-4">
          <Link href={ROUTES.home} className="flex flex-none items-center gap-3" aria-label={`${BRAND.name} home`}>
            <BrandLockup
              tone={solid ? "dark" : "light"}
              markClassName="h-[46px] w-auto max-[720px]:h-[38px] max-[420px]:h-[32px]"
              wordClassName="h-[34px] w-auto max-[720px]:h-[26px] max-[420px]:h-[21px]"
              priority
            />
          </Link>

          <nav
            className={cx(
              "flex flex-1 gap-[30px] font-body text-jdc-sm font-semibold max-[1080px]:hidden",
              solid ? "text-jdc-navy" : "text-white/90"
            )}
            aria-label="Main"
          >
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkCls}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/*
            Right side:
            - signed out: Log in (hidden on phones, it is in the menu) + ☰ site menu
            - signed in: Book a pickup + ☰ account menu
            Nothing auth-specific renders until the session is known, so
            signed-in users never see a flash of "Log in".
          */}
          <div
            className={cx(
              "ml-auto flex items-center gap-[22px] font-body text-jdc-sm font-semibold max-[720px]:gap-2.5 max-[420px]:gap-2",
              solid ? "text-jdc-navy" : "text-jdc-white",
              !session.mounted && "invisible"
            )}
          >
            {signedIn ? (
              inBooking ? null : (
              <button type="button" className={pillCls(solid)} onClick={() => startBooking()}>
                Book a pickup
              </button>
              )
            ) : (
              <Link
                href={ROUTES.signIn}
                // not on the login page itself
                className={cx(pillCls(solid), "max-[720px]:hidden", pathname === ROUTES.signIn && "!hidden")}
              >
                Log in
              </Link>
            )}
            {signedIn ? (
              <button
                type="button"
                className={cx(menuBtnCls, menuTone)}
                aria-label={`Account menu for ${session.firstName}`}
                aria-haspopup="dialog"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen(true)}
              >
                <Icon name="menu" size={20} />
              </button>
            ) : (
              <button
                type="button"
                className={cx(menuBtnCls, menuTone)}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                aria-controls="site-drawer"
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="menu" size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        signedIn={signedIn}
        onAccount={() => {
          setMenuOpen(false);
          setAccountOpen(true);
        }}
      />

      {signedIn ? (
        <Suspense fallback={null}>
          <AccountDrawer
            data={session.profileResponse ?? {}}
            loading={session.isLoading}
            isOpen={accountOpen}
            onClose={() => setAccountOpen(false)}
            title=""
          />
        </Suspense>
      ) : null}
    </>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Drawer row: link or button with a chevron, sliding in when the drawer opens.
const drawerItemCls =
  "flex items-center justify-between border-b border-[rgba(27,34,48,0.1)] px-0.5 py-4 font-display text-[19px] font-semibold text-jdc-navy no-underline [transition:opacity_0.45s_ease,transform_0.45s_var(--jdc-ease),color_0.2s] after:h-2 after:w-2 after:rotate-45 after:border-r-2 after:border-t-2 after:border-current after:opacity-40 after:content-['']";
// Staggered entrance, like .drawerNav a:nth-child(n) in the old stylesheet.
const DELAYS = ["", "delay-[50ms]", "delay-100", "delay-150", "delay-200", "delay-[250ms]"];

function MobileDrawer({ open, onClose, pathname, signedIn, onAccount }) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  // Close when the route changes (a link inside was followed).
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll(FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  // Scroll lock + focus management.
  useEffect(() => {
    if (!open) return undefined;
    lastFocused.current = document.activeElement;
    lockPageScroll(true, "site-menu");
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector(FOCUSABLE)?.focus();
    }, 50);
    return () => {
      window.clearTimeout(t);
      lockPageScroll(false, "site-menu");
      lastFocused.current?.focus?.();
    };
  }, [open]);

  const navItem = (i, current) =>
    cx(
      drawerItemCls,
      "hover:text-jdc-blue",
      current && "text-jdc-blue",
      open ? cx("transform-none opacity-100", DELAYS[i]) : "translate-x-5 opacity-0"
    );

  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-0 z-jdc-menu bg-jdc-scrim opacity-0 transition-opacity duration-[350ms]",
        open && "pointer-events-auto opacity-100"
      )}
      aria-hidden={!open}
      inert={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="site-drawer"
        ref={panelRef}
        className={cx(
          "thin-scroll absolute inset-y-0 right-0 flex w-[min(300px,78vw)] max-[720px]:w-[max(270px,72vw)] max-[720px]:max-w-[320px] flex-col overflow-y-auto border-l border-white/60 bg-[linear-gradient(180deg,#EEF1F6_0%,#DDE2EC_100%)] px-[22px] pb-[30px] pt-5 text-jdc-navy transition-transform duration-[440ms] ease-jdc",
          open ? "transform-none" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onKeyDown={onKeyDown}
      >
        <div className="mb-2.5 flex items-center justify-between border-b border-[rgba(27,34,48,0.12)] pb-[18px]">
          <span className="whitespace-nowrap font-display text-[17px] font-extrabold tracking-[0.14em] max-[720px]:text-[14px] max-[720px]:tracking-[0.1em] [&_b]:font-extrabold [&_b]:text-jdc-blue">
            JUST <b>DRY</b> CLEANS
          </span>
          <button
            type="button"
            className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[50%] border border-[rgba(27,34,48,0.22)] bg-white/40 text-jdc-navy transition-[background] duration-200 hover:bg-white/75"
            aria-label="Close menu"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <nav className="flex flex-col" aria-label="Mobile">
          <Link
            href={ROUTES.home}
            className={navItem(0, pathname === "/")}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>
          {MAIN_NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={navItem(i + 1, pathname === item.href)}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {signedIn ? (
            <button
              type="button"
              className={cx(
                drawerItemCls,
                "w-full cursor-pointer border-0 border-b bg-none text-left",
                open ? "transform-none opacity-100 delay-300" : "translate-x-5 opacity-0"
              )}
              onClick={onAccount}
            >
              My account
            </button>
          ) : pathname === ROUTES.signIn ? null : (
            // no "Log in" item while already on the login page
            <Link href={ROUTES.signIn} className={navItem(MAIN_NAV.length + 1, false)}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
