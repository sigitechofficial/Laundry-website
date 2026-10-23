"use client";

import { useMemo, useState } from "react";
import Button from "../ds/Button";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import { CtaBand } from "../ds/Blocks";
import { Container } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { cx } from "../ds/cx";

/*
 * Customer reviews in the site design (dark page hero, rating summary,
 * filter pills, white review cards with thin borders, navy closing band).
 * Same reviews and rating numbers as before; they are still static content.
 * Previous version: see git history (before the 2026 redesign)
 */

const REVIEWS = [
  { id: 1, name: "Samantha Johnson", rating: 5, date: "March 2025", service: "Wash & Fold", quote: "With a toddler at home and a full-time job, finding time for laundry was nearly impossible. Now, with scheduled pickups and deliveries, I have one less thing to worry about. Thank you for making my life easier!" },
  { id: 2, name: "Michael Chen", rating: 5, date: "February 2025", service: "Dry Cleaning", quote: "The dry cleaning quality is exceptional. My suits look brand new every time. The team is professional and the turnaround is always on time. Highly recommend!" },
  { id: 3, name: "Emily Rodriguez", rating: 5, date: "January 2025", service: "Wash & Fold", quote: "I've tried many laundry services and this is by far the best. The folding is perfect, clothes smell fresh, and the prices are fair. My whole family uses them now." },
  { id: 4, name: "James Wilson", rating: 5, date: "December 2024", service: "Ironing", quote: "Outstanding ironing service! My work shirts are always crisp and ready. Saves me so much time in the morning. Great customer service too." },
  { id: 5, name: "Sarah Thompson", rating: 5, date: "November 2024", service: "Wash & Fold", quote: "Eco-friendly products and top-notch care for my clothes. I feel good about using a service that cares about the environment. Will keep coming back!" },
  { id: 6, name: "David Patel", rating: 4, date: "October 2024", service: "Dry Cleaning", quote: "Very reliable service. My delicate fabrics came back in perfect condition. The app makes booking super easy and the driver was friendly and on time." },
  { id: 7, name: "Olivia Martinez", rating: 5, date: "October 2024", service: "Wash & Fold", quote: "Absolutely love this service. The clothes come back beautifully folded and smelling wonderful. Customer support is responsive and helpful." },
  { id: 8, name: "Thomas Brown", rating: 4, date: "September 2024", service: "Ironing", quote: "Really good value for money. My office wear is always perfectly pressed. The only small thing is I wish there were more time slot options, but otherwise great!" },
  { id: 9, name: "Natalie Clarke", rating: 5, date: "August 2024", service: "Dry Cleaning", quote: "Took a risk with my expensive designer coat and I'm so glad I did. It came back spotless and perfectly pressed. These guys really know what they're doing." },
];

const BREAKDOWN = [
  { stars: 5, count: 187 },
  { stars: 4, count: 42 },
  { stars: 3, count: 12 },
  { stars: 2, count: 4 },
  { stars: 1, count: 2 },
];
const TOTAL = BREAKDOWN.reduce((s, r) => s + r.count, 0);
const AVERAGE = BREAKDOWN.reduce((s, r) => s + r.stars * r.count, 0) / TOTAL;

const STAR_PATH = "M12 2.5l2.94 6.07 6.56.92-4.78 4.6 1.16 6.56L12 17.52l-5.88 3.13 1.16-6.56-4.78-4.6 6.56-.92L12 2.5z";

/** Five stars; fractional ratings fill the last star partly. */
function Stars({ rating, size = 16, className }) {
  return (
    <span className={cx("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 text-[#DDE3EE]" aria-hidden="true">
              <path d={STAR_PATH} fill="currentColor" />
            </svg>
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg width={size} height={size} viewBox="0 0 24 24" className="text-jdc-star" aria-hidden="true">
                <path d={STAR_PATH} fill="currentColor" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const FILTERS = [0, 5, 4, 3, 2, 1];

export default function ReviewsView() {
  const [filter, setFilter] = useState(0);
  const shown = useMemo(() => (filter ? REVIEWS.filter((r) => r.rating === filter) : REVIEWS), [filter]);

  return (
    <PageShell header="overlay">
      <PageHero
        size="sm"
        title={
          <>
            Real reviews. <span>Real customers.</span>
          </>
        }
        lead="See why people across London trust us with their laundry and dry cleaning every week."
      >
        <div className="mt-6 inline-flex items-center gap-3 rounded-jdc-pill border border-white/[0.22] bg-white/10 py-2 pl-3 pr-4 text-[14.5px] font-semibold text-jdc-white backdrop-blur-[6px]">
          <Stars rating={AVERAGE} size={16} />
          <span>
            {AVERAGE.toFixed(1)} out of 5 &middot; {TOTAL} reviews
          </span>
        </div>
      </PageHero>

      <section className="px-0 pb-20 pt-14 max-[720px]:pb-12 max-[720px]:pt-8">
        <Container className="grid grid-cols-[320px_minmax(0,1fr)] [align-items:start] gap-10 max-[1080px]:grid-cols-[minmax(0,1fr)] max-[1080px]:gap-7">
          {/* Rating summary */}
          <aside
            className="sticky top-[calc(var(--jdc-header-h)+16px)] rounded-jdc-lg border border-jdc-line bg-jdc-white p-6 max-[1080px]:static max-[1080px]:grid max-[1080px]:grid-cols-[auto_minmax(0,1fr)] max-[1080px]:items-center max-[1080px]:gap-8 max-[720px]:grid-cols-[minmax(0,1fr)] max-[720px]:gap-5 max-[720px]:p-5"
            aria-label="Overall rating"
          >
            <div className="max-[1080px]:text-center max-[720px]:text-left">
              <p className="m-0 text-[12px] font-bold uppercase tracking-[0.1em] text-jdc-muted">Overall rating</p>
              <p className="m-0 mt-2 flex items-baseline gap-1.5 max-[1080px]:justify-center max-[720px]:justify-start">
                <b className="font-display text-[48px] font-bold leading-none tracking-[-0.02em] text-jdc-navy">{AVERAGE.toFixed(1)}</b>
                <span className="text-[16px] text-jdc-muted">/ 5</span>
              </p>
              <Stars rating={AVERAGE} size={20} className="mt-2" />
              <p className="m-0 mt-1.5 text-[14px] text-jdc-muted">Based on {TOTAL} reviews</p>
            </div>
            <ul className="m-0 mt-5 grid list-none gap-2 p-0 max-[1080px]:mt-0">
              {BREAKDOWN.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-2.5 text-[13.5px] text-jdc-muted">
                  <span className="w-3 flex-none font-semibold text-jdc-navy">{stars}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" className="flex-none text-jdc-star" aria-hidden="true">
                    <path d={STAR_PATH} fill="currentColor" />
                  </svg>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF2F8]">
                    <span className="block h-full rounded-full bg-jdc-blue" style={{ width: `${(count / TOTAL) * 100}%` }} />
                  </span>
                  <span className="w-8 flex-none text-right">{count}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Reviews */}
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => {
                const on = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilter(f)}
                    className={cx(
                      "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-jdc-pill border border-jdc-line bg-jdc-white px-4 text-[14px] font-semibold text-jdc-navy transition-colors hover:border-[#C5CEDD]",
                      on && "border-jdc-blue bg-jdc-blue-tint text-jdc-blue hover:border-jdc-blue"
                    )}
                  >
                    {f === 0 ? (
                      "All reviews"
                    ) : (
                      <>
                        {f}
                        <svg width="13" height="13" viewBox="0 0 24 24" className="text-jdc-star" aria-hidden="true">
                          <path d={STAR_PATH} fill="currentColor" />
                        </svg>
                      </>
                    )}
                  </button>
                );
              })}
              <span className="ml-auto text-[14px] text-jdc-muted max-[720px]:ml-0 max-[720px]:w-full">
                {shown.length} review{shown.length === 1 ? "" : "s"}
              </span>
            </div>

            {shown.length ? (
              <ul className="m-0 grid list-none grid-cols-[repeat(2,minmax(0,1fr))] gap-4 p-0 max-[720px]:grid-cols-[minmax(0,1fr)] max-[720px]:gap-3">
                {shown.map((r) => (
                  <li key={r.id} className="flex flex-col rounded-[18px] border border-jdc-line bg-jdc-white p-6 max-[720px]:p-5">
                    <Stars rating={r.rating} size={16} />
                    <p className="m-0 mt-3.5 flex-1 text-[15.5px] leading-[1.6] text-jdc-text">&ldquo;{r.quote}&rdquo;</p>
                    <div className="mt-5 flex items-center gap-3 border-t border-jdc-line pt-4">
                      <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-[#F1F3F7] font-display text-[14px] font-bold text-jdc-navy">
                        {initials(r.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block text-[14.5px] font-semibold text-jdc-navy">{r.name}</b>
                        <small className="block text-[13px] text-jdc-muted">
                          {r.service} &middot; {r.date}
                        </small>
                      </span>
                      <span className="flex-none rounded-jdc-pill bg-[#F1F3F7] px-2.5 py-1 text-[11.5px] font-bold text-jdc-navy">Verified</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 rounded-jdc-lg border border-jdc-line bg-jdc-white p-8 text-center text-jdc-muted">No reviews with this rating yet.</p>
            )}
          </div>
        </Container>
      </section>

      <section className="px-0 pb-20 max-[720px]:pb-12">
        <Container>
          <CtaBand
            titleA="Love clean clothes?"
            titleB="So do we."
            body="Collected from your door, cleaned by specialists and delivered back in a one-hour window."
            actions={
              <Button href={ROUTES.pricing} variant="white">
                See prices & services
              </Button>
            }
          />
        </Container>
      </section>
    </PageShell>
  );
}
