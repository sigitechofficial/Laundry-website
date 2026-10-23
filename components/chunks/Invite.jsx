"use client";

import { useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/react";
import ProtoIcon from "../proto/ProtoIcon";

/*
 * Invite friends, as in the prototype (account-invite.html, final "calm" version, .rf-*):
 * white card with the offer + a code ticket, "Share it your way" buttons,
 * "You get / They get" perks and the small print. Grey icon tiles, navy icons.
 * The code is made from the account email, like the prototype, until the API provides one.
 * Previous version: see git history (before the 2026 redesign)
 */

// Referral amounts: set these when the offer is decided (the prototype shows £[X]).
const REFERRAL = { youGet: null, theyGet: null }; // e.g. { youGet: "£10", theyGet: "20%" }

const LABEL = "m-0 mb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-jdc-muted";
const SHARE_BTN =
  "flex h-16 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border border-jdc-line bg-white text-[13px] font-semibold text-jdc-navy no-underline transition-colors hover:border-[#C5CEDD] hover:bg-jdc-mist max-[720px]:h-[62px] max-[720px]:text-[12.5px] [&_svg]:text-jdc-navy";
const PERK = "flex items-start gap-3.5 rounded-2xl border border-jdc-line bg-white p-4";
const PERK_IC = "flex size-[42px] flex-none items-center justify-center rounded-xl bg-[#F1F3F7] text-jdc-navy";

function refCode(email) {
  const seed = String(email || "friend").toUpperCase().replace(/[^A-Z0-9]/g, "");
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `JDC-${seed[0] || "A"}${(h % 9000) + 1000}`;
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    addToast({ title: message, color: "success" });
  } catch {
    addToast({ title: "Could not copy. Please copy it manually.", color: "warning" });
  }
}

export default function Invite() {
  const [email, setEmail] = useState("");
  const [origin, setOrigin] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    try {
      setEmail(localStorage.getItem("email") || "");
    } catch {
      // no stored email: a generic code is used
    }
    setOrigin(window.location.origin);
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const code = useMemo(() => refCode(email), [email]);
  const link = `${origin}/?ref=${code}`;
  const offer = REFERRAL.theyGet ? `Get ${REFERRAL.theyGet} off` : "Get money off";
  const message = `${offer} your first Just Dry Cleans order with my code ${code}: ${link}`;

  const title =
    REFERRAL.youGet && REFERRAL.theyGet ? `Give ${REFERRAL.theyGet}, get ${REFERRAL.youGet}` : "Give money off, get credit";
  const lead = `Share your code. Your friend saves ${REFERRAL.theyGet || "money"} on their first order, and you get ${
    REFERRAL.youGet ? `${REFERRAL.youGet} credit` : "credit"
  } once it has been delivered.`;

  return (
    <div className="grid gap-[22px]">
      {/* Offer + code ticket */}
      <section className="grid grid-cols-[minmax(0,1fr)_320px] items-center gap-7 rounded-[20px] border border-jdc-line bg-white p-7 max-[860px]:grid-cols-1 max-[860px]:gap-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[18px] max-[860px]:py-[22px]">
        <div className="min-w-0">
          <span className="inline-flex h-7 items-center gap-2 rounded-jdc-pill bg-[#F1F3F7] pl-[11px] pr-3.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-jdc-navy">
            <ProtoIcon name="ntGift" size={15} />
            Refer a friend
          </span>
          <h2 className="m-0 mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.01em] text-jdc-navy max-[720px]:text-[24px]">
            {title}
          </h2>
          <p className="m-0 mt-2 max-w-[380px] text-[15px] leading-[1.55] text-jdc-muted">{lead}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-jdc-line bg-white px-[18px] pb-5 pt-[18px] text-center">
          <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.12em] text-jdc-muted">Your code</p>
          <p className="m-0 mb-2.5 mt-1.5 font-display text-[26px] font-extrabold leading-[1.1] tracking-[0.04em] text-jdc-navy max-[720px]:text-[24px]">
            {code}
          </p>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-[7px] rounded-jdc-pill border-0 bg-jdc-blue-tint px-3.5 py-[7px] text-[13.5px] font-bold text-jdc-blue hover:bg-[#DCE9FF]"
            onClick={() => copyText(code, "Code copied")}
          >
            <ProtoIcon name="rfCopy" size={16} />
            <span>Copy code</span>
          </button>
        </div>
      </section>

      {/* Share */}
      <div>
        <p className={LABEL}>Share it your way</p>
        <div className={`grid gap-2.5 max-[720px]:gap-2 ${canShare ? "grid-cols-4" : "grid-cols-3"}`}>
          <a className={SHARE_BTN} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <ProtoIcon name="rfWhatsapp" size={20} />
            WhatsApp
          </a>
          <a
            className={SHARE_BTN}
            href={`mailto:?subject=${encodeURIComponent("Money off your first Just Dry Cleans order")}&body=${encodeURIComponent(message)}`}
          >
            <ProtoIcon name="rfMail" size={20} />
            Email
          </a>
          <button type="button" className={SHARE_BTN} onClick={() => copyText(link, "Invite link copied")}>
            <ProtoIcon name="rfLink" size={20} />
            Copy link
          </button>
          {canShare ? (
            <button
              type="button"
              className={SHARE_BTN}
              onClick={() => navigator.share({ title: "Just Dry Cleans", text: message, url: link }).catch(() => {})}
            >
              <ProtoIcon name="rfShare" size={20} />
              More
            </button>
          ) : null}
        </div>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
        <div className={PERK}>
          <span className={PERK_IC}>
            <ProtoIcon name="rfWallet" size={20} />
          </span>
          <div>
            <p className={`${LABEL} !mb-0.5`}>You get</p>
            <p className="m-0 mb-1 font-display text-[20px] font-bold leading-[1.1] text-jdc-navy">
              {REFERRAL.youGet ? `${REFERRAL.youGet} credit` : "Account credit"}
            </p>
            <small className="text-[13.5px] leading-[1.45] text-jdc-muted">For every friend who completes their first order.</small>
          </div>
        </div>
        <div className={PERK}>
          <span className={PERK_IC}>
            <ProtoIcon name="rfTag" size={20} />
          </span>
          <div>
            <p className={`${LABEL} !mb-0.5`}>They get</p>
            <p className="m-0 mb-1 font-display text-[20px] font-bold leading-[1.1] text-jdc-navy">
              {REFERRAL.theyGet ? `${REFERRAL.theyGet} off` : "Money off"}
            </p>
            <small className="text-[13.5px] leading-[1.45] text-jdc-muted">
              Their first order with your code <b className="text-jdc-navy">{code}</b>.
            </small>
          </div>
        </div>
      </div>

      <p className="m-0 mx-0.5 -mt-3 text-[13px] text-jdc-muted">
        Credit is added to your account after your friend&rsquo;s first order is delivered.
      </p>
    </div>
  );
}
