"use client";

import { useState } from "react";
import Link from "next/link";
import { addToast } from "@heroui/react";
import {
  useBookingDetailByIdQuery,
  useGetRecurringPlansQuery,
  useUpdateRecurringPlanMutation,
} from "@/app/store/services/api";
import ProtoIcon from "../proto/ProtoIcon";
import EmptyState from "../ds/EmptyState";
import Dialog from "../ds/Dialog";
import { Bone } from "../ds/Skeleton";
import { cx } from "../ds/cx";
import { useStartBooking } from "../../utilities/useStartBooking";
import * as ui from "../booking/ui";

/*
 * Profile -> Recurring service.
 * A plan is created when an order is booked with a frequency other than "Just once"
 * (Weekly / Every 2 weeks / Every 4 weeks). On each run the backend creates the next
 * order automatically with the same services. The customer can pause (stop for now),
 * resume, or turn the plan off for good. Orders already created are not affected.
 *
 * API: GET customer/recurringPlans, POST customer/recurringPlan { planId, action }.
 * The services that repeat are the linked order's (GET customer/bookingDetailsById),
 * loaded when the customer opens them.
 */

const WRAP = "grid w-full gap-3 xl:max-w-[859px]";
const CARD = "rounded-[20px] border border-jdc-line bg-white p-5 max-[720px]:p-4";

const STATUS = {
  active: { label: "Active", cls: "bg-[#E7F6EE] text-[#1A7F43] border-[#BFE6CF]", dot: "bg-[#1A7F43]" },
  paused: { label: "Paused", cls: "bg-[#FFF6E5] text-[#9A6400] border-[#F5DEAD]", dot: "bg-[#C88A12]" },
  cancelled: { label: "Turned off", cls: "bg-[#F1F3F7] text-jdc-muted border-jdc-line", dot: "bg-[#8A93A6]" },
};

const TEXT = {
  active: "Your next order will be created automatically on the date below, with the same services.",
  paused: "Paused: no new orders are created until you resume.",
  cancelled: "Turned off: no more orders will be created from this plan.",
};

// "weekly" / "Every 2 weeks" / "biweekly" ... -> a readable title
function frequencyLabel(value) {
  const v = String(value || "").trim();
  const n = v.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n === "weekly" || n === "every1week" || n === "everyweek") return "Weekly";
  // the backend stores "every two weeks" / "every four weeks"
  if (n === "biweekly" || n === "fortnightly" || n === "every2weeks" || n === "everytwoweeks") return "Every 2 weeks";
  if (n === "monthly" || n === "every4weeks" || n === "everyfourweeks") return "Every 4 weeks";
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : "Recurring";
}

function formatRun(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

const count = (value, one, many) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `${n} ${n === 1 ? one : many}` : null;
};

// customerSelectedServices -> [{ name, lines: [{ key, label, counts, addOns }] }], grouped by service
function groupServices(selected) {
  const groups = new Map();
  (Array.isArray(selected) ? selected : []).forEach((item, i) => {
    const name = item?.service?.name?.trim() || "Service";
    if (!groups.has(name)) groups.set(name, []);
    const category = item?.category?.name?.trim();
    const sub = item?.subCategory?.name?.trim();
    groups.get(name).push({
      key: `${item?.serviceId ?? "s"}-${item?.categoryId ?? "c"}-${item?.subCategoryId ?? "i"}-${i}`,
      label: sub || category || null,
      counts: [count(item?.bags, "bag", "bags"), count(item?.items, "item", "items")].filter(Boolean),
      addOns: (Array.isArray(item?.addOns) ? item.addOns : []).map((a) => a?.addOnService?.name).filter(Boolean),
    });
  });
  return [...groups.entries()].map(([name, lines]) => ({ name, lines }));
}

/** The linked order's services: what every automatic order repeats. Loaded on first open. */
function PlanServices({ bookingId, onBookSeparate }) {
  const timeZone = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
  const { data, isLoading, isFetching, isError, refetch } = useBookingDetailByIdQuery({ bookingId, timeZone });
  const groups = groupServices(data?.data?.customerSelectedServices);

  if (isLoading || (isFetching && !groups.length)) {
    return (
      <div className="grid gap-2 pt-1">
        <span className="sr-only" role="status">Loading the services in this plan…</span>
        <Bone className="h-[58px] w-full rounded-xl" />
        <Bone className="h-[58px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !groups.length) {
    return (
      <p className="m-0 rounded-xl bg-white px-3.5 py-3 text-[14px] text-jdc-muted">
        {isError ? "We couldn't load the services for this order. " : "No services were found on this order. "}
        <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-jdc-blue" onClick={() => refetch()}>
          Try again
        </button>
      </p>
    );
  }

  return (
    <div className="grid gap-2.5 pt-1">
      <ul className="m-0 grid list-none gap-2 p-0">
        {groups.map((g) => (
          <li key={g.name} className="rounded-xl border border-jdc-line bg-white px-3.5 py-3">
            <p className="m-0 text-[14.5px] font-bold text-jdc-navy">{g.name}</p>
            <ul className="m-0 mt-1.5 grid list-none gap-1.5 p-0">
              {g.lines.map((line) => (
                <li key={line.key} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-jdc-muted">
                  {line.label ? <span className="min-w-0">{line.label}</span> : null}
                  {line.counts.map((c) => (
                    <span key={c} className="rounded-full bg-jdc-mist px-2 py-0.5 text-[12px] font-semibold text-jdc-navy">
                      {c}
                    </span>
                  ))}
                  {line.addOns.length ? <span className="basis-full text-[12.5px]">Add-ons: {line.addOns.join(", ")}</span> : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-2.5 rounded-xl border border-jdc-blue-line bg-jdc-blue-tint px-3.5 py-3">
        <span className="mt-px flex flex-none text-jdc-blue"><ProtoIcon name="plus" size={17} /></span>
        <div className="min-w-0 flex-1 text-[13.5px] leading-[1.5] text-jdc-navy">
          Each automatic order repeats exactly these services. Need something else as well? Book it as a separate order.
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-bold text-jdc-blue" onClick={onBookSeparate}>
              Book a separate order
            </button>
            <Link href={`/profile?tab=order-history&bookingId=${bookingId}`} className="text-[13.5px] font-semibold text-jdc-blue no-underline">
              Full order details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecurringService() {
  const { data, isLoading, isError, refetch } = useGetRecurringPlansQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updatePlan] = useUpdateRecurringPlanMutation();
  const startBooking = useStartBooking();
  const [busy, setBusy] = useState(null); // `${planId}:${action}`
  const [confirmOff, setConfirmOff] = useState(null); // plan to turn off
  const [openPlans, setOpenPlans] = useState(() => new Set()); // plans showing their services
  const togglePlan = (id) =>
    setOpenPlans((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const plans = Array.isArray(data?.data?.plans) ? data.data.plans : [];

  const act = async (plan, action) => {
    setBusy(`${plan.id}:${action}`);
    try {
      const res = await updatePlan({ planId: plan.id, action }).unwrap();
      addToast({ title: res?.message || "Recurring service updated", color: "success" });
    } catch (err) {
      addToast({
        title: "Could not update your recurring service",
        description: err?.data?.message || err?.data?.error || "Please try again.",
        color: "danger",
      });
    } finally {
      setBusy(null);
      setConfirmOff(null);
    }
  };

  if (isLoading) {
    return (
      <div className={WRAP}>
        <span className="sr-only" role="status">Loading your recurring service…</span>
        <Bone className="h-[92px] w-full rounded-[20px]" />
        <Bone className="h-[240px] w-full rounded-[20px]" />
      </div>
    );
  }

  if (isError && !plans.length) {
    return (
      <EmptyState
        className="w-full xl:max-w-[859px]"
        icon="repeat"
        title="We couldn't load your recurring service"
        text="Please check your connection and try again."
        actions={[{ label: "Try again", onClick: () => refetch() }]}
      />
    );
  }

  if (!plans.length) {
    return (
      <EmptyState
        className="w-full xl:max-w-[859px]"
        icon="repeat"
        title="No recurring service yet"
        text="At checkout, choose Weekly, Every 2 weeks or Every 4 weeks and we'll book your next pickup automatically, with the same services."
        actions={[{ label: "Book a pickup", onClick: () => startBooking() }]}
      />
    );
  }

  return (
    <div className={WRAP}>
      {/* what it is */}
      <div className="flex items-start gap-3.5 rounded-[20px] border border-jdc-blue-line bg-jdc-blue-tint p-5 max-[720px]:p-4">
        <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-white text-jdc-blue">
          <ProtoIcon name="repeat" size={22} />
        </span>
        <div className="min-w-0">
          <p className="m-0 font-display text-[17px] font-bold text-jdc-navy">Automatic laundry schedule</p>
          <p className="m-0 mt-1 text-[14.5px] leading-[1.5] text-jdc-muted">
            Pause it for a while, or turn it off. Orders that are already booked are not affected.
          </p>
        </div>
      </div>

      <p className="m-0 mt-2 text-[12px] font-bold uppercase tracking-[0.04em] text-jdc-muted">
        {plans.length === 1 ? "Your plan" : "Your plans"}
      </p>

      {plans.map((plan) => {
        const status = STATUS[plan.status] || STATUS.active;
        const next = plan.status === "active" ? formatRun(plan.nextRunAt) : null;
        const isBusy = (a) => busy === `${plan.id}:${a}`;
        return (
          <article key={plan.id} className={cx(CARD, plan.status === "cancelled" && "bg-[#FBFCFD]")}>
            <div className="flex items-start gap-3.5">
              <span
                className={cx(
                  "flex size-12 flex-none items-center justify-center rounded-[14px]",
                  plan.status === "active" ? "bg-jdc-blue-tint text-jdc-blue" : "bg-[#F1F3F7] text-[#8A93A6]"
                )}
              >
                <ProtoIcon name="repeat" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="m-0 font-display text-[19px] font-bold text-jdc-navy">{frequencyLabel(plan.frequency)}</h3>
                  <span className={cx("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-bold", status.cls)}>
                    <span className={cx("size-1.5 rounded-full", status.dot)} aria-hidden="true" />
                    {status.label}
                  </span>
                </div>
                <p className="m-0 mt-1 text-[14px] leading-[1.5] text-jdc-muted">{TEXT[plan.status] || TEXT.active}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[14px] bg-jdc-paper px-4 py-1">
              {plan.orderTrackId ? (
                <div className="border-b border-jdc-line">
                  {plan.bookingId ? (
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-0 py-3 text-left"
                      aria-expanded={openPlans.has(plan.id)}
                      aria-controls={`rsServices${plan.id}`}
                      onClick={() => togglePlan(plan.id)}
                    >
                      <span className="flex text-[#8A93A6]"><ProtoIcon name="receipt" size={18} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] text-jdc-muted">Linked order</span>
                        <span className="block text-[15px] font-semibold text-jdc-navy">#{plan.orderTrackId}</span>
                      </span>
                      <span className="flex flex-none items-center gap-1.5 text-[13.5px] font-semibold text-jdc-blue">
                        {openPlans.has(plan.id) ? "Hide services" : "View services"}
                        <span className={cx("flex transition-transform duration-200", openPlans.has(plan.id) && "rotate-180")}>
                          <ProtoIcon name="chevDown" size={14} />
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 py-3">
                      <span className="flex text-[#8A93A6]"><ProtoIcon name="receipt" size={18} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[12.5px] text-jdc-muted">Linked order</p>
                        <p className="m-0 text-[15px] font-semibold text-jdc-navy">#{plan.orderTrackId}</p>
                      </div>
                    </div>
                  )}
                  {plan.bookingId && openPlans.has(plan.id) ? (
                    <div id={`rsServices${plan.id}`} className="pb-3.5">
                      <p className="m-0 mb-2 text-[12px] font-bold uppercase tracking-[0.04em] text-jdc-muted">Services that repeat</p>
                      <PlanServices bookingId={plan.bookingId} onBookSeparate={() => startBooking()} />
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex items-center gap-3 py-3">
                <span className="flex text-[#8A93A6]"><ProtoIcon name="calendar" size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[12.5px] text-jdc-muted">Next automatic order</p>
                  <p className="m-0 text-[15px] font-semibold text-jdc-navy">
                    {next || (plan.status === "paused" ? "Paused" : plan.status === "cancelled" ? "None" : "Being scheduled")}
                  </p>
                </div>
              </div>
            </div>

            {plan.failureCount > 0 && plan.status !== "cancelled" ? (
              <p className="m-0 mt-3 rounded-xl border border-[#F5DEAD] bg-[#FFF6E5] px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-[#7A5200]">
                We couldn&apos;t create {plan.failureCount === 1 ? "your last order" : `${plan.failureCount} recent orders`} automatically.
                After {plan.maxFailures} tries in a row the plan pauses itself. Contact us if you need help.
              </p>
            ) : null}

            {plan.canPause || plan.canResume || plan.canCancel ? (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {plan.canPause ? (
                  <button
                    type="button"
                    className={cx(ui.BTN, ui.BTN_GHOST, "h-12 w-full px-4 text-[15px]")}
                    disabled={Boolean(busy)}
                    onClick={() => act(plan, "pause")}
                  >
                    {isBusy("pause") ? <span className={ui.SPIN} aria-hidden="true" /> : <ProtoIcon name="pause" size={16} />}
                    Pause
                  </button>
                ) : null}
                {plan.canResume ? (
                  <button
                    type="button"
                    className={cx(ui.BTN, "h-12 w-full px-4 text-[15px]")}
                    disabled={Boolean(busy)}
                    onClick={() => act(plan, "resume")}
                  >
                    {isBusy("resume") ? <span className={ui.SPIN} aria-hidden="true" /> : <ProtoIcon name="play" size={16} />}
                    Resume
                  </button>
                ) : null}
                {plan.canCancel ? (
                  <button
                    type="button"
                    className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-jdc-pill border border-[#F1C4BE] bg-white px-4 text-[15px] font-bold text-[#C0392B] hover:bg-[#FDF3F2] disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={Boolean(busy)}
                    onClick={() => setConfirmOff(plan)}
                  >
                    <ProtoIcon name="close" size={15} />
                    Turn off
                  </button>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}

      {/* turning off is permanent: ask first */}
      <Dialog open={Boolean(confirmOff)} onClose={() => setConfirmOff(null)} dismissible={!busy} labelledBy="rsOffTitle" width="sm">
        <div className={ui.CONFIRM_BODY}>
          <span className={cx(ui.CONFIRM_ICON, "bg-[#FDECEA] text-[#C0392B]")}>
            <ProtoIcon name="xCircle" size={26} />
          </span>
          <h3 id="rsOffTitle">Turn off {confirmOff ? frequencyLabel(confirmOff.frequency).toLowerCase() : ""} orders?</h3>
          <p>No more orders will be created automatically. Orders already booked are not affected. To only stop for a while, choose Pause.</p>
          <div className="mt-[22px] grid gap-2.5">
            <button
              type="button"
              className="inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-jdc-pill border-0 bg-[#C0392B] text-[16px] font-bold text-white hover:bg-[#A93226] disabled:opacity-60"
              disabled={Boolean(busy)}
              onClick={() => confirmOff && act(confirmOff, "cancel")}
            >
              {busy ? <span className={ui.SPIN} aria-hidden="true" /> : null}
              Yes, turn off
            </button>
            {confirmOff?.canPause ? (
              <button
                type="button"
                className={cx(ui.BTN, ui.BTN_GHOST, "h-[52px] w-full justify-center")}
                disabled={Boolean(busy)}
                onClick={() => act(confirmOff, "pause")}
              >
                Pause instead
              </button>
            ) : null}
            <button
              type="button"
              className="h-11 cursor-pointer border-0 bg-transparent text-[15px] font-semibold text-jdc-muted"
              onClick={() => setConfirmOff(null)}
            >
              Keep it on
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
