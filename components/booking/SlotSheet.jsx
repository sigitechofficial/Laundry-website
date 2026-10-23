"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "../ds/cx";
import Dialog from "../ds/Dialog";
import { BTN } from "./ui";
import ProtoIcon from "../proto/ProtoIcon";

// Centred popup on desktop, bottom sheet on phones (components/ds/Dialog). Fixed size,
// so changing day never resizes it.
const PANEL = "h-[min(640px,calc(100vh-48px))] max-h-[min(680px,calc(100vh-48px))] max-w-[520px] max-[720px]:h-[86vh] max-[720px]:max-h-[86vh]";
const HEAD = "flex items-center justify-between px-[22px] pb-1.5 pt-5 max-[720px]:px-5 max-[720px]:pb-1 max-[720px]:pt-3";
const CLOSE = "h-9 w-9 cursor-pointer rounded-[50%] border-0 bg-jdc-mist text-[22px] leading-none text-jdc-navy";
const BODY =
  "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain px-[22px] pb-0 pt-1.5 max-[720px]:px-5 max-[720px]:pt-1";
const LBL = "mx-0 mb-2.5 mt-3.5 text-[13.5px] font-semibold text-jdc-navy";
const DAYS =
  "flex snap-x snap-proximity gap-2 overflow-x-auto px-0.5 pb-2 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const DAY =
  "flex w-16 flex-none cursor-pointer snap-start flex-col items-center gap-0.5 rounded-[14px] border border-jdc-line bg-white px-0 py-[9px] text-jdc-navy hover:border-[#C5CEDD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jdc-blue";
// selected day / time: light blue tint with blue text (same as "Add a note for the driver")
const DAY_ON = "border-jdc-blue bg-jdc-blue-tint text-jdc-blue hover:border-jdc-blue";
const DAY_SMALL = "text-[11.5px] leading-[1.2] text-jdc-muted";
const TIMES =
  "-mx-[22px] flex min-h-0 flex-1 grid-cols-[repeat(3,minmax(0,1fr))] flex-col gap-2.5 max-[720px]:grid-cols-[repeat(2,minmax(0,1fr))] thin-scroll overflow-y-auto overscroll-contain px-[22px] pb-4 pt-0.5 max-[720px]:-mx-5 max-[720px]:px-5 max-[720px]:pb-3.5";
const TIME =
  "flex h-[52px] flex-none cursor-pointer items-center justify-center rounded-[14px] border border-jdc-line bg-white px-4 py-0 text-center font-display text-[16px] font-semibold tracking-[0.01em] text-jdc-navy tabular-nums hover:border-[#C5CEDD] hover:bg-white focus:[outline:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jdc-blue";
const TIME_ON =
  "border-jdc-blue bg-jdc-blue-tint text-jdc-blue hover:border-jdc-blue hover:bg-jdc-blue-tint";
const FOOT =
  "mt-0 flex items-center justify-between gap-3.5 border-t border-jdc-line px-[22px] pb-5 pt-3.5 max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:gap-2.5 max-[720px]:px-5 max-[720px]:pb-[calc(16px+env(safe-area-inset-bottom))] max-[720px]:pt-3";
const OK = "h-12 flex-none rounded-xl px-[26px] disabled:cursor-not-allowed disabled:opacity-50 max-[720px]:w-full";

/*
 * Date + time-slot picker, prototype markup (pages.js openSheet → .slot-sheet):
 * centred modal on desktop, bottom sheet on phones.
 * Days/times come from the booking-slots API instead of the prototype's
 * generated hours. Styled with Tailwind (classes below).
 *
 * days:  [{ date: "YYYY-MM-DD", timeSlots: [{ start, end }] }]
 * timesFor(date) → the selectable slots for that day
 * fmt(time) → "HH:MM" label
 */

const DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
}
function offset(iso) {
  const d = parse(iso);
  if (!d) return 99;
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d - t) / 86400000);
}
export function slotDayLabel(iso) {
  const d = parse(iso);
  return d ? `${DN[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}` : "";
}
export function slotNiceDay(iso) {
  const off = offset(iso);
  return off === 0 ? "Today" : off === 1 ? "Tomorrow" : slotDayLabel(iso);
}

export default function SlotSheet({ open, title, days = [], timesFor, value, fmt, onConfirm, onClose, loading = false }) {
  const [pickDay, setPickDay] = useState("");
  const [pickStart, setPickStart] = useState("");
  const timesRef = useRef(null);
  const daysRef = useRef(null);

  const times = pickDay ? timesFor(pickDay) || [] : [];
  const pickSlot = times.find((t) => t?.start === pickStart) || null;

  // On open: start from the current choice, show it, and focus the selected time.
  useEffect(() => {
    if (!open) return undefined;
    const d = value?.date && days.some((x) => x.date === value.date) ? value.date : days[0]?.date || "";
    setPickDay(d);
    const ts = d ? timesFor(d) || [] : [];
    setPickStart(ts.some((t) => t?.start === value?.start) ? value.start : ts[0]?.start || "");
    const r = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        daysRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
        const t = timesRef.current?.querySelector('[aria-selected="true"]') || timesRef.current?.querySelector("button");
        if (t && timesRef.current) {
          t.focus({ preventScroll: true });
          timesRef.current.scrollTop = Math.max(0, t.offsetTop - timesRef.current.offsetTop - 40);
        }
      });
    });
    return () => cancelAnimationFrame(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const label = (t) => `${fmt(t.start)} – ${fmt(t.end)}`;
  const off = offset(pickDay);
  const sum = pickDay
    ? `${slotNiceDay(pickDay)}${off > 1 ? "" : ` · ${slotDayLabel(pickDay)}`}${pickSlot ? ` · ${label(pickSlot)}` : ""}`
    : "";

  return (
    <Dialog open={open} onClose={onClose} labelledBy="slotTitle" className={PANEL}>
        <div className={HEAD}>
          <h2 id="slotTitle" className="m-0 font-display text-[20px] font-bold text-jdc-navy">{title}</h2>
          <button type="button" className={CLOSE} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={BODY}>
          {/* Nothing to pick yet: say why instead of showing an empty sheet */}
          {loading || !days.length ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-14 text-center" role="status">
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#F1F3F7] text-jdc-navy">
                <ProtoIcon name="calendar" size={22} />
              </span>
              <b className="font-display text-[17px] text-jdc-navy">
                {loading ? "Finding available slots…" : "No slots available"}
              </b>
              {loading ? null : (
                <>
                  <p className="m-0 max-w-[320px] text-[14px] leading-[1.5] text-jdc-muted">
                    We don&rsquo;t have any free slots for this address right now. Please try again later or contact us.
                  </p>
                  <a
                    href="/contact-us"
                    className="mt-2 inline-flex h-11 items-center rounded-full border border-jdc-line bg-white px-5 text-[14.5px] font-bold text-jdc-navy no-underline hover:border-[#C5CEDD]"
                  >
                    Contact us
                  </a>
                </>
              )}
            </div>
          ) : (
          <>
          <p className={LBL}>Choose a day</p>
          <div className={DAYS} role="listbox" aria-label="Day" ref={daysRef}>
            {days.map((d) => {
              const dt = parse(d.date);
              const o = offset(d.date);
              const on = d.date === pickDay;
              return (
                <button
                  key={d.date}
                  type="button"
                  className={cx(DAY, on && DAY_ON)}
                  role="option"
                  aria-selected={on ? "true" : "false"}
                  onClick={() => {
                    setPickDay(d.date);
                    const ts = timesFor(d.date) || [];
                    if (!ts.some((t) => t?.start === pickStart)) setPickStart(ts[0]?.start || "");
                    requestAnimationFrame(() => {
                      const t = timesRef.current?.querySelector('[aria-selected="true"]');
                      if (timesRef.current)
                        timesRef.current.scrollTop = t ? Math.max(0, t.offsetTop - timesRef.current.offsetTop - 40) : 0;
                    });
                  }}
                >
                  <small className={cx(DAY_SMALL, on && "text-jdc-blue")}>{o === 0 ? "Today" : o === 1 ? "Tmrw" : dt ? DN[dt.getDay()] : ""}</small>
                  <b className="font-display text-[20px] leading-[1.15]">{dt ? dt.getDate() : ""}</b>
                  <small className={cx(DAY_SMALL, on && "text-jdc-blue")}>{dt ? MN[dt.getMonth()] : ""}</small>
                </button>
              );
            })}
          </div>
          <p className={LBL}>
            Choose a time slot <span className="ml-1.5 font-medium text-jdc-muted">1-hour window</span>
          </p>
          <div className={TIMES} role="listbox" aria-label="Time slot" tabIndex={-1} ref={timesRef}>
            {!times.length ? (
              <p className="m-0 rounded-[14px] border border-dashed border-jdc-line px-4 py-6 text-center text-[14px] text-jdc-muted" role="status">
                No times left on this day. Please pick another day.
              </p>
            ) : null}
            {times.map((t) => {
              const on = t.start === pickStart;
              return (
                <button
                  key={`${t.start}-${t.end}`}
                  type="button"
                  className={cx(TIME, on && TIME_ON)}
                  role="option"
                  aria-selected={on ? "true" : "false"}
                  onClick={() => setPickStart(t.start)}
                >
                  {label(t)}
                </button>
              );
            })}
          </div>
          </>
          )}
        </div>
        <div className={FOOT}>
          <span className="min-w-0 text-[14px] font-semibold text-jdc-navy max-[720px]:text-center">{sum}</span>
          <button
            type="button"
            className={cx(BTN, OK)}
            disabled={!pickSlot}
            onClick={() => {
              const d = days.find((x) => x.date === pickDay);
              onConfirm?.(d, pickSlot);
            }}
          >
            Confirm
          </button>
        </div>
    </Dialog>
  );
}
