"use client";

import Dialog from "../ds/Dialog";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "../ds/cx";
import * as ui from "./ui";
import { formatIsoDateLong } from "../../utilities/turnaroundTime";
import { to24Hour } from "../../utilities/ConversionFunction";

/**
 * "Delivery date update": the chosen services need more days than the delivery date
 * allows. Used on the Book a pickup and Add services steps (same popup, same words).
 *
 * @param {{ open: boolean, maxDays?: number, serviceLabels?: string[], minDeliveryDate?: string,
 *   suggested?: { deliveryDate: string, deliveryTimeFrom?: string, deliveryTimeTo?: string } }} notice
 *   suggested: the slot "Use suggested date" applies; without it only "Choose another date" shows
 * @param {() => void} onAccept  use the earliest possible date
 * @param {() => void} onChange  pick another delivery date
 * @param {() => void} onClose
 */
export default function DeliveryDateDialog({ notice, onAccept, onChange, onKeep, onClose }) {
  const days = Number(notice?.maxDays) || 0;
  const services = notice?.serviceLabels?.length ? notice.serviceLabels.join(", ") : "Your services";
  const suggested = notice?.suggested; // first free slot after the required days, if known
  // the date already chosen, when it already allows enough days (offered as "Keep")
  const current = onKeep && notice?.current?.deliveryDate ? notice.current : null;
  const sameAsSuggested = current && suggested && current.deliveryDate === suggested.deliveryDate && current.deliveryTimeFrom === suggested.deliveryTimeFrom;
  const slotText = (s) => `${formatIsoDateLong(s.deliveryDate)}${s.deliveryTimeFrom ? ` · ${to24Hour(s.deliveryTimeFrom)} – ${to24Hour(s.deliveryTimeTo)}` : ""}`;
  return (
    <Dialog open={Boolean(notice?.open)} onClose={onClose} labelledBy="deliveryDateTitle" width="md">
      <div className={ui.MODAL_HEAD}>
        <b id="deliveryDateTitle">Delivery date update</b>
        <button type="button" className={ui.MODAL_X} onClick={onClose}>
          Close
        </button>
      </div>
      <div className={cx(ui.MODAL_BODY, "gap-3.5")}>
        <p className="m-0 flex items-start gap-3 text-[15px] leading-[1.55] text-jdc-text">
          <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-[#F1F3F7] text-jdc-navy">
            <ProtoIcon name="clock" size={20} />
          </span>
          <span>
            <b className="text-jdc-navy">{services}</b> {notice?.serviceLabels?.length === 1 ? "needs" : "need"}{" "}
            {days ? `${days} day${days > 1 ? "s" : ""}` : "more time"}, so delivery has to be on or after{" "}
            <b className="text-jdc-navy">{formatIsoDateLong(notice?.minDeliveryDate)}</b>.
            {current ? " Your delivery date already allows for this." : ""}
          </span>
        </p>
        {current ? (
          <div className="rounded-[14px] border border-jdc-line bg-[#F7F8FA] px-4 py-3">
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.04em] text-jdc-muted">Your delivery</p>
            <p className="m-0 mt-1 text-[15.5px] font-semibold text-jdc-navy">{slotText(current)}</p>
          </div>
        ) : null}
        {suggested?.deliveryDate && !sameAsSuggested ? (
          <div className="rounded-[14px] border border-jdc-blue-line bg-jdc-blue-tint px-4 py-3">
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.04em] text-jdc-blue">Suggested delivery</p>
            <p className="m-0 mt-1 text-[15.5px] font-semibold text-jdc-navy">
              {formatIsoDateLong(suggested.deliveryDate)}
              {suggested.deliveryTimeFrom ? (
                <span className="font-medium text-jdc-muted">
                  {" "}
                  · {to24Hour(suggested.deliveryTimeFrom)} – {to24Hour(suggested.deliveryTimeTo)}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>
      <div className={cx(ui.MODAL_FOOT, "grid gap-2.5")}>
        {current ? (
          <button type="button" className={cx(ui.BTN, ui.BTN_BLOCK)} onClick={onKeep} data-autofocus>
            Keep {formatIsoDateLong(current.deliveryDate).replace(/,? \d{4}$/, "")}
          </button>
        ) : null}
        {suggested?.deliveryDate && !sameAsSuggested ? (
          <button
            type="button"
            className={cx(ui.BTN, current ? cx(ui.BTN_GHOST, "w-full justify-center") : ui.BTN_BLOCK)}
            onClick={onAccept}
            data-autofocus={current ? undefined : true}
          >
            Use suggested date
          </button>
        ) : null}
        <button
          type="button"
          className={cx(ui.BTN, current || suggested?.deliveryDate ? cx(ui.BTN_GHOST, "w-full justify-center") : ui.BTN_BLOCK)}
          onClick={onChange}
        >
          Choose another date
        </button>
      </div>    </Dialog>
  );
}
