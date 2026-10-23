"use client";

import Link from "next/link";
import Button from "../ds/Button";
import FaqList from "../ds/FaqList";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import { Container } from "../ds/Layout";
import { formatPrice } from "../../utilities/formatPrice";
import { LIST_NOTE, PRICING_FAQ, PRICING_HERO } from "./content";
import { usePricingData } from "./usePricingData";

/** Class strings formerly in pricing.module.css (IC and SHIMMER are shared with PriceDetailView). */
export const SHIMMER =
  "bg-[linear-gradient(90deg,var(--jdc-white)_0%,var(--jdc-mist)_50%,var(--jdc-white)_100%)] [background-size:200%_100%] animate-jdc-shimmer";
export const IC =
  "flex-none w-12 h-12 rounded-[14px] bg-[#f1f3f7] text-jdc-navy flex items-center justify-center max-[720px]:w-[42px] max-[720px]:h-[42px] max-[720px]:rounded-[12px]";
const ROW =
  "flex items-center gap-4 w-full py-[18px] px-5 border border-jdc-line rounded-[18px] text-inherit no-underline [transition:border-color_0.15s,box-shadow_0.15s] hover:border-jdc-blue hover:[box-shadow:0_0_0_1px_var(--jdc-blue)] max-[720px]:p-[14px] max-[720px]:gap-3 max-[720px]:rounded-[16px]";
const LIST = "list-none mx-auto my-0 p-0 max-w-[860px] grid gap-3 max-[720px]:gap-[10px]";

export const serviceHref = (id) => `/pricing/service-detail?id=${encodeURIComponent(id)}`;

export default function PricingListView() {
  const { services, currency, isLoading, isError, refetch } = usePricingData();

  return (
    <PageShell header="overlay">
      <PageHero
        size="sm"
        title={
          <>
            {PRICING_HERO.titleA} <span>{PRICING_HERO.titleB}</span>
          </>
        }
        lead={PRICING_HERO.lead}
      />

      <section className="pt-10 px-0 pb-6 max-[720px]:pt-6" aria-labelledby="services-heading">
        <Container>
          <h2 id="services-heading" className="sr-only">
            Services
          </h2>

          {isLoading ? (
            <ul className={LIST} aria-busy="true" aria-label="Loading services">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className={`${ROW} h-[92px] ${SHIMMER}`} />
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
            />
          ) : (
            <>
              <ul className={LIST}>
                {services.map((s) => (
                  <li key={s.id}>
                    <Link href={serviceHref(s.id)} className={`${ROW} bg-jdc-white`}>
                      <span className={IC}>
                        <Icon name={s.icon} size={22} />
                      </span>
                      <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                        <strong className="font-display font-bold text-[17px] text-jdc-navy max-[720px]:text-[15.5px]">{s.name}</strong>
                        {s.description ? <small className="text-[14px] leading-[1.45] text-jdc-muted max-[720px]:text-[13px]">{s.description}</small> : null}
                        <span className="flex flex-wrap gap-[6px_14px] mt-1 text-[13px] font-bold text-jdc-navy [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[5px] [&_svg]:text-jdc-blue">
                          {s.minPrice !== null ? (
                            <span>From {formatPrice(s.minPrice, currency)}</span>
                          ) : null}
                          {s.turnaround ? (
                            <span>
                              <Icon name="clockBold" size={13} /> {s.turnaround}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="flex-none flex text-jdc-navy">
                        <Icon name="caretRight" size={18} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="max-w-[860px] mt-[14px] mx-auto mb-0 text-[13.5px] text-jdc-muted">{LIST_NOTE}</p>
            </>
          )}
        </Container>
      </section>

      <PricingFaq />
    </PageShell>
  );
}

export function PricingFaq() {
  return (
    <section className="pt-14 px-0 pb-16 bg-jdc-mist max-[720px]:pt-10 max-[720px]:pb-11" aria-labelledby="pricing-faq-title">
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
