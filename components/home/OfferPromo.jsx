"use client";

import Link from "next/link";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import Reveal from "../ds/Reveal";
import { Container } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { FIRST_ORDER_OFFER as OFFER } from "./content";
import { useStartBooking } from "../../utilities/useStartBooking";

/* Gradient box with two decorative rings (::before / ::after). Tablet and phone: coupon first, compact. */
const BOX =
  "relative grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-[56px] overflow-hidden rounded-jdc-2xl bg-[linear-gradient(135deg,#2a86ff_0%,#0c66e6_58%,#0a53c2_100%)] p-[64px] text-jdc-white [&>*]:relative [&>*]:z-[1] [&>*]:min-w-0 " +
  "before:pointer-events-none before:absolute before:right-[-120px] before:top-[-140px] before:h-[560px] before:w-[560px] before:rounded-[50%] before:border-2 before:border-solid before:border-[rgba(255,255,255,0.22)] before:content-[''] " +
  "after:pointer-events-none after:absolute after:right-[-40px] after:top-[-60px] after:h-[400px] after:w-[400px] after:rounded-[50%] after:border-2 after:border-solid after:border-[rgba(255,255,255,0.14)] after:content-[''] " +
  "max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-[16px] max-[1080px]:p-[32px_28px] max-[720px]:gap-[14px] max-[720px]:p-[26px_22px]";

const COUPON =
  "relative rounded-jdc-xl bg-jdc-white p-[44px_28px] text-center text-jdc-navy before:pointer-events-none before:absolute before:inset-[10px] before:rounded-[20px] before:border-2 before:border-dashed before:border-jdc-blue-line before:content-[''] " +
  "max-[1080px]:order-2 max-[1080px]:grid max-[1080px]:grid-cols-[auto_1fr] max-[1080px]:[grid-template-areas:'amt_eye'_'amt_sub'] max-[1080px]:items-center max-[1080px]:gap-x-[20px] max-[1080px]:rounded-[22px] max-[1080px]:p-[20px_22px] max-[1080px]:text-left max-[1080px]:before:inset-[8px] max-[1080px]:before:rounded-[15px]";

const EYEBROW =
  "m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-jdc-blue max-[1080px]:self-end max-[1080px]:text-[11.5px] max-[1080px]:[grid-area:eye]";

const AMOUNT =
  "m-[12px_0_0] font-display text-[length:clamp(52px,5vw,72px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-jdc-blue [&_span]:mt-[10px] [&_span]:block [&_span]:text-[0.3em] [&_span]:leading-none [&_span]:tracking-[0.22em] [&_span]:text-jdc-navy max-[1080px]:m-0 max-[1080px]:text-[48px] max-[1080px]:[grid-area:amt] max-[1080px]:[&_span]:mt-[6px] max-[1080px]:[&_span]:text-[0.26em]";

const SUB =
  "m-[18px_0_0] font-display text-[22px] font-semibold uppercase tracking-[0.04em] max-[1080px]:m-[4px_0_0] max-[1080px]:self-start max-[1080px]:text-[18px] max-[1080px]:leading-[1.15] max-[1080px]:[grid-area:sub]";

export default function OfferPromo() {
  const startBooking = useStartBooking();
  const hasAmount = Boolean(OFFER.amount);

  return (
    <section className="py-[72px] max-[1080px]:py-[40px] max-[720px]:py-[20px]" aria-labelledby="offer-title">
      <Container>
        <Reveal className={BOX}>
          <div className="max-[1080px]:contents">
            <span className="mb-[16px] inline-flex h-[34px] items-center gap-[8px] rounded-jdc-pill border border-solid border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.18)] p-[0_15px_0_12px] text-[12.5px] font-bold uppercase tracking-[0.07em] max-[1080px]:order-1 max-[1080px]:m-0 max-[1080px]:justify-self-start max-[720px]:h-[30px] max-[720px]:text-[11.5px]">
              <Icon name="giftBold" size={15} />
              {OFFER.badge}
            </span>
            <h2
              id="offer-title"
              className="m-0 font-display text-jdc-h2 font-extrabold uppercase leading-[1.08] tracking-[-0.02em] [word-break:keep-all] [&_span]:block max-[1080px]:hidden"
            >
              {OFFER.titleA} <span>{OFFER.titleB}</span>
            </h2>
            <p className="m-[18px_0_0] max-w-[460px] text-[18px] leading-[1.55] text-[rgba(255,255,255,0.92)] max-[1080px]:hidden">
              {OFFER.text}
            </p>
            <ul className="m-[24px_0_0] grid list-none gap-[12px] p-0 [&_svg]:h-[24px] [&_svg]:w-[24px] [&_svg]:flex-none [&_svg]:rounded-[50%] [&_svg]:bg-[rgba(255,255,255,0.22)] [&_svg]:p-[5px] max-[1080px]:order-3 max-[1080px]:m-[6px_0_0] max-[720px]:gap-[8px] max-[720px]:[&_svg]:h-[21px] max-[720px]:[&_svg]:w-[21px]">
              {OFFER.perks.map((perk) => (
                <li
                  key={perk.label}
                  className="flex items-center gap-[12px] text-[15.5px] font-medium max-[720px]:text-[14px]"
                >
                  <Icon name={perk.icon} />
                  {perk.short ? (
                    <>
                      <span className="max-[720px]:hidden">{perk.label}</span>
                      <span className="hidden max-[720px]:inline">{perk.short}</span>
                    </>
                  ) : (
                    perk.label
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-[28px] flex flex-wrap items-center gap-[12px_20px] max-[1080px]:order-4 max-[1080px]:m-[6px_0_0] max-[1080px]:flex-col max-[1080px]:items-stretch max-[1080px]:gap-[10px] max-[1080px]:text-center">
              <Button
                variant="white"
                size="lg"
                className="max-[1080px]:h-[54px] max-[1080px]:w-full max-[1080px]:text-[17px]"
                onClick={() => startBooking()}
              >
                {OFFER.cta}
              </Button>
              <small className="text-[14px] text-[rgba(255,255,255,0.8)] [&_a]:text-inherit [&_a]:underline [&_a]:underline-offset-[3px]">
                New customers only. <Link href={ROUTES.terms}>Terms apply.</Link>
              </small>
            </div>
          </div>

          <div className={COUPON} role="note" aria-label="New customer offer">
            {hasAmount ? (
              <>
                <p className={EYEBROW}>Book today and get</p>
                <p className={AMOUNT}>
                  {OFFER.amount}
                  <span>off</span>
                </p>
                <p className={SUB}>your first order</p>
              </>
            ) : (
              <>
                <p className={EYEBROW}>Every order includes</p>
                <p className={AMOUNT}>
                  Free
                  <span>pickup</span>
                </p>
                <p className={SUB}>&amp; delivery</p>
              </>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
