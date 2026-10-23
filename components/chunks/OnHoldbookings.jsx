"use client";

/*
 * Profile → On hold bookings, built to the prototype (web/account-on-hold.html):
 *  - a card per order on hold: each flagged item with the team's note and
 *    "Remove item" / "Clean anyway", plus a confirm popup (bottom sheet on phones);
 *  - booking details beside the list on wide screens, a sheet on smaller ones.
 *
 * Backend (customer API):
 *  - getOnHoldBookingsForCustomer → orders on hold (status 18) with their flags
 *    (OnHoldConfirmations: id, onHoldImg, description, customerResponse);
 *  - getOnHoldBookings/:id → the same flags with service + item names;
 *  - updateCustomerResponseForOnHoldBooking → { bookingId, timeZone, responses:
 *    [{ onHoldId, customerResponse, note? }] }. customerResponse true = clean anyway,
 *    false = don't clean it (we add the note "Remove this item from my order").
 *    Answering moves the order on (status 22), so all flags of an order are sent
 *    together once each one has an answer.
 *
 * Test data: add &demo=1 to the URL on a local dev server to see two sample
 * orders on hold (the prototype's), without touching the backend.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/react";
import {
  useBookingDetailByIdQuery,
  useGetOnHoldBookingByIdQuery,
  useGetOnHoldBookingsQuery,
  useUpdateOnHoldBookingMutation,
} from "@/app/store/services/api";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "../ds/cx";
import { BASE_URL } from "../../utilities/URL";
import Dialog from "../ds/Dialog";
import { DetailsSkeleton, OrderCardSkeleton } from "../ds/Skeleton";
import EmptyState from "../ds/EmptyState";

/* ---------- formatting ---------- */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function parseDay(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ""));
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
const fmtDay = (v) => {
  const d = parseDay(v);
  return d ? `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}` : "";
};
const fmtTime = (v) => (/^\d{1,2}:\d{2}/.test(String(v || "")) ? String(v).slice(0, 5).padStart(5, "0") : "");
const fmtRange = (a, b) => [fmtTime(a), fmtTime(b)].filter(Boolean).join(" – ");
const fmtPlaced = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const imgUrl = (p) => (!p ? null : /^https?:|^data:/.test(p) ? p : BASE_URL + String(p).replace(/^\//, ""));

/* ---------- prototype sample orders (demo=1) ---------- */
const DEMO_ORDERS = [
  {
    id: "demo-1", no: "1830-552190", placed: "19 Oct 2026 12:10",
    pickupDay: "Mon 19 Oct", pickupTime: "15:00 – 16:00", pickupHow: "Collect from me in person",
    deliveryDay: "Tue 20 Oct", deliveryTime: "17:00 – 18:00", deliveryHow: "Deliver to me in person",
    address: "[Customer address], London", frequency: "Just once", driverNote: "Please ring the top bell.",
    services: [
      { name: "Wash, Dry & Fold", prefs: ["Mixed wash", "40 °C", "Bio soap"], items: [{ name: "Shirt", qty: 1 }] },
      { name: "Dry Clean", prefs: ["Hang on hangers"], items: [{ name: "Leather jacket", qty: 1, flagId: "j1" }] },
    ],
    also: [{ name: "Shirt", qty: 1 }],
    flags: [
      { id: "j1", name: "Leather jacket", qty: 1, svc: "Dry Clean", at: "Mon 19 Oct, 16:40", photos: [null, null],
        issue: "This jacket has leather trim and sewn-on beads. Washing it could damage the leather or make the beads come off." },
    ],
    paid: { lines: [["Minimum order payment", "Applied to laundry subtotal", "£20.00"], ["Service fee", "", "£10.00"]], total: "£30.00" },
  },
  {
    id: "demo-2", no: "1827-410355", placed: "17 Oct 2026 08:30",
    pickupDay: "Sat 17 Oct", pickupTime: "10:00 – 11:00", pickupHow: "Collect from reception",
    deliveryDay: "Sun 18 Oct", deliveryTime: "16:00 – 17:00", deliveryHow: "Deliver to reception",
    address: "[Customer address], London", frequency: "Weekly", driverNote: "",
    services: [
      { name: "Wash, Dry & Fold", prefs: ["Whites", "60 °C", "Non-bio"], items: [{ name: "Bedsheet", qty: 2 }] },
      { name: "Dry Clean", prefs: ["Folded"], items: [{ name: "Silk dress", qty: 1, flagId: "d1" }] },
    ],
    also: [{ name: "Bedsheet", qty: 2 }],
    flags: [
      { id: "d1", name: "Silk dress", qty: 1, svc: "Dry Clean", at: "Sun 18 Oct, 11:05", photos: [null],
        issue: "There is a red wine stain on the front. Removing it may fade the colour of the silk." },
    ],
    paid: { lines: [["Minimum order payment", "Applied to laundry subtotal", "£20.00"], ["Service fee", "", "£10.00"]], total: "£30.00" },
  },
];

/* ---------- real data → the same shape as the sample orders ---------- */
function toOrder(booking, flagRows, detail) {
  const d = detail || {};
  const rows = flagRows?.length ? flagRows : booking?.OnHoldConfirmations || [];
  const flags = rows.map((r) => ({
    id: r.id,
    name: r?.subCategory?.name || r?.service?.name || "Item",
    qty: 1,
    svc: r?.service?.name || "",
    at: "",
    photos: r?.onHoldImg ? [imgUrl(r.onHoldImg)] : [],
    issue: r?.description || "Our team found a problem with this item.",
    answered: typeof r?.customerResponse === "boolean" ? (r.customerResponse ? "allow" : "remove") : null,
  }));
  const selected = Array.isArray(d.customerSelectedServices) ? d.customerSelectedServices : [];
  const bySvc = new Map();
  selected.forEach((it) => {
    const name = it?.service?.name || "Service";
    if (!bySvc.has(name)) bySvc.set(name, []);
    const item = it?.subCategory?.name || it?.category?.name;
    if (item) bySvc.get(name).push({ name: item, qty: Number(it?.items) || 1 });
  });
  const flaggedNames = new Set(flags.map((f) => f.name));
  const addr = d.pickupAddress || d.pickUpAddress || {};
  const symbol = d?.paymentSummary?.currencySymbol || d?.zone?.currencyUnitZ?.symbol || "£";
  const amount = Number.parseFloat(d.orderAmount ?? booking?.orderAmount);
  return {
    id: booking.id,
    no: booking.orderTrackId || d.orderTrackId || String(booking.id),
    placed: fmtPlaced(d.createdAt),
    pickupDay: fmtDay(booking.collectionDate),
    pickupTime: fmtRange(booking.collectionTimeFrom, booking.collectionTimeTo),
    pickupHow: booking.driverInstructionOptions || d.driverInstructionOptions || "",
    deliveryDay: fmtDay(booking.deliveryDate),
    deliveryTime: fmtRange(booking.deliveryTimeFrom, booking.deliveryTimeTo),
    deliveryHow: booking.driverInstructionOptions1 || d.driverInstructionOptions1 || "",
    address: [addr.streetAddress, addr.district, addr.postalcode || addr.postalCode].filter(Boolean).join(", "),
    frequency: d.frequency || "",
    driverNote: d.driverInstruction || "",
    services: [...bySvc.entries()].map(([name, items]) => ({ name, prefs: [], items })),
    also: selected
      .map((it) => ({ name: it?.subCategory?.name || it?.category?.name, qty: Number(it?.items) || 1 }))
      .filter((it) => it.name && !flaggedNames.has(it.name)),
    flags,
    paid: Number.isFinite(amount) ? { lines: [], total: `${symbol}${amount.toFixed(2)}` } : null,
  };
}

/* ---------- classes (prototype .hold-*, .dn-*, .od-*) ---------- */
const PILL =
  "inline-flex h-[26px] items-center gap-[7px] whitespace-nowrap rounded-full border border-jdc-line bg-[#F1F3F7] px-[11px] text-[11.5px] font-bold uppercase tracking-[0.06em] text-jdc-navy before:size-[7px] before:rounded-full before:bg-current before:content-['']";
const PILL_OK = "border-[#BFE6CF] bg-[#E7F6EE] text-[#1E8E5A]";
const WARN_IC = "flex size-8 flex-none items-center justify-center rounded-[10px] bg-[#F1F3F7] text-jdc-navy";
const BTN_X =
  "h-11 cursor-pointer rounded-xl border border-[#F3C7C3] bg-white text-[14px] font-bold text-[#C0392B] hover:bg-[#FFF6F5]";
const BTN_OK = "h-11 cursor-pointer rounded-xl border-0 bg-jdc-blue text-[14px] font-bold text-white hover:bg-jdc-blue-dark";
const CARD = "rounded-[18px] border border-jdc-line bg-white p-4 max-[720px]:rounded-2xl max-[720px]:p-3.5";
const H3 = "m-0 mb-3 font-display text-[17px] font-bold text-jdc-navy";
const IB = "inline-flex size-7 flex-none items-center justify-center rounded-lg border border-jdc-line bg-white text-jdc-muted";
const IB_LG = "inline-flex size-[38px] flex-none items-center justify-center rounded-[11px] border border-jdc-line bg-white text-jdc-muted";

const keyOf = (order, flag) => `${order.id}:${flag.id}`;

/* ---------- pieces ---------- */
function FlagTop({ flag, withSvc }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={WARN_IC}>
        <ProtoIcon name="ntWarn" size={18} />
      </span>
      <div className="min-w-0">
        <strong className="block text-[15.5px] text-jdc-navy">
          {flag.name}{" "}
          <small className="font-medium text-jdc-muted">
            × {flag.qty}
            {withSvc && flag.svc ? ` · ${flag.svc}` : ""}
          </small>
        </strong>
        <small className="mt-0.5 block text-[12.5px] text-jdc-muted">
          Note from our cleaning team{flag.at ? ` · ${flag.at}` : ""}
        </small>
      </div>
    </div>
  );
}

function Answer({ order, flag, answer, onAsk, doneText }) {
  if (answer) {
    return <p className="m-0 mt-2 text-[13px] text-jdc-muted">{doneText(answer)}</p>;
  }
  return (
    <>
      <p className="m-0 mb-2 mt-3 text-[13.5px] font-semibold text-jdc-navy">What would you like us to do?</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={BTN_X} onClick={(e) => { e.stopPropagation(); onAsk("remove", order, flag); }}>
          Remove item
        </button>
        <button type="button" className={BTN_OK} onClick={(e) => { e.stopPropagation(); onAsk("allow", order, flag); }}>
          Clean anyway
        </button>
      </div>
    </>
  );
}

function HoldCard({ order, answers, selected, onOpen, onAsk }) {
  const open = order.flags.filter((f) => !answers[keyOf(order, f)]);
  const also = order.also.map((i) => `${i.name} × ${i.qty}`).join(", ");
  const pickup = [order.pickupDay, order.pickupTime].filter(Boolean).join(" · ");
  const done = !open.length;
  // answered: a one-line summary (prototype .hold-card.is-done)
  const result = order.flags
    .map((f) => `${f.name}${answers[keyOf(order, f)] === "remove" ? " removed" : " cleaned as normal"}`)
    .join(", ");
  return (
    <article
      tabIndex={0}
      className={cx(
        "cursor-pointer overflow-hidden rounded-[18px] border border-jdc-line bg-white transition-colors hover:border-[#C5CEDD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-jdc-blue",
        selected && "border-jdc-blue outline outline-1 outline-jdc-blue hover:border-jdc-blue"
      )}
      onClick={() => onOpen(order.id)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !e.target.closest("button")) {
          e.preventDefault();
          onOpen(order.id);
        }
      }}
    >
      <header className={cx("flex items-start justify-between gap-2.5 px-4 py-3.5", !done && "border-b border-jdc-line")}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="whitespace-nowrap text-[15px] font-semibold text-jdc-muted">
              #<span className="text-jdc-navy">{order.no}</span>
            </span>
            {open.length ? <span className={PILL}>On hold</span> : <span className={cx(PILL, PILL_OK)}>Going ahead</span>}
          </div>
          {done ? (
            <small className="mt-[3px] block text-[13px] leading-[1.4] text-jdc-muted">{result}. The rest of your order is going ahead.</small>
          ) : pickup ? (
            <small className="mt-[3px] block text-[13px] leading-[1.4] text-jdc-muted">Pickup {pickup}</small>
          ) : null}
        </div>
        <span className="ml-2 inline-flex flex-none items-center gap-0.5 self-center text-[18px] font-semibold leading-none text-jdc-blue">
          <span className="mr-0.5 text-[13px] max-[720px]:hidden">Details</span>›
        </span>
      </header>
      {done ? null : order.flags.map((f) => (
        <section key={f.id} className="border-l-[3px] border-jdc-navy bg-white py-3.5 pl-3.5 pr-4 [&+&]:border-t [&+&]:border-t-jdc-line">
          <FlagTop flag={f} />
          <p className="m-0 mt-2.5 text-[14.5px] leading-normal text-jdc-text">{f.issue}</p>
          <Answer
            order={order}
            flag={f}
            answer={answers[keyOf(order, f)]}
            onAsk={onAsk}
            doneText={(a) => (a === "remove" ? "Removed from this order" : "Will be cleaned as normal")}
          />
        </section>
      ))}
      {also && !done ? (
        <p className="m-0 flex items-start gap-2 border-t border-jdc-line bg-[#F7F8FA] px-4 py-[11px] text-[13px] text-jdc-muted">
          <span className="mt-px flex flex-none">
            <ProtoIcon name="tshirt" size={16} />
          </span>
          <span>
            Also in this order: {also} <em className="font-semibold not-italic text-[#1E8E5A]">· cleaning as normal</em>
          </span>
        </p>
      ) : null}
    </article>
  );
}

function Leg({ title, day, time, how }) {
  return (
    <div className="grid min-w-0 content-start gap-2 p-3 max-[720px]:p-2.5 [&+&]:border-l [&+&]:border-jdc-line">
      <small className="text-[13px] font-semibold text-jdc-muted">{title}</small>
      {[["calendar", day], ["clock", time], ["person", how]].map(([ic, v]) =>
        v ? (
          <p key={ic} className="m-0 flex items-center gap-2 text-[13.5px] leading-[1.3] text-jdc-navy max-[720px]:text-[13px]">
            <span className={cx(IB, "max-[720px]:size-6")}>
              <ProtoIcon name={ic} size={15} />
            </span>
            {v}
          </p>
        ) : null
      )}
    </div>
  );
}

function Details({ order, answers, onAsk, loading }) {
  if (loading || !order) return <DetailsSkeleton />;
  const open = order.flags.filter((f) => !answers[keyOf(order, f)]);
  return (
    <>
      <div className={cx(CARD, "grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-2")}>
        <div>
          <small className="block text-[13px] text-jdc-muted">Order ID</small>
          <strong className="mt-0.5 block font-display text-[22px] font-bold text-jdc-navy max-[720px]:text-[20px]">#{order.no}</strong>
        </div>
        {open.length ? (
          <span className={PILL}>On hold</span>
        ) : (
          <span className="inline-flex h-8 items-center gap-[7px] rounded-full border border-[#BFE6CF] bg-[#ECF8F1] px-3.5 text-[14px] font-bold text-[#1E8E5A] before:size-2 before:rounded-full before:bg-current before:content-['']">
            Going ahead
          </span>
        )}
        {order.placed ? (
          <p className="col-span-full m-0 mt-0.5 flex items-center gap-2 text-[13.5px] text-jdc-muted">
            <ProtoIcon name="clock" size={16} />
            Placed on {order.placed}
          </p>
        ) : null}
      </div>

      <div className={CARD}>
        <h3 className={H3}>{open.length ? "Your answer is needed" : "Your answer"}</h3>
        {order.flags.map((f) => (
          <div key={f.id} className="[&+&]:mt-3.5 [&+&]:border-t [&+&]:border-jdc-line [&+&]:pt-3.5">
            <FlagTop flag={f} withSvc />
            <p className="m-0 mt-2.5 text-[14.5px] leading-normal text-jdc-text">{f.issue}</p>
            {f.photos.length ? (
              <>
                <p className="m-0 mb-1.5 mt-3 text-[12px] font-bold uppercase tracking-[0.08em] text-jdc-muted">Photos from our team</p>
                <div className="flex flex-wrap gap-2">
                  {f.photos.map((src, i) =>
                    src ? (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="block size-[86px] overflow-hidden rounded-xl border border-[#D5DAE3] bg-[#F7F8FA]"
                        aria-label={`Photo ${i + 1} (opens full size)`}
                      >
                        <img src={src} alt={`${f.name}, photo ${i + 1}`} className="size-full object-cover" />
                      </a>
                    ) : (
                      <span key={i} className="flex size-[86px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#D5DAE3] bg-[#F7F8FA] text-jdc-muted">
                        <ProtoIcon name="camera" size={18} />
                        <small className="text-[11.5px]">Photo {i + 1}</small>
                      </span>
                    )
                  )}
                </div>
              </>
            ) : null}
            <Answer
              order={order}
              flag={f}
              answer={answers[keyOf(order, f)]}
              onAsk={onAsk}
              doneText={(a) => (a === "remove" ? "You removed this item from the order." : "You asked us to clean it as normal.")}
            />
          </div>
        ))}
      </div>

      <div className={CARD}>
        <h3 className={H3}>Schedule</h3>
        <div className="grid grid-cols-2 overflow-hidden rounded-[14px] border border-jdc-line">
          <Leg title="Collection" day={order.pickupDay} time={order.pickupTime} how={order.pickupHow} />
          <Leg title="Delivery" day={order.deliveryDay} time={order.deliveryTime} how={order.deliveryHow} />
        </div>
      </div>

      {order.address || order.frequency ? (
        <div className={cx(CARD, "!p-0")}>
          {order.address ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className={IB_LG}><ProtoIcon name="pin" size={18} /></span>
              <strong className="text-[15px] font-semibold text-jdc-navy">Address</strong>
              <span className="ml-auto max-w-[55%] text-right text-[13.5px] text-jdc-muted">{order.address}</span>
            </div>
          ) : null}
          {order.frequency ? (
            <div className="flex items-center gap-3 border-t border-jdc-line px-4 py-3.5 first:border-t-0">
              <span className={IB_LG}><ProtoIcon name="repeat" size={18} /></span>
              <strong className="text-[15px] font-semibold text-jdc-navy">Frequency</strong>
              <span className="ml-auto inline-flex h-[34px] flex-none items-center rounded-full border border-[#BFE6CF] bg-[#E7F6EE] px-3.5 text-[14.5px] font-bold text-[#1E8E5A]">
                {order.frequency}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {order.services.length ? (
        <div className={CARD}>
          <h3 className={H3}>What you added</h3>
          {order.services.map((sv) => (
            <div key={sv.name} className="py-3 first:pt-0 [&+&]:border-t [&+&]:border-jdc-line">
              <strong className="block text-[15px] text-jdc-navy">{sv.name}</strong>
              {sv.prefs.length ? (
                <div className="mb-1.5 mt-2 flex flex-wrap gap-1.5">
                  {sv.prefs.map((p) => (
                    <span key={p} className="inline-flex h-[26px] items-center rounded-full border border-jdc-line bg-jdc-paper px-2.5 text-[12.5px] text-jdc-navy">
                      {p}
                    </span>
                  ))}
                </div>
              ) : null}
              {sv.items.map((it, i) => {
                const flag = order.flags.find((f) => f.id === it.flagId || f.name === it.name);
                const a = flag ? answers[keyOf(order, flag)] : null;
                return (
                  <p key={`${it.name}-${i}`} className="m-0 mt-1.5 flex items-center justify-between gap-2.5 text-[14px] text-jdc-navy">
                    <span>
                      {it.name} <small className="text-jdc-muted">× {it.qty}</small>
                    </span>
                    {flag ? (
                      <em
                        className={cx(
                          "inline-flex h-[22px] items-center rounded-full px-[9px] text-[11.5px] font-bold not-italic",
                          a === "remove" ? "bg-[#FDECEA] text-[#C0392B]" : a === "allow" ? "bg-[#E7F6EE] text-[#1E8E5A]" : "bg-[#F1F3F7] text-jdc-navy"
                        )}
                      >
                        {a === "remove" ? "Removed" : a === "allow" ? "Cleaning" : "On hold"}
                      </em>
                    ) : null}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}

      <div className={CARD}>
        <h3 className={H3}>Your note for the driver</h3>
        <p className="m-0 flex items-start gap-2 text-[14px] text-jdc-navy">
          <span className="mt-px flex flex-none text-jdc-muted"><ProtoIcon name="note" size={16} /></span>
          <span>{order.driverNote || "No note added"}</span>
        </p>
      </div>

      {order.paid ? (
        <div className="grid gap-2 rounded-[14px] border border-[#BFE6CF] bg-[#ECF8F1] p-3.5 text-[#16784B]">
          <strong className="text-[14.5px]">Paid at booking</strong>
          {order.paid.lines.map(([label, sub, amt]) => (
            <div key={label} className="flex items-start justify-between gap-3 text-[14px]">
              <span>
                {label}
                {sub ? <small className="block text-[12px] opacity-85">{sub}</small> : null}
              </span>
              <b className="whitespace-nowrap font-semibold">{amt}</b>
            </div>
          ))}
          <div className={cx("flex items-start justify-between gap-3 text-[14px] font-bold", order.paid.lines.length && "border-t border-[#BFE6CF] pt-2")}>
            <span>Total paid</span>
            <b className="whitespace-nowrap font-extrabold">{order.paid.total}</b>
          </div>
          <small className="text-[12.5px]">The final price is confirmed after your items are checked.</small>
        </div>
      ) : null}

      <a
        href="/help-center"
        className="flex h-[50px] items-center justify-center rounded-[14px] bg-[#FDECEA] text-[15px] font-bold text-[#C0392B] no-underline hover:bg-[#FBDCD8]"
      >
        Contact support
      </a>
    </>
  );
}

/* Real orders: each card / the details panel loads its own extra data */
function RealCard({ booking, ...rest }) {
  const { data } = useGetOnHoldBookingByIdQuery(booking.id, { skip: !booking?.id });
  const order = useMemo(() => toOrder(booking, data?.data?.onHoldBookings), [booking, data]);
  useEffect(() => rest.onOrder?.(order), [order]); // eslint-disable-line react-hooks/exhaustive-deps
  return <HoldCard order={order} {...rest} />;
}

function RealDetails({ booking, answers, onAsk }) {
  const timeZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
  const { data: flagsRes } = useGetOnHoldBookingByIdQuery(booking.id, { skip: !booking?.id });
  const { data: detailRes, isLoading } = useBookingDetailByIdQuery({ bookingId: booking.id, timeZone }, { skip: !booking?.id });
  const order = useMemo(
    () => toOrder(booking, flagsRes?.data?.onHoldBookings, detailRes?.data),
    [booking, flagsRes, detailRes]
  );
  return <Details order={order} answers={answers} onAsk={onAsk} loading={isLoading && !detailRes} />;
}

/* ---------- confirm popup (bottom sheet on phones) ---------- */
function ConfirmSheet({ ask, busy, onYes, onClose }) {
  const isX = ask?.kind === "remove";
  const name = ask?.flag?.name;
  return (
    <Dialog open={Boolean(ask)} onClose={onClose} dismissible={!busy} labelledBy="holdQ" className="max-w-[420px]">
        <div className="grid gap-4 overflow-y-auto px-[22px] pb-1.5 pt-[22px] text-center max-[720px]:px-5">
          <span
            className={cx(
              "mx-auto mb-1 flex size-[52px] items-center justify-center rounded-full",
              isX ? "bg-[#FDECEA] text-[#C0392B]" : "bg-[#E7F6EE] text-[#1E8E5A]"
            )}
          >
            <ProtoIcon name={isX ? "xCircle" : "checkCircle"} size={24} />
          </span>
          <h2 id="holdQ" className="m-0 font-display text-[22px] font-bold text-jdc-navy max-[720px]:text-[19px]">
            {isX ? `Remove ${name}?` : `Clean ${name} anyway?`}
          </h2>
          <p className="m-0 text-[15px] leading-normal text-jdc-muted">
            {isX
              ? "It will be taken out of this order and returned to you uncleaned. The rest of your order will go ahead as normal."
              : "We will clean it as normal, knowing the risk our team described. Your whole order will go ahead."}
          </p>
        </div>
        <div className="grid gap-2 px-[22px] pb-5 pt-3.5 max-[720px]:px-5 max-[720px]:pb-[calc(16px+env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={busy}
            className={cx(
              "h-[50px] cursor-pointer rounded-xl border-0 text-[16px] font-bold text-white disabled:cursor-wait disabled:opacity-70",
              isX ? "bg-[#C0392B] hover:bg-[#A93226]" : "bg-jdc-blue hover:bg-jdc-blue-dark"
            )}
            onClick={onYes}
          >
            {busy ? "Sending…" : isX ? "Yes, remove it" : "Yes, clean it"}
          </button>
          <button type="button" className="h-[50px] cursor-pointer rounded-[14px] border-0 bg-[#EEF0F4] text-[15px] font-bold text-jdc-navy hover:bg-[#E4E7ED]" onClick={onClose}>
            Go back
          </button>
        </div>
    </Dialog>
  );
}

/* ---------- page ---------- */
export default function OnHoldbookings() {
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
    setDemo(local && new URLSearchParams(window.location.search).get("demo") === "1");
  }, []);

  const { data, isLoading, refetch } = useGetOnHoldBookingsQuery(undefined, { skip: demo });
  const [updateOnHold, { isLoading: sending }] = useUpdateOnHoldBookingMutation();
  const bookings = useMemo(() => (demo ? [] : data?.data?.onHoldBookings || []), [demo, data]);

  // answers this visit: "orderId:flagId" -> "remove" | "allow"
  const [answers, setAnswers] = useState({});
  const [ask, setAsk] = useState(null);
  const [current, setCurrent] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wide, setWide] = useState(true);
  const [realOrders, setRealOrders] = useState({}); // normalised real orders, reported by their cards

  useEffect(() => {
    const mq = window.matchMedia("(min-width:1101px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  const ids = demo ? DEMO_ORDERS.map((o) => o.id) : bookings.map((b) => b.id);
  // wide screens show the first order's details straight away
  useEffect(() => {
    if (wide && ids.length && !ids.includes(current)) setCurrent(ids[0]);
  }, [wide, ids.join(","), current]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetails = (id) => {
    setCurrent(id);
    if (!wide) setSheetOpen(true);
  };

  const onAsk = useCallback((kind, order, flag) => setAsk({ kind, order, flag }), []);
  const closeAsk = useCallback(() => setAsk(null), []);

  const confirm = async () => {
    if (!ask) return;
    const { kind, order, flag } = ask;
    const next = { ...answers, [keyOf(order, flag)]: kind };
    const waiting = order.flags.filter((f) => !next[keyOf(order, f)]);

    if (!demo && !waiting.length) {
      // every flagged item of this order has an answer: send them together
      const responses = order.flags.map((f) => {
        const a = next[keyOf(order, f)];
        const r = { onHoldId: Number(f.id), customerResponse: a === "allow" };
        if (a === "remove") r.note = "Remove this item from my order";
        return r;
      });
      try {
        await updateOnHold({
          bookingId: Number(order.id),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          responses,
        }).unwrap();
      } catch (e) {
        addToast({
          title: "Could not send your answer",
          description: e?.data?.message || e?.data?.error || "Please try again.",
          color: "danger",
        });
        return;
      }
    }

    setAnswers(next);
    setAsk(null);
    addToast({
      title: waiting.length
        ? "Saved. Please answer the other item too"
        : kind === "remove"
          ? "Item removed. Your order is going ahead"
          : "Thanks, we will clean it as normal",
      color: "success",
    });
    if (!demo && !waiting.length) refetch();
  };

  if (!demo && isLoading) {
    return (
      <div className="grid gap-3.5">
        <span className="sr-only" role="status">Loading bookings on hold…</span>
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    );
  }

  // orders answered this visit stay on screen under "Answered" ("Going ahead")
  const isOpen = (o) => o && o.flags.some((f) => !answers[keyOf(o, f)]);
  const list = demo ? DEMO_ORDERS : bookings;
  const waitingCount = demo
    ? DEMO_ORDERS.filter(isOpen).length
    : bookings.filter((b) => isOpen(realOrders[b.id]) ?? true).length;

  const renderCard = (item) =>
    demo ? (
      <HoldCard key={item.id} order={item} answers={answers} selected={wide && current === item.id} onOpen={openDetails} onAsk={onAsk} />
    ) : (
      <RealCard
        key={item.id}
        booking={item}
        answers={answers}
        selected={wide && current === item.id}
        onOpen={openDetails}
        onAsk={onAsk}
        onOrder={(o) => setRealOrders((prev) => ({ ...prev, [item.id]: o }))}
      />
    );

  const openItems = list.filter((it) => (demo ? isOpen(it) : isOpen(realOrders[it.id]) ?? true));
  const doneItems = list.filter((it) => !openItems.includes(it));
  const currentItem = list.find((it) => it.id === current);

  const detailsBody = currentItem ? (
    demo ? (
      <Details order={currentItem} answers={answers} onAsk={onAsk} />
    ) : (
      <RealDetails booking={currentItem} answers={answers} onAsk={onAsk} />
    )
  ) : null;
  const panelTitle = currentItem ? `Order #${demo ? currentItem.no : currentItem.orderTrackId || currentItem.id}` : "Booking";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_440px] items-start gap-7 max-[1100px]:grid-cols-[minmax(0,1fr)]">
      <div>
        {list.length ? (
          <>
            {waitingCount ? (
              <p className="m-0 -mt-2 mb-3.5 text-[14px] text-jdc-muted">
                <b className="text-jdc-navy">{waitingCount}</b> order{waitingCount > 1 ? "s need" : " needs"} your answer
              </p>
            ) : null}
            <div className="grid gap-3.5">{openItems.map(renderCard)}</div>
            {doneItems.length ? (
              <>
                <p className="m-0 mb-2.5 mt-[22px] text-[12px] font-bold uppercase tracking-[0.1em] text-jdc-muted">Answered</p>
                <div className="grid gap-3.5">{doneItems.map(renderCard)}</div>
              </>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Nothing on hold"
            text="All your orders are going ahead. If we find a problem with an item, it will show here for you to decide."
            actions={[{ label: "View your orders", href: "/profile?tab=order-history" }]}
          />
        )}
      </div>

      {/* details: right column on wide screens */}
      {wide && currentItem ? (
        <aside className="sticky top-[104px] flex h-[calc(100vh-300px)] max-h-[calc(100vh-124px)] min-h-[460px] flex-col overflow-hidden rounded-[20px] border border-jdc-line bg-white">
          <header className="flex flex-none items-center justify-center border-b border-jdc-line px-5 py-4">
            <h2 className="m-0 font-display text-[18px] font-bold text-jdc-navy">{panelTitle}</h2>
          </header>
          <div className="thin-scroll grid flex-1 content-start gap-3 overflow-y-auto overscroll-contain bg-[#F7F8FA] px-5 pb-7 pt-4">
            {detailsBody}
          </div>
        </aside>
      ) : null}

      {/* details: side drawer on tablets, bottom sheet on phones */}
      <Dialog
        open={!wide && sheetOpen && Boolean(currentItem)}
        onClose={() => setSheetOpen(false)}
        labelledBy="holdDetailsTitle"
        placement="side"
        className="max-[720px]:h-[94vh]"
      >
            <header className="relative flex flex-none flex-col items-center justify-center border-b border-jdc-line px-14 py-[18px] max-[720px]:pb-3 max-[720px]:pt-2">
              <h2 id="holdDetailsTitle" className="m-0 font-display text-[18px] font-bold text-jdc-navy max-[720px]:text-[17px]">{panelTitle}</h2>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-jdc-paper text-jdc-navy"
                onClick={() => setSheetOpen(false)}
              >
                <ProtoIcon name="close" size={16} />
              </button>
            </header>
            <div className="thin-scroll grid flex-1 content-start gap-3 overflow-y-auto overscroll-contain bg-[#F7F8FA] px-5 pb-7 pt-4 max-[720px]:px-4 max-[720px]:pb-[calc(24px+env(safe-area-inset-bottom))]">
              {detailsBody}
            </div>
      </Dialog>

      <ConfirmSheet ask={ask} busy={sending} onYes={confirm} onClose={closeAsk} />
    </div>
  );
}
