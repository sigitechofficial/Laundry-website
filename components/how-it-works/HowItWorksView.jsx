"use client";

import Image from "next/image";
import Button from "../ds/Button";
import FaqList, { toFaqList } from "../ds/FaqList";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import Reveal from "../ds/Reveal";
import { ArrowLink, CheckList, CtaBand, FeatureGrid, HeroChips, LinkCard, PageHead } from "../ds/Blocks";
import { Container } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { FAQ as HOME_FAQ } from "../home/content";
import { useGetFAQsQuery } from "../../src/app/store/services/api";
import { useStartBooking } from "../../utilities/useStartBooking";
import { HIW } from "./content";

// Every step but the last draws a connector line down to the next one.
const STEP_LINE =
  "relative grid grid-cols-[72px_1fr] gap-6 pb-10 before:absolute before:bottom-[-4px] before:left-[35px] before:top-[78px] before:w-0.5 before:bg-[linear-gradient(var(--jdc-blue),#bfd8fb)] before:content-[''] max-[720px]:grid-cols-[56px_1fr] max-[720px]:gap-4 max-[720px]:pb-7 max-[720px]:before:left-[27px] max-[720px]:before:top-[62px]";

export default function HowItWorksView() {
  const startBooking = useStartBooking();
  const { data } = useGetFAQsQuery();
  const live = toFaqList(data);
  const faqs = (live.length ? live : HOME_FAQ.fallback).slice(0, 4);

  return (
    <PageShell header="overlay">
      <PageHero
        image={HIW.hero.image}
        title={
          <>
            {HIW.hero.titleA} <span>{HIW.hero.titleB}</span>
          </>
        }
        lead={HIW.hero.lead}
      >
        <HeroChips items={HIW.hero.chips} />
      </PageHero>

      {/* Steps */}
      <section className="px-0 py-[72px] max-[720px]:py-[46px]" aria-labelledby="steps-title">
        <Container>
          <Reveal>
            <PageHead
              id="steps-title"
              center
              title={
                <>
                  {HIW.steps.titleA} <em>{HIW.steps.titleB}</em>
                </>
              }
              lead={HIW.steps.lead}
            />
          </Reveal>
          <div className="grid max-w-[1180px] grid-cols-[minmax(0,1fr)_460px] [margin:0_auto] gap-16 [align-items:start] max-[1080px]:max-w-[720px] max-[1080px]:grid-cols-[1fr]">
            <ol className="m-0 list-none p-0">
              {HIW.steps.items.map((step, i) => (
                <Reveal as="li" key={step.title} className={i < HIW.steps.items.length - 1 ? STEP_LINE : "relative grid grid-cols-[72px_1fr] gap-6 pb-0 max-[720px]:grid-cols-[56px_1fr] max-[720px]:gap-4"}>
                  <div className="relative z-[1] flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-jdc-navy text-jdc-white max-[720px]:h-14 max-[720px]:w-14 max-[720px]:rounded-[17px] max-[720px]:[&_svg]:h-6 max-[720px]:[&_svg]:w-6">
                    <Icon name={step.icon} size={28} />
                    <span className="absolute right-[-7px] top-[-7px] flex h-7 w-7 items-center justify-center rounded-[50%] border-[3px] border-solid border-jdc-paper bg-jdc-blue font-display text-[14px] font-extrabold text-jdc-white" aria-hidden="true">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="m-0 text-[12.5px] font-bold uppercase tracking-[0.14em] text-jdc-blue">Step {i + 1}</p>
                    <h3 className="mx-0 mb-2 mt-1 font-display text-[23px] leading-[1.15] tracking-[-0.01em] text-jdc-navy max-[720px]:text-[19px]">{step.title}</h3>
                    <p className="m-0 max-w-[540px] text-[16.5px] leading-[1.6] text-jdc-muted max-[720px]:text-[15px]">{step.body}</p>
                    <span className="mt-3 inline-flex items-center gap-[7px] rounded-jdc-pill bg-jdc-blue-tint px-[13px] py-1.5 text-[13px] font-bold text-jdc-blue-dark">
                      <Icon name="checkBold" size={14} />
                      {step.tag}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal as="aside" className="sticky top-[calc(var(--jdc-header-h)+16px)] h-[560px] overflow-hidden rounded-jdc-xl max-[1080px]:hidden [&_img]:object-cover">
              <Image src={HIW.steps.image} alt={HIW.steps.imageAlt} fill sizes="460px" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[18px] border border-[rgba(255,255,255,0.18)] bg-[rgba(27,34,48,0.72)] px-5 py-[18px] text-jdc-white backdrop-blur-[10px]">
                <p className="mx-0 mb-1 mt-0 text-[12px] font-bold uppercase tracking-[0.14em] text-jdc-sky">Every order</p>
                <b className="font-display text-[18px] leading-[1.25]">Cleaned, pressed and returned with care.</b>
              </div>
            </Reveal>
          </div>
          <Reveal className="mx-auto mb-0 mt-10 flex max-w-[1180px] items-center gap-[18px] pl-24 max-[1080px]:max-w-[720px] max-[720px]:mt-7 max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:gap-2.5 max-[720px]:pl-0 max-[720px]:text-center">
            <Button onClick={() => startBooking()}>Book your pickup</Button>
            <span className="text-[15px] text-jdc-muted">Takes about two minutes.</span>
          </Reveal>
        </Container>
      </section>

      {/* Transparency */}
      <section className="bg-jdc-mist px-0 py-[72px] max-[720px]:py-[46px]" aria-labelledby="track-title">
        <Container className="grid grid-cols-[1fr_1fr] items-center gap-[72px] max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-10 max-[720px]:gap-[26px] [&>*]:min-w-0">
          <Reveal>
            <PageHead
              id="track-title"
              className="mb-0 max-[720px]:mb-0"
              title={
                <>
                  {HIW.track.titleA} <em>{HIW.track.titleB}</em>
                </>
              }
              lead={HIW.track.lead}
            />
            <CheckList items={HIW.track.checks} />
            <div className="mt-7">
              <Button onClick={() => startBooking()}>Schedule your first pickup</Button>
            </div>
          </Reveal>
          <Reveal className="relative aspect-[5/4] overflow-hidden rounded-jdc-xl bg-jdc-white max-[720px]:aspect-[16/10] max-[720px]:rounded-[22px] [&_img]:object-cover">
            <Image src={HIW.track.image} alt={HIW.track.imageAlt} fill sizes="(max-width: 1080px) 100vw, 50vw" />
            <span className="absolute bottom-[18px] left-[18px] inline-flex items-center gap-2 rounded-jdc-pill border border-[rgba(255,255,255,0.26)] bg-[rgba(27,34,48,0.62)] px-4 py-2.5 text-[14px] font-bold text-jdc-white backdrop-blur-[10px] [&_svg]:text-jdc-sky">
              <Icon name="cameraBold" size={18} />
              Photo list at every collection
            </span>
          </Reveal>
        </Container>
      </section>

      {/* Fits your week */}
      <section className="px-0 py-[72px] max-[720px]:py-[46px]" aria-labelledby="week-title">
        <Container>
          <Reveal>
            <PageHead
              id="week-title"
              title={
                <>
                  {HIW.week.titleA} <em>{HIW.week.titleB}</em>
                </>
              }
            />
          </Reveal>
          <Reveal>
            <FeatureGrid items={HIW.week.items} />
          </Reveal>
        </Container>
      </section>

      {/* Where to start */}
      <section className="bg-jdc-mist px-0 py-[72px] max-[720px]:py-[46px]" aria-labelledby="start-title">
        <Container>
          <Reveal>
            <PageHead
              id="start-title"
              title={
                <>
                  {HIW.start.titleA} <em>{HIW.start.titleB}</em>
                </>
              }
            />
          </Reveal>
          <Reveal className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-6 max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-3">
            {HIW.start.items.map((c) => (
              <LinkCard key={c.title} href={ROUTES.pricing} icon={c.icon} title={c.title} body={c.body} />
            ))}
          </Reveal>
          <p className="mx-0 mb-0 mt-[26px]">
            <ArrowLink href={ROUTES.pricing}>See all prices &amp; services</ArrowLink>
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section className="px-0 py-[72px] max-[720px]:py-[46px]" aria-labelledby="hiw-faq-title">
        <Container>
          <PageHead
            id="hiw-faq-title"
            center
            title={
              <>
                Questions? <em>Answered.</em>
              </>
            }
          />
          <FaqList items={faqs} className="mx-auto my-0 max-w-[640px]" />
        </Container>
      </section>

      <section className="px-0 pb-[72px] pt-0 max-[720px]:pb-[46px]">
        <Container>
          <Reveal>
            <CtaBand
              titleA="Your first pickup"
              titleB="costs less."
              body="Free collection, a one-hour window and a re-clean guarantee on every order."
              actions={
                <Button variant="white" onClick={() => startBooking()}>
                  Schedule your first pickup
                </Button>
              }
            />
          </Reveal>
        </Container>
      </section>
    </PageShell>
  );
}
