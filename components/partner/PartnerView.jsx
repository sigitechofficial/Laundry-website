import Image from "next/image";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import PageHero from "../ds/PageHero";
import PageShell from "../ds/PageShell";
import Reveal from "../ds/Reveal";
import { CheckList, CtaBand, HeroChips, PageHead } from "../ds/Blocks";
import { Container } from "../ds/Layout";
import { cx } from "../ds/cx";

export const PARTNER_APPLY = "/become-partner/registration";

const REASONS = [
  {
    kicker: "Unlock rapid growth",
    title: "Grow with a leader",
    body: "Join a growing laundry and dry cleaning platform and reach more customers, faster.",
    image: "/jdc/media/0cdf736a856e.jpg",
    alt: "A row of modern washing machines",
  },
  {
    kicker: "Hassle-free",
    title: "Focus on great service",
    body: "Our partner drivers handle every pickup and delivery, so you can concentrate on what you do best. No worries about logistics or customer support: we have it covered.",
    image: "/jdc/media/092d222fe633.jpg",
    alt: "A specialist pressing a garment",
  },
  {
    kicker: "Support",
    title: "We're in this together",
    body: "Our dedicated facility support team is here to help at every step, because your success is our success.",
    image: "/jdc/media/ceb681c44602.jpg",
    alt: "A garment being pressed",
  },
];

const BENEFITS = [
  "No sign-up fee and no hidden costs",
  "A facility support team that is always available",
  "Do what you do best: top-quality cleaning",
  "We handle customer service, deliveries, marketing, technology and sales",
];

export default function PartnerView() {
  return (
    <PageShell header="overlay">
      <PageHero
        image="/jdc/media/hero-partner-garment-rail.jpg"
        title={
          <>
            More customers, <span>without the stress.</span>
          </>
        }
        lead="Become a trusted Just Dry Cleans cleaning partner. We bring the orders, you bring the expertise."
      >
        <HeroChips
          items={[
            { icon: "checkBold", label: "No sign-up fee" },
            { icon: "truckBold", label: "We handle deliveries" },
            { icon: "userBold", label: "Dedicated support" },
          ]}
        />
        <div className="mt-7">
          <Button href={PARTNER_APPLY} size="lg">
            Apply as a cleaning partner <Icon name="arrowRight" size={18} />
          </Button>
        </div>
      </PageHero>

      <section className="px-0 py-[72px] max-[720px]:py-11" aria-labelledby="why-partner">
        <Container>
          <PageHead
            id="why-partner"
            center
            title={
              <>
                Why partner <em>with us.</em>
              </>
            }
          />
          <div className="grid gap-7 max-[1080px]:gap-10">
            {REASONS.map((r, i) => (
              <Reveal key={r.title} className="grid grid-cols-[1fr_1fr] items-center gap-14 max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-6">
                <div className={cx("relative aspect-[16/11] overflow-hidden rounded-jdc-xl bg-jdc-mist [&_img]:object-cover", i % 2 === 1 && "order-2 max-[1080px]:order-none")}>
                  <Image src={r.image} alt={r.alt} fill sizes="(max-width: 1080px) 100vw, 50vw" />
                </div>
                <div className="max-w-[480px]">
                  <p className="m-0 text-[13px] font-bold uppercase tracking-[0.14em] text-jdc-blue">
                    {String(i + 1).padStart(2, "0")} · {r.kicker}
                  </p>
                  <h3 className="mx-0 mb-2.5 mt-2 font-display text-[30px] tracking-[-0.02em] text-jdc-navy max-[720px]:text-[23px]">{r.title}</h3>
                  <p className="m-0 text-[17px] text-jdc-muted max-[720px]:text-[15.5px]">{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-jdc-mist px-0 py-[72px] max-[720px]:py-11" aria-label="From our partners">
        <Container>
          <Reveal as="figure" className="relative mx-auto my-0 max-w-[860px] text-center">
            <span className="block h-12 text-[96px] leading-none text-jdc-blue [font-family:Georgia,serif]" aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className="m-0 font-display text-[clamp(20px,2vw,26px)] font-semibold leading-[1.45] text-jdc-navy">
              Since partnering with Just Dry Cleans, the team has consistently shown appreciation for our efforts.
              They go above and beyond to provide valuable feedback, helping us continuously improve. I would
              describe the team as supportive, understanding and professional.
            </blockquote>
            <figcaption className="mt-[18px] text-[15px] font-semibold text-jdc-muted">Our local cleaning partner in London</figcaption>
          </Reveal>
        </Container>
      </section>

      <section className="px-0 py-[72px] max-[720px]:py-11" aria-labelledby="no-fee">
        <Container className="grid grid-cols-[1fr_1fr] items-center gap-[72px] max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-6 [&>*]:min-w-0">
          <Reveal>
            <PageHead
              id="no-fee"
              title={
                <>
                  No sign-up fee, no hidden costs, <em>full support.</em>
                </>
              }
            />
            <CheckList items={BENEFITS} />
            <div className="mt-7">
              <Button href={PARTNER_APPLY}>Apply now</Button>
            </div>
          </Reveal>
          <Reveal className="relative aspect-[5/4] overflow-hidden rounded-jdc-xl [&_img]:object-cover">
            <Image src="/jdc/media/81d1b96df40a.jpg" alt="Tailored jackets on hangers" fill sizes="(max-width: 1080px) 100vw, 45vw" />
          </Reveal>
        </Container>
      </section>

      <section className="px-0 pb-[72px] pt-0 max-[720px]:pb-11">
        <Container>
          <CtaBand
            titleA="Apply as a cleaning partner."
            titleB="No sign-up fees."
            body="Tell us about your shop and we will be in touch."
            actions={
              <Button variant="white" href={PARTNER_APPLY}>
                Start your application
              </Button>
            }
          />
        </Container>
      </section>
    </PageShell>
  );
}
