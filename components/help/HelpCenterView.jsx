"use client";

import { useId, useMemo, useState } from "react";
import Button from "../ds/Button";
import FaqList, { toFaqList } from "../ds/FaqList";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import { CtaBand, LinkCard, PageHead } from "../ds/Blocks";
import { Container } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { FAQ as HOME_FAQ } from "../home/content";
import { useGetFAQsQuery } from "../../src/app/store/services/api";

/** Help topics point at the page that actually answers them. */
const TOPICS = [
  { icon: "sparkle", title: "How Just Dry Cleans works", body: "What to expect, from booking to delivery.", href: ROUTES.howItWorks },
  { icon: "hanger", title: "Our services", body: "What we clean and how we care for it.", href: ROUTES.pricing },
  { icon: "calendarCheck", title: "Help with your booking", body: "Scheduling, changes and not being at home.", href: "#faq" },
  { icon: "envelope", title: "Pricing and billing", body: "How and when you are charged.", href: ROUTES.pricing },
  { icon: "userBold", title: "My account", body: "Keep your details and addresses up to date.", href: "/profile" },
  { icon: "refresh", title: "Cancellations & refunds", body: "Our cancellation and re-clean policies.", href: ROUTES.terms },
  { icon: "door", title: "Protecting your data", body: "How we keep your information safe.", href: ROUTES.privacy },
  { icon: "leaf", title: "Garment care tips", body: "Guides on stains, storage and fabrics.", href: ROUTES.blog },
  { icon: "phone", title: "Contact us", body: "Talk to a real person.", href: ROUTES.contact },
];

const matches = (q, ...fields) => fields.some((f) => String(f).toLowerCase().includes(q));

export default function HelpCenterView() {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGetFAQsQuery();
  const live = toFaqList(data);
  const allFaqs = live.length ? live : HOME_FAQ.fallback;

  const q = query.trim().toLowerCase();
  const topics = useMemo(() => (q ? TOPICS.filter((t) => matches(q, t.title, t.body)) : TOPICS), [q]);
  const faqs = useMemo(
    () => (q ? allFaqs.filter((f) => matches(q, f.question, f.answer)) : allFaqs),
    [q, allFaqs]
  );
  const nothing = q && !topics.length && !faqs.length;

  return (
    <PageShell header="overlay">
      <PageHero
        size="sm"
        title={
          <>
            Hi there. <span>How can we help?</span>
          </>
        }
        lead="Search our help centre or browse a topic below."
      >
        <form className="mt-7 flex h-[60px] max-w-[620px] items-center gap-3 rounded-jdc-pill bg-jdc-white px-5 text-jdc-muted focus-within:[box-shadow:0_0_0_3px_var(--jdc-blue)] max-[720px]:mt-[22px] max-[720px]:h-[52px]" role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor={searchId} className="sr-only">
            Search help
          </label>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id={searchId}
            type="search"
            placeholder="Search, e.g. cancel, address, prices"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent text-[16px] text-jdc-text [outline:none]"
          />
        </form>
      </PageHero>

      <section className="px-0 pb-20 pt-14 max-[720px]:pb-12 max-[720px]:pt-8" aria-live="polite">
        <Container>
          {nothing ? (
            <div className="mx-auto my-0 max-w-[560px] rounded-jdc-lg border border-jdc-line bg-jdc-white p-8 text-center" role="status">
              <h2 className="mx-0 mb-1.5 mt-0 font-display text-[22px] text-jdc-navy">No results for &ldquo;{query}&rdquo;</h2>
              <p className="mx-0 mb-[18px] mt-0 text-jdc-muted">Try a different word, or get in touch and we will help.</p>
              <Button href={ROUTES.contact}>Contact us</Button>
            </div>
          ) : (
            <>
              {topics.length ? (
                <>
                  <PageHead title={q ? "Matching topics" : "Browse topics"} />
                  <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4 max-[1080px]:grid-cols-[1fr_1fr] max-[720px]:grid-cols-[1fr] max-[720px]:gap-2.5">
                    {topics.map((t) => (
                      <LinkCard key={t.title} href={t.href} icon={t.icon} title={t.title} body={t.body} />
                    ))}
                  </div>
                </>
              ) : null}

              {faqs.length ? (
                <div id="faq" className="mx-auto mt-14 max-w-[640px] scroll-mt-[calc(var(--jdc-header-h)+24px)] max-[720px]:mt-10">
                  <PageHead
                    center
                    title={
                      q ? (
                        "Matching questions"
                      ) : (
                        <>
                          Frequently asked <em>questions.</em>
                        </>
                      )
                    }
                  />
                  <FaqList items={faqs} aria-busy={isLoading || undefined} />
                </div>
              ) : null}
            </>
          )}

          <div className="mt-16 max-[720px]:mt-10">
            <CtaBand
              titleA="Still need"
              titleB="a hand?"
              body="Our team is happy to help with orders, prices or anything else."
              actions={
                <Button variant="white" href={ROUTES.contact}>
                  Contact us
                </Button>
              }
            />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
