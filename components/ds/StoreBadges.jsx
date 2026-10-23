import { APP_LINKS } from "./siteConfig";
import { cx } from "./cx";

// Black store badge. Text stays white even inside the footer, whose link
// colour (and blue hover) would otherwise apply.
const badgeCls =
  "inline-flex h-[50px] items-center gap-2.5 rounded-jdc-sm border border-[#111] bg-[#111] px-4 text-[#fff] no-underline transition-[background] duration-200 hover:bg-[#000] hover:text-[#fff] focus-visible:text-[#fff] max-[720px]:h-[46px] max-[720px]:px-[13px] [&>svg]:h-[22px] [&>svg]:w-[22px] [&>svg]:flex-none";
const labelCls = "flex flex-col text-left leading-[1.08]";
const smallCls = "text-[9.5px] uppercase tracking-[0.03em] text-[#d5d9e2]";
const strongCls = "text-[14px] font-bold";

export function StoreBadges({ className }) {
  return (
    <div className={cx("flex flex-wrap gap-2.5 max-[720px]:justify-center", className)}>
      <a href={APP_LINKS.appStore} className={badgeCls} aria-label="Download on the App Store">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        <span className={labelCls}>
          <small className={smallCls}>Download on the</small>
          <strong className={strongCls}>App Store</strong>
        </span>
      </a>
      <a href={APP_LINKS.googlePlay} className={badgeCls} aria-label="Get it on Google Play">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="#4285F4" d="M3.6 1.9 13.7 12 3.6 22.1c-.37-.2-.6-.6-.6-1.07V2.97c0-.47.23-.87.6-1.07z" />
          <path fill="#34A853" d="M3.6 1.9c.36-.2.82-.21 1.25.03L17.1 8.6 13.7 12z" />
          <path fill="#EA4335" d="M3.6 22.1 13.7 12l3.4 3.4-12.25 6.670c-.43.24-.89.23-1.25.03z" />
          <path fill="#FBBC04" d="m17.1 8.6 3.8 2.07c1.04.57 1.04 2.09 0 2.66l-3.8 2.07L13.7 12z" />
        </svg>
        <span className={labelCls}>
          <small className={smallCls}>Get it on</small>
          <strong className={strongCls}>Google Play</strong>
        </span>
      </a>
    </div>
  );
}

export function SocialIcon({ name, size = 17 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" };
  switch (name) {
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5v.01" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="currentColor">
          <path d="M16 3c.3 2 1.5 3.6 3.6 3.9V10c-1.4 0-2.7-.45-3.6-1.1v6.3c0 3-2.45 5.4-5.4 5.4S5.3 18.2 5.3 15.2c0-2.85 2.2-5.2 5-5.4v3.2c-1.05.2-1.85 1.05-1.85 2.2 0 1.25 1 2.25 2.25 2.25s2.2-1 2.2-2.25V3H16z" />
        </svg>
      );
    default:
      return null;
  }
}
