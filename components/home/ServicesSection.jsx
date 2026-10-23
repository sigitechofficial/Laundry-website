import Image from "next/image";
import Link from "next/link";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import Reveal from "../ds/Reveal";
import { Container, SectionHead } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { cx } from "../ds/cx";

/* Bento card. `group` drives the CTA hover state. */
const CARD =
  "group relative min-w-0 overflow-hidden rounded-jdc-xl bg-jdc-navy max-[720px]:min-h-[236px]";
const LAYOUT_CLASS = {
  hero: "row-[1/span_2] max-[1080px]:col-[1/span_2] max-[1080px]:row-auto max-[720px]:min-h-[320px]",
  wide: "col-[2/span_2] max-[1080px]:col-[1/span_2] max-[720px]:min-h-[268px]",
  tile: "",
};
const CARD_TITLE =
  "block font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em] max-[720px]:text-[22px]";
const CARD_TITLE_LAYOUT = { hero: "text-[32px]", wide: "", tile: "" };
const CARD_TEXT = "mt-[8px] block max-w-[420px] text-[16px] text-[rgba(255,255,255,0.82)]";
/* Small tiles keep just the title and CTA */
const CARD_TEXT_LAYOUT = { hero: "", wide: "", tile: "hidden" };
const SIZES = {
  hero: "(max-width: 720px) 100vw, (max-width: 1080px) 100vw, 40vw",
  wide: "(max-width: 1080px) 100vw, 60vw",
  tile: "(max-width: 720px) 50vw, (max-width: 1080px) 50vw, 30vw",
};

/**
 * Featured services bento grid plus chips for every other live service.
 * @param {{ model: ReturnType<typeof import("./serviceModel").buildServiceModel> }} props
 */
export default function ServicesSection({ model }) {
  const { featured, more, total } = model;

  return (
    <section
      className="pb-[110px] pt-[120px] max-[720px]:py-[56px]"
      id="services"
      aria-labelledby="services-title"
    >
      <Container>
        <Reveal>
          <SectionHead
            id="services-title"
            title={
              <>
                Everything your wardrobe needs, <em>collected from your door.</em>
              </>
            }
            aside={
              <Button href={ROUTES.pricing} variant="ghost">
                View all {total} services <Icon name="arrowRight" size={18} />
              </Button>
            }
          />
        </Reveal>

        <div className="grid grid-cols-[1.25fr_1fr_1fr] grid-rows-[310px_310px] gap-[18px] max-[1080px]:grid-cols-[1fr_1fr] max-[1080px]:grid-rows-[380px_280px_280px] max-[720px]:auto-rows-auto max-[720px]:grid-rows-none max-[720px]:gap-[12px]">
          {featured.map((card) => (
            <Reveal key={card.id} className={cx(CARD, LAYOUT_CLASS[card.layout])}>
              <Link
                href={ROUTES.pricing}
                className="relative isolate flex h-full flex-col items-start text-jdc-white no-underline after:absolute after:inset-0 after:z-[-1] after:bg-[linear-gradient(180deg,rgba(27,34,48,0)_30%,rgba(27,34,48,0.55)_58%,rgba(27,34,48,0.94)_100%)] after:content-[''] focus-visible:rounded-jdc-xl focus-visible:[outline-offset:-3px] focus-visible:[outline:3px_solid_var(--jdc-blue)]"
              >
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes={SIZES[card.layout]}
                  className="z-[-2] object-cover"
                />
                {card.tag ? (
                  <span className="relative m-[20px_0_14px_20px] inline-flex h-[34px] flex-none items-center gap-[7px] rounded-jdc-pill border border-solid border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.16)] p-[0_14px] text-[13px] font-bold tracking-[0.02em] [backdrop-filter:blur(10px)] max-[720px]:m-[12px_0_10px_12px] max-[720px]:h-[28px] max-[720px]:gap-[6px] max-[720px]:p-[0_11px] max-[720px]:text-[12px]">
                    <Icon name={card.tag.icon} size={15} /> {card.tag.label}
                  </span>
                ) : null}
                <span className="relative mt-auto block w-full p-[26px_26px_24px] max-[720px]:p-[16px]">
                  <span className="mb-[14px] flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-jdc-blue max-[720px]:mb-[10px] max-[720px]:h-[40px] max-[720px]:w-[40px] max-[720px]:rounded-[12px] max-[720px]:[&_svg]:h-[20px] max-[720px]:[&_svg]:w-[20px]">
                    <Icon name={card.icon} size={24} />
                  </span>
                  <span className={cx(CARD_TITLE, CARD_TITLE_LAYOUT[card.layout])}>{card.title}</span>
                  <span className={cx(CARD_TEXT, CARD_TEXT_LAYOUT[card.layout])}>{card.body}</span>
                  <span className="mt-[14px] inline-flex items-center gap-[8px] text-[15px] font-bold opacity-[0.92] [transition:gap_0.25s,color_0.25s] group-hover:gap-[12px] group-hover:text-jdc-sky max-[720px]:mt-[10px] max-[720px]:text-[14px]">
                    {card.cta} <Icon name="arrowRight" size={18} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {more.length > 0 ? (
          <Reveal className="mt-[22px] flex flex-wrap items-center gap-[18px_24px] rounded-jdc-lg border border-solid border-jdc-line bg-jdc-white p-[20px_22px] max-[720px]:p-[18px]">
            <span
              className="flex-none text-[13px] font-bold uppercase tracking-[0.14em] text-jdc-muted"
              id="more-services-label"
            >
              Also available
            </span>
            <ul
              className="m-0 flex list-none flex-wrap gap-[10px] p-0 max-[720px]:grid max-[720px]:w-full max-[720px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[720px]:gap-[8px]"
              aria-labelledby="more-services-label"
            >
              {more.map((s) => (
                <li key={s.id}>
                  <Link
                    href={ROUTES.pricing}
                    className="inline-flex h-[48px] items-center gap-[10px] rounded-jdc-pill border-[1.5px] border-solid border-transparent bg-jdc-mist p-[0_18px_0_14px] text-[15px] font-semibold text-jdc-navy no-underline [transition:background_0.2s,border-color_0.2s,box-shadow_0.2s] hover:border-jdc-line-strong hover:bg-jdc-white [&_svg]:flex-none [&_svg]:text-jdc-blue max-[720px]:h-auto max-[720px]:min-h-[44px] max-[720px]:w-full max-[720px]:gap-[8px] max-[720px]:whitespace-normal max-[720px]:p-[9px_12px] max-[720px]:text-[12.5px] max-[720px]:leading-[1.2] max-[720px]:[overflow-wrap:break-word]"
                  >
                    <Icon name={s.icon} size={20} />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
