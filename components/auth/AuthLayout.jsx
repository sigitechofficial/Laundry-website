"use client";

import Image from "next/image";
import Icon from "../ds/Icon";
import PageShell from "../ds/PageShell";

const POINTS = [
  "Free collection and delivery",
  "One-hour windows, evenings and weekends",
  "Live tracking from pickup to delivery",
];

/**
 * Class strings for auth screens (formerly Auth.module.css), shared with the
 * sign-in page through the `authStyles` export.
 */
const styles = {
  form: "grid gap-[14px]",
  row: "flex justify-end items-center gap-3 m-[-2px_0_2px]",
  social: "grid gap-[10px] min-[1081px]:grid-cols-3",
  otpArt: "flex justify-center m-[4px_0_8px] [&_img]:max-h-[120px] [&_img]:w-auto",
  resend:
    "m-[4px_0_0] text-center text-[15px] font-semibold text-jdc-muted [&_button]:p-0 [&_button]:[border:0] [&_button]:text-jdc-blue [&_button]:cursor-pointer",
  loading: "flex justify-center py-10 px-0",
  // content of the account-link popup (the popup itself is components/ds/Dialog)
  modal:
    "p-7 max-[720px]:px-5 max-[720px]:pb-[calc(24px+env(safe-area-inset-bottom))] [&_h2]:m-[0_0_8px] [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:text-jdc-navy [&_p]:m-[0_0_18px] [&_p]:text-[15px] [&_p]:text-jdc-muted",
  modalActions: "flex gap-[10px] mt-4",
};

/**
 * Split authentication layout: photo panel + form panel, inside the
 * standard site shell.
 *
 * @param {() => void} [onBack] renders a back button in the form panel
 */
export default function AuthLayout({ children, onBack, backLabel = "Go back" }) {
  return (
    <PageShell header="solid">
      <section className="relative overflow-hidden pt-14 px-jdc-gutter pb-[72px] min-[1081px]:py-6 bg-[linear-gradient(180deg,#e9f1ff_0%,var(--jdc-paper)_70%)] before:hidden before:content-[''] before:absolute before:top-[-130px] before:right-[-70px] before:w-[440px] before:h-[440px] before:rounded-[50%] before:bg-[radial-gradient(circle,rgba(2,120,254,0.16),transparent_70%)] before:pointer-events-none max-[720px]:p-0 max-[720px]:bg-none max-[720px]:bg-jdc-white">
        <div className="relative z-[1] grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] max-w-[1040px] min-h-[640px] min-[1081px]:h-[calc(100svh-var(--jdc-header-h)-48px)] min-[1081px]:min-h-[560px] min-[1081px]:max-h-[780px] mx-auto my-0 overflow-hidden bg-jdc-white border border-jdc-line rounded-jdc-xl max-[1080px]:grid-cols-[1fr] max-[1080px]:min-h-0 max-[720px]:[border:0] max-[720px]:rounded-none">
          <aside
            className="relative overflow-hidden bg-jdc-navy [&_img]:object-cover after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(27,34,48,0.28)_0%,rgba(27,34,48,0.12)_38%,rgba(27,34,48,0.55)_70%,rgba(27,34,48,0.92)_100%)] max-[1080px]:hidden"
            aria-hidden="true"
          >
            <Image src="/jdc/media/617af81a705b.jpg" alt="" fill priority sizes="(max-width: 1080px) 100vw, 500px" />
            <div className="relative z-[2] h-full flex flex-col justify-end gap-6 p-10 text-jdc-white">
              <div>
                <p className="m-0 font-display font-extrabold text-[34px] leading-[1.1] tracking-[-0.02em] [&_span]:block">
                  Laundry day, <span>sorted.</span>
                </p>
                <p className="m-[10px_0_0] text-[16px] leading-[1.5] text-[rgba(255,255,255,0.88)]">Collected, cleaned and delivered to your door across London.</p>
              </div>
              <ul className="list-none m-0 pt-[18px] px-0 pb-0 grid gap-[10px] border-t border-t-[rgba(255,255,255,0.18)] [&_svg]:flex-none [&_svg]:text-jdc-sky">
                {POINTS.map((p) => (
                  <li key={p} className="flex gap-[10px] items-center text-[15px] text-[rgba(255,255,255,0.92)]">
                    <Icon name="checkBold" size={18} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="relative flex flex-col justify-center [justify-content:safe_center] overflow-y-auto pt-[76px] px-12 pb-12 [@media(min-width:1081px)_and_(max-height:860px)]:pb-6 [@media(min-width:1081px)_and_(max-height:860px)]:pt-16 max-[720px]:pt-16 max-[720px]:px-jdc-gutter max-[720px]:pb-10">
            {onBack ? (
              <button
                type="button"
                className="absolute top-5 left-5 w-10 h-10 rounded-[50%] border border-jdc-line bg-jdc-white text-jdc-navy flex items-center justify-center cursor-pointer [transition:border-color_0.2s,background_0.2s] hover:border-jdc-line-strong hover:bg-jdc-paper max-[720px]:top-[14px] max-[720px]:left-jdc-gutter"
                onClick={onBack}
                aria-label={backLabel}
              >
                <Icon name="caretRight" size={16} className="[transform:rotate(180deg)]" />
              </button>
            ) : null}
            <div className="w-full max-w-[440px] mx-auto my-0">{children}</div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

/** Title + supporting line at the top of an auth step. */
export function AuthHeading({ title, sub }) {
  return (
    <header className="mb-[22px] [@media(min-width:1081px)_and_(max-height:860px)]:mb-4">
      <h1 className="m-0 font-display font-extrabold [font-size:clamp(26px,2.6vw,34px)] leading-[1.1] tracking-[-0.02em] text-jdc-navy">{title}</h1>
      {sub ? (
        <p className="m-[10px_0_0] text-[15.5px] leading-[1.55] text-jdc-muted [overflow-wrap:anywhere] [&_strong]:text-jdc-navy">{sub}</p>
      ) : null}
    </header>
  );
}

export function AuthDivider({ children = "or" }) {
  return (
    <div
      className="flex items-center gap-[14px] m-[22px_0_16px] [@media(min-width:1081px)_and_(max-height:860px)]:my-3 text-[13px] text-jdc-muted before:content-[''] before:flex-1 before:h-px before:bg-jdc-line after:content-[''] after:flex-1 after:h-px after:bg-jdc-line"
      role="separator"
    >
      <span>{children}</span>
    </div>
  );
}

/** "New here? Create an account" style line with an inline action. */
export function AuthAlt({ text, action, onAction }) {
  return (
    <p className="m-[22px_0_0] [@media(min-width:1081px)_and_(max-height:860px)]:mt-3.5 text-center text-[15px] text-jdc-muted [&_button]:p-0 [&_button]:[border:0] [&_button]:font-bold [&_button]:text-jdc-blue [&_button]:cursor-pointer [&_button:hover]:underline">
      {text}{" "}
      <button type="button" onClick={onAction}>
        {action}
      </button>
    </p>
  );
}

export function AuthLink({ children, onClick }) {
  return (
    <button type="button" className="p-0 [border:0] text-[14.5px] font-bold text-jdc-blue cursor-pointer hover:underline" onClick={onClick}>
      {children}
    </button>
  );
}

export function AuthFine({ children }) {
  return (
    <p className="m-[4px_0_0] text-center text-[12.5px] text-jdc-muted [&_a]:text-jdc-navy [&_a]:font-semibold [&_a]:underline">
      {children}
    </p>
  );
}

export { styles as authStyles };
