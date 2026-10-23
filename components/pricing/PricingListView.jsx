"use client";

import Link from "next/link";
import Button from "../ds/Button";
import FaqList from "../ds/FaqList";
// service icons: same thin-line set as the Services page (one stroke weight)
import ProtoIcon, { serviceIconName } from "../proto/ProtoIcon";
import PageShell from "../ds/PageShell";
import { Container } from "../ds/Layout";
import { Bone } from "../ds/Skeleton";
import { formatPrice } from "../../utilities/formatPrice";
import { PRICING_FAQ, PRICING_HERO, serviceTagline } from "./content";
import { usePricingData } from "./usePricingData";

/** Class strings formerly in pricing.module.css (IC and SHIMMER are shared with PriceDetailView). */
export const SHIMMER =
  "bg-[linear-gradient(90deg,var(--jdc-white)_0%,var(--jdc-mist)_50%,var(--jdc-white)_100%)] [background-size:200%_100%] animate-jdc-shimmer";
export const IC =
  "flex-none w-12 h-12 rounded-[14px] bg-[#f1f3f7] text-jdc-navy flex items-center justify-center max-[720px]:w-[42px] max-[720px]:h-[42px] max-[720px]:rounded-[12px]";
const ROW =
  "flex h-full items-center gap-4 w-full py-[18px] px-5 border border-jdc-line rounded-[18px] text-inherit no-underline [transition:border-color_0.15s,box-shadow_0.15s] hover:border-jdc-blue hover:[box-shadow:0_0_0_1px_var(--jdc-blue)] max-[720px]:p-[14px] max-[720px]:gap-3 max-[720px]:rounded-[16px]";
// two columns on desktop, one on tablets and phones
const LIST = "list-none m-0 p-0 grid grid-cols-2 gap-3 max-[980px]:grid-cols-1 max-[720px]:gap-[10px]";

export const serviceHref = (id) => `/pricing/service-detail?id=${encodeURIComponent(id)}`;

// admin description first; built-in summary only when it is empty or repeats the name
const cardBlurb = (s) => {
  const d = String(s?.description || "").trim();
  return d && d.toLowerCase() !== String(s?.name || "").trim().toLowerCase() ? d : serviceTagline(s?.name);
};

export default function PricingListView() {
  const { services, currency, isLoading, isError, refetch } = usePricingData();

  return (
    <PageShell header="solid">
      {/* Simple light heading (same style as the other inner pages) instead of the big dark hero */}
      <section className="pt-10 px-0 pb-12 max-[720px]:pt-6 max-[720px]:pb-8" aria-labelledby="services-heading">
        <Container>
          <h1 className="m-0 font-display text-[clamp(30px,3.2vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-jdc-navy">
            {PRICING_HERO.title}
          </h1>
          <p className="mx-0 mb-7 mt-2.5 text-[16.5px] text-jdc-muted max-[720px]:mb-5 max-[720px]:text-[15px]">{PRICING_HERO.lead}</p>
          <h2 id="services-heading" className="sr-only">
            Services
          </h2>

          {isLoading ? (
            <ul className={LIST} aria-busy="true" aria-label="Loading services">
              {/* same layout as a real card: icon, name, one-line summary, price, arrow */}
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i}>
                  <div className={`${ROW} bg-jdc-white`} aria-hidden="true">
                    <Bone className="size-12 flex-none rounded-[14px] max-[720px]:size-[42px] max-[720px]:rounded-[12px]" />
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <Bone className="h-[22px] w-32" />
                      <Bone className="h-[17px] w-[60%] max-w-[230px]" />
                      <Bone className="mt-1.5 h-[19px] w-28" />
                    </span>
                    <Bone className="h-4 w-2.5 flex-none rounded-sm" />
                  </div>
                </li>
              ))}
            </ul>
          ) : isError ? (
            <StatusCard
              title="We couldn't load our prices"
              body="Please check your connection and try again."
              action={<Button onClick={refetch}>Try again</Button>}
            />
          ) : services.length === 0 ? (
            <StatusCard
              title="No services available right now"
              body="Please check back soon or contact us for a quote."
              action={<Button href="/contact-us">Contact us</Button>}
            />
          ) : (
            <>
              <ul className={LIST}>
                {services.map((s) => (
                  <li key={s.id}>
                    <Link href={serviceHref(s.id)} className={`${ROW} bg-jdc-white`}>
                      <span className={IC}>
                        <ProtoIcon name={serviceIconName(s.name)} size={24} />
                      </span>
                      {/* hierarchy: name > price > description > turnaround */}
                      <span className="flex-1 min-w-0 flex flex-col gap-1">
                        <strong className="font-display font-bold text-[17.5px] leading-[1.25] text-jdc-navy max-[720px]:text-[15.5px]">{s.name}</strong>
                        {/* The service's description from the admin panel (services.description), on one
                            line here (full text on the service page, and as a tooltip). A short built-in
                            summary is used only when the admin left it empty or it just repeats the name. */}
                        {cardBlurb(s) ? (
                          <small className="truncate text-[14px] leading-[1.45] text-jdc-muted max-[720px]:text-[13px]" title={cardBlurb(s)}>
                            {cardBlurb(s)}
                          </small>
                        ) : null}
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          {s.minPrice !== null ? (
                            <span className="text-[14.5px] font-semibold text-jdc-navy">
                              <span className="font-normal text-jdc-muted">From </span>
                              {formatPrice(s.minPrice, currency)}
                            </span>
                          ) : null}
                          {s.turnaround ? (
                            <span className="inline-flex items-center gap-[5px] text-[13px] text-jdc-muted [&_svg]:text-[#8A93A6]">
                              {s.minPrice !== null ? <span aria-hidden="true" className="size-1 rounded-full bg-[#C5CEDD]" /> : null}
                              <ProtoIcon name="clock" size={13} /> {s.turnaround}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="flex-none flex text-[#8A93A6]">
                        <span className="-rotate-90 flex"><ProtoIcon name="chevDown" size={18} /></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Container>
      </section>

      {/* Held back until the list is in: the list's height depends on how many services
          there are, so a FAQ drawn under the placeholders was pushed down when it loaded.
          It stays in the page HTML (hidden) for search engines. */}
      <PricingFaq hidden={isLoading} />
    </PageShell>
  );
}

export function PricingFaq({ hidden = false }) {
  return (
    <section hidden={hidden} className="pt-14 px-0 pb-16 bg-jdc-mist max-[720px]:pt-10 max-[720px]:pb-11" aria-labelledby="pricing-faq-title">
      <Container>
        <h2 id="pricing-faq-title" className="m-[0_0_28px] text-center font-display font-bold text-jdc-h2 leading-[1.08] tracking-[-0.02em] text-jdc-navy">
          {PRICING_FAQ.title} <em className="not-italic">{PRICING_FAQ.titleEm}</em>
        </h2>
        <FaqList items={PRICING_FAQ.items} className="max-w-[640px] mx-auto my-0" />
      </Container>
    </section>
  );
}

export function StatusCard({ title, body, action }) {
  return (
    <div className="max-w-[560px] mx-auto my-0 p-8 text-center bg-jdc-white border border-jdc-line rounded-jdc-lg" role="status">
      <h3 className="m-[0_0_6px] font-display text-[20px] text-jdc-navy">{title}</h3>
      <p className="m-[0_0_18px] text-[15px] text-jdc-muted">{body}</p>
      {action}
    </div>
  );
}
