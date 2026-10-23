"use client";

import FaqList, { toFaqList } from "./ds/FaqList";
import { useGetFAQsQuery } from "../src/app/store/services/api";

/*
 * FAQ block used on the booking pages. Same data source as before
 * (admin/getAllFAQs), rendered with the design system FaqList.
 * Previous version: see git history (before the 2026 redesign)
 */
export default function FAQs() {
  const { data, isLoading, isError } = useGetFAQsQuery();
  const faqs = toFaqList(data);

  return (
    <section className="mx-auto w-full max-w-[720px] py-12 sm:py-16" aria-labelledby="faqs-title">
      <h2
        id="faqs-title"
        className="mb-6 text-center font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-jdc-navy sm:text-[34px]"
      >
        Wants to know more?
      </h2>
      {isLoading ? (
        <p className="py-6 text-center font-body text-jdc-muted" aria-busy="true">
          Loading questions…
        </p>
      ) : isError || !faqs.length ? (
        <p className="py-6 text-center font-body text-jdc-muted">
          No questions right now. Visit our <a className="font-bold text-jdc-blue" href="/help-center">help centre</a>.
        </p>
      ) : (
        <FaqList items={faqs} />
      )}
    </section>
  );
}
