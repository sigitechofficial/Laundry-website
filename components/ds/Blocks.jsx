import Link from "next/link";
import Icon from "./Icon";
import { cx } from "./cx";

/** Centred or left-aligned section heading with optional lead. */
export function PageHead({ id, title, lead, center = false, className }) {
  return (
    <div
      className={cx(
        "mb-8 ml-0 mr-0 mt-0 max-w-[640px] max-[720px]:mb-6",
        center && "mx-auto text-center",
        className
      )}
    >
      <h2
        id={id}
        className="m-0 font-display text-jdc-h2 font-bold leading-[1.08] tracking-[-0.02em] text-jdc-navy [&_em]:not-italic"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mb-0 mt-3.5 text-jdc-lg text-jdc-muted max-[720px]:text-[16px]">{lead}</p>
      ) : null}
    </div>
  );
}

/** Rounded icon square used in cards and steps. Grey, like the account menu tiles. */
export function IconTile({ name, size = 26, tone = "outline", className }) {
  return (
    <span
      className={cx(
        "flex h-[58px] w-[58px] flex-none items-center justify-center rounded-2xl border-[1.5px] border-jdc-line bg-jdc-white text-[#6B7385]",
        tone === "tint" && "border-transparent bg-[#F1F3F7]",
        className
      )}
    >
      <Icon name={name} size={size} />
    </span>
  );
}

/** Small glass chips under a PageHero heading. */
export function HeroChips({ items }) {
  return (
    <ul className="m-0 mt-7 flex list-none flex-wrap gap-2.5 p-0 max-[720px]:mt-[22px] max-[720px]:gap-2">
      {items.map((c) => (
        <li
          key={c.label}
          className="inline-flex h-10 items-center gap-2 rounded-jdc-pill border border-white/[0.22] bg-white/10 pl-3 pr-4 text-[14.5px] font-semibold text-jdc-white backdrop-blur-[6px] max-[720px]:h-9 max-[720px]:pl-2.5 max-[720px]:pr-[13px] max-[720px]:text-[13.5px] [&>svg]:flex-none [&>svg]:text-jdc-sky"
        >
          <Icon name={c.icon} size={18} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}

/** Grid of icon + title + text cards. */
export function FeatureGrid({ items, columns = 3, className }) {
  return (
    <ul
      className={cx(
        "m-0 grid list-none grid-cols-[repeat(3,minmax(0,1fr))] gap-6 p-0 max-[1080px]:grid-cols-[1fr_1fr] max-[720px]:grid-cols-[1fr] max-[720px]:gap-3",
        columns === 2 && "grid-cols-[repeat(2,minmax(0,1fr))] max-[1080px]:grid-cols-[repeat(2,minmax(0,1fr))]",
        className
      )}
    >
      {items.map((f) => (
        <li
          key={f.title}
          className="grid grid-cols-[auto_1fr] [align-items:start] gap-x-4 gap-y-0.5 rounded-jdc-lg border border-jdc-line bg-jdc-white px-6 py-[22px] max-[720px]:p-[18px] [&>span]:row-[1/span_2] max-[720px]:[&>span]:h-[50px] max-[720px]:[&>span]:w-[50px]"
        >
          <IconTile name={f.icon} tone="tint" />
          <h3 className="mb-1.5 mt-0 font-display text-[20px] text-jdc-navy max-[720px]:mb-1 max-[720px]:text-[18px]">{f.title}</h3>
          <p className="m-0 text-[16px] text-jdc-muted max-[720px]:text-[15px]">{f.body}</p>
        </li>
      ))}
    </ul>
  );
}

const linkCardCls =
  "flex w-full cursor-pointer items-center gap-4 rounded-[20px] border border-jdc-line bg-jdc-white p-[22px] text-left text-inherit no-underline [transition:border-color_0.2s,box-shadow_0.2s] hover:border-jdc-line-strong max-[720px]:px-[18px] max-[720px]:py-4";

/** Clickable card: icon, title, short description. */
export function LinkCard({ href, icon, title, body, external = false, onClick }) {
  const inner = (
    <>
      <IconTile name={icon} tone="tint" />
      <span>
        <strong className="block font-display text-[18px] text-jdc-navy">{title}</strong>
        {body ? <small className="mt-0.5 block text-[15px] text-jdc-muted">{body}</small> : null}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={linkCardCls} onClick={onClick}>
        {inner}
      </button>
    );
  }
  if (external) {
    return (
      <a href={href} className={linkCardCls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={linkCardCls}>
      {inner}
    </Link>
  );
}

/** Ticked list. */
export function CheckList({ items, className }) {
  return (
    <ul className={cx("m-0 mt-6 grid list-none gap-3.5 p-0 max-[720px]:gap-3", className)}>
      {items.map((text) => (
        <li
          key={text}
          className="flex gap-3 text-[17px] text-jdc-text max-[720px]:text-[16px] [&>svg]:mt-[3px] [&>svg]:flex-none [&>svg]:text-jdc-blue"
        >
          <Icon name="check" size={20} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Navy closing call-to-action band. */
export function CtaBand({ titleA, titleB, body, actions }) {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-x-10 gap-y-7 overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,var(--jdc-navy)_0%,var(--jdc-navy-2)_100%)] px-14 py-[52px] text-jdc-white before:pointer-events-none before:absolute before:right-[-110px] before:top-[-130px] before:h-[420px] before:w-[420px] before:rounded-[50%] before:border-2 before:border-white/10 before:content-[''] after:pointer-events-none after:absolute after:right-[-30px] after:top-[-50px] after:h-[280px] after:w-[280px] after:rounded-[50%] after:border-2 after:border-[rgba(2,120,254,0.4)] after:content-[''] max-[1080px]:px-9 max-[1080px]:py-10 max-[720px]:rounded-3xl max-[720px]:px-6 max-[720px]:py-[30px] [&>*]:relative [&>*]:z-[1]">
      <div>
        <h2 className="m-0 max-w-[560px] font-display text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.08] tracking-[-0.02em]">
          {titleA} {titleB ? <span>{titleB}</span> : null}
        </h2>
        {body ? (
          <p className="mb-0 mt-3 max-w-[520px] text-[17px] text-white/80 max-[720px]:text-[15.5px]">{body}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-3 max-[720px]:w-full max-[720px]:[&>*]:flex-[1_1_100%]">{actions}</div>
      ) : null}
    </div>
  );
}

/** Arrow text link. */
export function ArrowLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[16px] font-bold text-jdc-blue no-underline transition-[gap] duration-200 hover:gap-3"
    >
      {children} <Icon name="arrowRight" size={16} />
    </Link>
  );
}
