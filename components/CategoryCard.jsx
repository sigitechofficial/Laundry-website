import React from "react";
import ProtoIcon, { serviceIconName } from "./proto/ProtoIcon";
import { serviceCardChips } from "../utilities/serviceChips";
import { cx } from "./ds/cx";

/*
 * Service card on the Add services page (Tailwind).
 * Previous version: see git history (before the 2026 redesign)
 */

// Same badges as the prototype (by service name).
function badgeFor(name) {
  const n = String(name || "").toLowerCase().trim();
  if (n === "wash" || n.startsWith("wash, dry") || n === "wash & fold") return "Most popular";
  if (n.startsWith("dry clean")) return "Popular";
  return null;
}

const ICON_GREY = "text-[#8A93A6]";

export default function CategoryCard({ h, p, onClick, type, prefs }) {
  const added = type === "check";
  const chips = added ? serviceCardChips(prefs) : [];
  const badge = badgeFor(h);

  return (
    <button
      type="button"
      className="group flex cursor-pointer items-center gap-[18px] rounded-[20px] border-[1.5px] border-jdc-line bg-white px-6 py-[22px] text-left text-inherit [transition:border-color_0.2s,box-shadow_0.2s,transform_0.2s] hover:!border-[#C5CEDD] hover:![box-shadow:0_4px_14px_rgba(27,34,48,0.06)] hover:![transform:none] max-[720px]:min-h-[150px] max-[720px]:gap-3 max-[720px]:p-[18px]"
      onClick={onClick}
    >
      <span
        className={cx(
          "flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-jdc-paper [transition:background_0.2s,color_0.2s] group-hover:bg-jdc-mist group-hover:text-jdc-navy max-[720px]:h-[42px] max-[720px]:w-[42px]",
          ICON_GREY,
          added && "group-hover:bg-jdc-paper group-hover:text-[#8A93A6]"
        )}
      >
        <ProtoIcon name={serviceIconName(h)} size={26} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 max-[720px]:min-w-0 max-[720px]:flex-row max-[720px]:flex-nowrap max-[720px]:gap-1.5">
          <b className="block font-display text-[19px] tracking-[-0.01em] text-jdc-navy max-[720px]:min-w-0 max-[720px]:flex-[0_1_auto] max-[720px]:overflow-hidden max-[720px]:text-ellipsis max-[720px]:whitespace-nowrap max-[720px]:text-[15px]">
            {h}
          </b>
          {badge ? (
            <span className="m-0 inline-flex h-[22px] items-center self-center rounded-jdc-pill bg-jdc-mist px-2.5 text-[11.5px] font-bold uppercase tracking-[0.02em] text-jdc-muted max-[720px]:h-[17px] max-[720px]:flex-none max-[720px]:px-1.5 max-[720px]:text-[8.5px]">
              {badge}
            </span>
          ) : null}
        </span>
        {p ? (
          <small className="mx-0 mb-0 mt-1 block text-[14px] leading-[1.5] text-jdc-muted max-[720px]:overflow-hidden max-[720px]:[-webkit-box-orient:vertical] max-[720px]:[-webkit-line-clamp:2] max-[720px]:[display:-webkit-box]">
            {p}
          </small>
        ) : null}
        <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="mt-0 inline-block rounded-jdc-pill bg-none p-0 text-[13px] font-semibold text-jdc-muted">By item</span>
        </span>
        <span className={cx("mt-2.5 flex flex-wrap gap-1.5", (chips.length === 0) && "hidden")} hidden={chips.length === 0}>
          {chips.map((c) => (
            <span
              key={c}
              className="inline-flex h-auto min-h-[24px] items-center whitespace-normal rounded-jdc-pill bg-jdc-mist px-2.5 py-1 text-[12px] font-semibold leading-[1.35] text-jdc-navy"
            >
              {c}
            </span>
          ))}
        </span>
      </span>
      <span className="flex-none">
        <span
          className={cx(
            "flex h-[50px] w-[50px] items-center justify-center rounded-[50%] bg-jdc-navy text-white [transition:background_0.2s,transform_0.2s] group-hover:bg-jdc-navy-2 group-hover:![transform:none] max-[720px]:h-11 max-[720px]:w-11",
            added && "hidden"
          )}
          aria-hidden="true"
        >
          <ProtoIcon name="plus" size={22} />
        </span>
        <span
          className={cx(
            "hidden h-[50px] w-[50px] items-center justify-center rounded-[50%] bg-jdc-blue text-white [transition:background_0.2s,transform_0.2s] max-[720px]:h-11 max-[720px]:w-11",
            added && "flex"
          )}
          aria-hidden="true"
        >
          <ProtoIcon name="check" size={22} />
        </span>
      </span>
    </button>
  );
}
