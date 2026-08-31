"use client";
import React from "react";
import { MdMyLocation, MdOutlineMap } from "react-icons/md";

export function isLiveTrackingStatus(bookingStatusId) {
  const id = Number(bookingStatusId);
  return id === 3 || id === 4 || id === 12 || id === 13;
}

function statusHint(bookingStatusId) {
  switch (Number(bookingStatusId)) {
    case 3:
      return "Your driver can start live tracking before they tap “On the way”.";
    case 4:
      return "Your driver is on the way to collect your laundry.";
    case 12:
      return "Your driver can start live tracking before going out for delivery.";
    case 13:
      return "Your driver is on the way with your laundry.";
    case 5:
    case 14:
      return "Your driver has arrived. Live tracking has ended.";
    case 19:
      return "This order was cancelled.";
    default:
      return 'Live tracking appears when your driver taps "On the way" for pickup or delivery.';
  }
}

/**
 * Mirrors the Flutter LiveTrackingAction CTA.
 * Active button for status 3/4 (pickup) and 12/13 (delivery).
 */
export default function LiveTrackingAction({
  bookingStatusId,
  onTrack,
  className = "",
}) {
  const available = isLiveTrackingStatus(bookingStatusId);

  if (available) {
    return (
      <button
        type="button"
        onClick={onTrack}
        className={`w-full h-12 rounded-xl bg-theme-blue text-white font-sf font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${className}`}
      >
        <MdMyLocation size={20} />
        Track driver on map
      </button>
    );
  }

  return (
    <div
      className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3.5 flex gap-2.5 ${className}`}
    >
      <MdOutlineMap size={22} className="text-gray-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="font-sf font-semibold text-sm text-gray-700">
          Track driver on map
        </p>
        <p className="font-sf text-[13px] text-gray-500 mt-1">
          {statusHint(bookingStatusId)}
        </p>
      </div>
    </div>
  );
}
