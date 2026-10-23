"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtoIcon from "../proto/ProtoIcon";

/*
 * Notifications, as in the prototype (account-notifications.html, .nt-*):
 * "N unread" + "Mark all as read", then one list of rows with a grey icon tile,
 * title, message, time and a blue dot while unread. A row opens the related
 * account page and is marked read (remembered in this browser).
 * The entries are the prototype's preview data until notifications come from the API.
 * Previous version: see git history (before the 2026 redesign)
 */
const NOTIFICATIONS = [
  { id: "n1", icon: "ntWarn", time: "19 Oct, 10:30 AM", title: "Action needed on your order", text: "We found an issue with an item in your order. Tell us what to do with it.", href: "/profile?tab=on-hold-bookings" },
  { id: "n2", icon: "ntWarn", time: "19 Oct, 9:12 AM", title: "Action needed on your order", text: "We found an issue with an item in your order. Tell us what to do with it.", href: "/profile?tab=on-hold-bookings" },
  { id: "n3", icon: "ntCal", time: "19 Oct, 8:05 AM", title: "Pickup booked", text: "Your pickup is booked. You can see the details in your orders.", href: "/profile?tab=order-history" },
  { id: "n4", icon: "truck", time: "18 Oct, 6:41 PM", title: "Order delivered", text: "Your order has been delivered. Thanks for choosing Just Dry Cleans.", href: "/profile?tab=order-history" },
  { id: "n5", icon: "ntHanger", time: "18 Oct, 9:20 AM", title: "Your clothes are being cleaned", text: "Your order has arrived at our cleaning partner.", href: "/profile?tab=order-history" },
  { id: "n6", icon: "ntGift", time: "12 Oct, 11:00 AM", title: "Invite a friend", text: "Invite a friend and you both save on your next order.", href: "/profile?tab=invite-friend" },
];

const READ_KEY = "jdc_ntread";

function loadRead() {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveRead(read) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(read));
  } catch {
    // storage unavailable: read state just isn't remembered
  }
}

export default function Notifications() {
  const [read, setRead] = useState({});

  useEffect(() => {
    setRead(loadRead());
  }, []);

  const markRead = (ids) => {
    setRead((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = 1;
      });
      saveRead(next);
      return next;
    });
  };

  const unread = NOTIFICATIONS.filter((n) => !read[n.id]).length;

  return (
    <section className="w-full" aria-label="Notifications">
      <div className="-mt-1.5 mb-3 flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-jdc-muted">{unread ? `${unread} unread` : "All caught up"}</span>
        {unread ? (
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent px-0 py-1 text-[13.5px] font-bold text-jdc-blue"
            onClick={() => markRead(NOTIFICATIONS.map((n) => n.id))}
          >
            Mark all as read
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[18px] border border-jdc-line bg-white">
        {NOTIFICATIONS.map((n) => {
          const isNew = !read[n.id];
          return (
            <Link
              key={n.id}
              href={n.href}
              onClick={() => markRead([n.id])}
              className="flex items-start gap-3 border-b border-jdc-line px-4 py-3.5 text-inherit no-underline transition-colors last:border-b-0 hover:bg-[#F7F8FA] max-[720px]:gap-2.5 max-[720px]:px-3.5 max-[720px]:py-3"
            >
              <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-[#F1F3F7] text-jdc-navy max-[720px]:size-[38px]">
                <ProtoIcon name={n.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className={`block text-[15px] text-jdc-navy max-[720px]:text-[14.5px] ${isNew ? "font-bold" : "font-semibold"}`}>
                  {n.title}
                </strong>
                <small className="mt-[3px] block text-[13.5px] leading-[1.45] text-jdc-muted">{n.text}</small>
                <time className="mt-[5px] block text-[12px] text-[#8A93A6]">{n.time}</time>
              </span>
              <span
                className={`mt-1.5 size-2.5 flex-none rounded-full ${isNew ? "bg-jdc-blue" : "bg-transparent"}`}
                aria-label={isNew ? "Unread" : "Read"}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
