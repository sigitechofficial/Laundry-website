"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "../ds/cx";
import { lockPageScroll } from "../../utilities/scrollLock";
import { BTN } from "./ui";
import ProtoIcon from "../proto/ProtoIcon";

// Centred dialog on desktop, bottom sheet on phones.
const SHEET = "fixed inset-0 z-[1200] flex items-center justify-center p-6 max-[720px]:items-end max-[720px]:p-0";
const OVERLAY = "absolute inset-0 bg-[rgba(15,20,28,0.5)] opacity-0 transition-opacity duration-[250ms]";
const PANEL =
  "relative flex h-[min(640px,calc(100vh-48px))] max-h-[min(680px,calc(100vh-48px))] w-full max-w-[520px] flex-col rounded-[22px] bg-white opacity-0 [box-shadow:0_16px_40px_rgba(15,20,28,0.14)] [transform:translateY(12px)_scale(0.98)] [transition:opacity_0.25s,transform_0.25s] max-[720px]:h-[86vh] max-[720px]:max-h-none max-[720px]:max-w-none max-[720px]:rounded-[22px_22px_0_0] max-[720px]:opacity-100 max-[720px]:[box-shadow:0_-4px_20px_rgba(15,20,28,0.08)] max-[720px]:[transform:translateY(100%)] max-[720px]:[transition:transform_0.3s_cubic-bezier(0.2,0.8,0.2,1)]";
const PANEL_OPEN = "opacity-100 [transform:none] max-[720px]:[transform:none]";
const GRAB =
  "hidden max-[720px]:mx-auto max-[720px]:mb-0 max-[720px]:mt-2.5 max-[720px]:block max-[720px]:h-[5px] max-[720px]:w-10 max-[720px]:rounded-[3px] max-[720px]:bg-[#D5DAE3]";
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
  const [shown, setShown] = useState(false); // drives .is-open (animation)
  const [mounted, setMounted] = useState(false);
  const [pickDay, setPickDay] = useState("");
  const [pickStart, setPickStart] = useState("");
  const timesRef = useRef(null);
  const daysRef = useRef(null);

  const times = pickDay ? timesFor(pickDay) || [] : [];
  const pickSlot = times.find((t) => t?.start === pickStart) || null;

  useEffect(() => {
    if (open) {
      const d = value?.date && days.some((x) => x.date === value.date) ? value.date : days[0]?.date || "";
      setPickDay(d);
      const ts = d ? timesFor(d) || [] : [];
      setPickStart(ts.some((t) => t?.start === value?.start) ? value.start : ts[0]?.start || "");
      setMounted(true);
      lockPageScroll(true);
      const r = requestAnimationFrame(() => {
        setShown(true);
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
    }
    setShown(false);
    lockPageScroll(false);
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => () => {
    lockPageScroll(false);
  }, []);

  const label = (t) => `${fmt(t.start)} – ${fmt(t.end)}`;
  const off = offset(pickDay);
  const sum = pickDay
    ? `${slotNiceDay(pickDay)}${off > 1 ? "" : ` · ${slotDayLabel(pickDay)}`}${pickSlot ? ` · ${label(pickSlot)}` : ""}`
    : "";

  return (
    <div className={cx(SHEET, (!mounted && !open) && "hidden")} hidden={!mounted && !open}>
      <div className={cx(OVERLAY, shown && "opacity-100")} onClick={onClose} />
      <div className={cx(PANEL, shown && PANEL_OPEN)} role="dialog" aria-modal="true" aria-labelledby="slotTitle">
        <span className={GRAB} aria-hidden="true" />
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
                <p className="m-0 max-w-[320px] text-[14px] leading-[1.5] text-jdc-muted">
                  We don&rsquo;t have any free slots for this address right now. Please try again later or contact us.
                </p>
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
      </div>
    </div>
  );
}
