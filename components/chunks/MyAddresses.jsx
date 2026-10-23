"use client";

import { useGetAllAddressQuery } from "@/app/store/services/api";
import ProtoIcon from "../proto/ProtoIcon";
import { useStartBooking } from "../../utilities/useStartBooking";

/*
 * Profile → My addresses. Lists the addresses saved from the customer's bookings
 * (GET customer/customerAddresses). The backend has no add / edit / delete for
 * these yet, so the list is read-only; a new address is added by booking with it.
 * The endpoint answers 404 "No Customer Addresses Found" when there are none.
 */
const CARD = "flex items-start gap-3.5 rounded-jdc-lg border border-jdc-line bg-white px-5 py-[18px]";
const ICON = "flex size-10 flex-none items-center justify-center rounded-full bg-jdc-paper text-jdc-muted";
const BTN =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-jdc-pill border-0 bg-jdc-blue px-6 text-[15px] font-bold text-white hover:bg-jdc-blue-dark";

export default function MyAddresses() {
  const { data, isLoading, isError } = useGetAllAddressQuery(undefined, { refetchOnMountOrArgChange: true });
  const startBooking = useStartBooking();
  const list = Array.isArray(data?.data) ? data.data : [];

  if (isLoading) {
    return <p className="m-0 py-10 text-center text-[15px] text-jdc-muted">Loading your addresses…</p>;
  }

  if (isError || !list.length) {
    return (
      <div className="grid justify-items-center gap-3 rounded-jdc-lg border border-jdc-line bg-white px-6 py-12 text-center">
        <span className={ICON}>
          <ProtoIcon name="home" size={20} />
        </span>
        <p className="m-0 text-[17px] font-bold text-jdc-navy">No saved addresses yet</p>
        <p className="m-0 max-w-[380px] text-[14.5px] text-jdc-muted">
          Addresses you book a pickup with are saved here, so you can pick them next time.
        </p>
        <button type="button" className={BTN} onClick={() => startBooking()}>
          Book a pickup <ProtoIcon name="arrow" size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {list.map((a) => {
        const line1 = a?.streetAddress || a?.title || "Address";
        const line2 = [a?.district, a?.province].filter(Boolean).join(", ");
        const type = a?.title && a.title !== line1 ? a.title : a?.addressType;
        return (
          <div className={CARD} key={a?.id ?? line1}>
            <span className={ICON}>
              <ProtoIcon name="home" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[15.5px] font-semibold text-jdc-navy">{line1}</p>
              {line2 ? <p className="m-0 mt-0.5 text-[14px] text-jdc-muted">{line2}</p> : null}
            </div>
            {type ? (
              <span className="flex-none rounded-jdc-pill bg-[#F1F3F7] px-2.5 py-1 text-[12px] font-bold capitalize text-jdc-navy">
                {String(type)}
              </span>
            ) : null}
          </div>
        );
      })}
      <p className="m-0 mt-1 text-[13.5px] text-jdc-muted">
        New addresses are saved when you book a pickup with them.
      </p>
    </div>
  );
}
