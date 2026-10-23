"use client";

import Link from "next/link";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "./cx";

/*
 * Empty / nothing-here state used across the site: icon, title, short text and
 * up to two next steps. Actions: { label, href } for a link, or { label, onClick };
 * the first one is the main (blue) button.
 */
const BTN =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-5 text-[14.5px] font-bold no-underline transition-colors";
const MAIN = "bg-jdc-blue text-white hover:bg-jdc-blue-dark";
const SECOND = "border border-jdc-line bg-white text-jdc-navy hover:border-[#C5CEDD]";

export default function EmptyState({ icon = "checkCircle", title, text, actions = [], className, compact = false }) {
  return (
    <div
      className={cx(
        "grid justify-items-center gap-2 rounded-[18px] border border-dashed border-jdc-line bg-white text-center",
        compact ? "px-5 py-7" : "px-6 py-10",
        className
      )}
    >
      <span className="mb-1 flex size-[52px] items-center justify-center rounded-[14px] bg-[#F1F3F7] text-jdc-navy">
        <ProtoIcon name={icon} size={22} />
      </span>
      {title ? <h2 className="m-0 font-display text-[20px] font-bold text-jdc-navy">{title}</h2> : null}
      {text ? <p className="m-0 max-w-[420px] text-[14.5px] leading-normal text-jdc-muted">{text}</p> : null}
      {actions.length ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          {actions.map((a, i) => {
            const cls = cx(BTN, i === 0 ? MAIN : SECOND);
            return a.href ? (
              <Link key={a.label} href={a.href} className={cls}>
                {a.label}
              </Link>
            ) : (
              <button key={a.label} type="button" className={cls} onClick={a.onClick}>
                {a.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
