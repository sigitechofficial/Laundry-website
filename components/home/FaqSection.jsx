"use client";

import Link from "next/link";
import FaqList, { toFaqList } from "../ds/FaqList";
import Reveal from "../ds/Reveal";
import { Container, Lead, Section } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { FAQ } from "./content";
import { useGetFAQsQuery } from "../../src/app/store/services/api";

const MAX_ITEMS = 6;

export default function FaqSection() {
  const { data, isLoading } = useGetFAQsQuery();
  const live = toFaqList(data);
  const items = (live.length ? live : FAQ.fallback).slice(0, MAX_ITEMS);

  return (
    <Section aria-labelledby="faq-title">
      <Container>
        {/* centred, like the FAQ on every other page: heading + lead, then the list */}
        <div className="mx-auto grid max-w-[640px] gap-8 [&>*]:min-w-0 max-[720px]:gap-6">
          <Reveal className="text-center">
            <h2
              id="faq-title"
              className="m-0 font-display text-jdc-h2 font-bold leading-[1.08] tracking-[-0.02em] text-jdc-navy"
            >
              {FAQ.title}
            </h2>
            <Lead className="mt-[20px] [&_a:hover]:underline [&_a]:font-bold [&_a]:text-jdc-blue [&_a]:no-underline">
              Can&apos;t find what you need? Visit the <Link href={ROUTES.helpCenter}>Help centre</Link> or{" "}
              <Link href={ROUTES.contact}>contact us</Link>.
            </Lead>
          </Reveal>
          <Reveal aria-busy={isLoading || undefined}>
            <FaqList items={items} />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
