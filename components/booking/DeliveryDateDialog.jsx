"use client";

import Dialog from "../ds/Dialog";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "../ds/cx";
import * as ui from "./ui";
import { formatIsoDateLong } from "../../utilities/turnaroundTime";

/**
 * "Delivery date update": the chosen services need more days than the delivery date
 * allows. Used on the Book a pickup and Add services steps (same popup, same words).
 *
 * @param {{ open: boolean, maxDays?: number, serviceLabels?: string[], minDeliveryDate?: string }} notice
 * @param {() => void} onAccept  use the earliest possible date
 * @param {() => void} onChange  pick another delivery date
 * @param {() => void} onClose
 */
export default function DeliveryDateDialog({ notice, onAccept, onChange, onClose }) {
  const days = Number(notice?.maxDays) || 0;
  const services = notice?.serviceLabels?.length ? notice.serviceLabels.join(", ") : "Your services";
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
            {days ? `${days} day${days > 1 ? "s" : ""}` : "more time"}, so your delivery date is too early.
          </span>
        </p>
        <p className="m-0 rounded-[14px] border border-jdc-line bg-[#F7F8FA] px-4 py-3 text-[14.5px] text-jdc-muted">
          Earliest delivery: <b className="text-jdc-navy">{formatIsoDateLong(notice?.minDeliveryDate)}</b>
        </p>
      </div>
      <div className={cx(ui.MODAL_FOOT, "grid gap-2.5")}>
        <button type="button" className={cx(ui.BTN, ui.BTN_BLOCK)} onClick={onAccept} data-autofocus>
          Use earliest date
        </button>
        <button type="button" className={cx(ui.BTN, ui.BTN_GHOST, "w-full justify-center")} onClick={onChange}>
          Choose another date
        </button>
      </div>
    </Dialog>
  );
}
