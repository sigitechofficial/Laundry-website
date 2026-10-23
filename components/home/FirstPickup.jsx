"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "../ds/Button";
import Icon from "../ds/Icon";
import Reveal from "../ds/Reveal";
import { Container, Lead } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { FIRST_PICKUP } from "./content";
import { useStartBooking } from "../../utilities/useStartBooking";

/* Dashed connector between timeline steps (every step except the last) */
const STEP_LINE =
  "[&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:left-[24px] [&:not(:last-child)]:after:top-[72px] [&:not(:last-child)]:after:bottom-[-14px] [&:not(:last-child)]:after:w-[2px] [&:not(:last-child)]:after:bg-[repeating-linear-gradient(var(--jdc-blue)_0_6px,transparent_6px_12px)] [&:not(:last-child)]:after:opacity-40 max-[720px]:[&:not(:last-child)]:after:left-[21px] max-[720px]:[&:not(:last-child)]:after:top-[62px] max-[720px]:[&:not(:last-child)]:after:bottom-[-10px]";

export default function FirstPickup() {
  const startBooking = useStartBooking();

  return (
    <section
      className="bg-jdc-mist py-[96px] max-[720px]:py-[56px]"
      id="how"
      aria-labelledby="first-title"
    >
      <Container className="grid grid-cols-[1fr_1fr] items-center gap-[72px] [&>*]:min-w-0 max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-[48px] max-[720px]:gap-[24px]">
        <Reveal>
          <h2
            id="first-title"
            className="m-0 font-display text-jdc-h2 font-bold leading-[1.08] tracking-[-0.02em] text-jdc-navy [&_em]:block [&_em]:not-italic"
          >
            {FIRST_PICKUP.titleA} <em>{FIRST_PICKUP.titleB}</em>
          </h2>
          <Lead className="mt-[24px] max-[720px]:mt-[12px] max-[720px]:text-[16px]">{FIRST_PICKUP.lead}</Lead>
          <div className="mt-[30px] max-[720px]:hidden">
            <Button onClick={() => startBooking()}>{FIRST_PICKUP.cta}</Button>
          </div>
          <figure className="relative m-[36px_0_0] aspect-[2/1] overflow-hidden rounded-[26px] [&_img]:object-cover max-[1080px]:hidden">
            <Image
              src={FIRST_PICKUP.photo}
              alt={FIRST_PICKUP.photoAlt}
              fill
              sizes="(max-width: 1080px) 100vw, 45vw"
            />
            <figcaption className="absolute bottom-[18px] left-[18px] inline-flex items-center gap-[8px] rounded-jdc-pill border border-solid border-[rgba(255,255,255,0.26)] bg-[rgba(27,34,48,0.58)] p-[10px_16px] text-[14px] font-bold text-jdc-white [backdrop-filter:blur(10px)] [&_svg]:flex-none [&_svg]:text-jdc-sky">
              <Icon name="clockBold" size={18} />
              {FIRST_PICKUP.photoChip}
            </figcaption>
          </figure>
        </Reveal>

        <Reveal>
          <ol className="relative m-0 list-none rounded-jdc-lg border border-solid border-jdc-line bg-jdc-white p-[10px_32px] max-[720px]:rounded-[20px] max-[720px]:p-[6px_18px]">
            {FIRST_PICKUP.steps.map((step) => (
              <li
                key={step.title}
                className={`relative grid grid-cols-[50px_1fr] gap-[20px] p-[18px_0] max-[720px]:grid-cols-[44px_1fr] max-[720px]:gap-[14px] max-[720px]:p-[14px_0] ${STEP_LINE}`}
              >
                <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[50%] border-[1.5px] border-solid border-jdc-line bg-[#F1F3F7] text-[#6B7385] max-[720px]:h-[44px] max-[720px]:w-[44px] max-[720px]:[&_svg]:h-[20px] max-[720px]:[&_svg]:w-[20px]">
                  <Icon name={step.icon} size={22} />
                </span>
                <div>
                  <h3 className="m-[4px_0_2px] font-display text-[20px] font-semibold text-jdc-navy max-[720px]:m-[2px_0_3px] max-[720px]:text-[17px] max-[720px]:leading-[1.25]">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[17px] text-jdc-muted max-[720px]:text-[14.5px] max-[720px]:leading-[1.5]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href={ROUTES.howItWorks}
            className="mt-[18px] flex items-center gap-[18px] rounded-[22px] border border-solid border-jdc-line bg-jdc-white p-[12px] text-inherit no-underline [transition:box-shadow_0.2s] max-[720px]:mt-[12px] max-[720px]:gap-[12px] max-[720px]:rounded-[18px] max-[720px]:p-[10px]"
          >
            <span className="relative h-[96px] w-[150px] flex-none overflow-hidden rounded-[14px] [&_img]:object-cover max-[720px]:h-[72px] max-[720px]:w-[96px] max-[720px]:rounded-[12px]">
              <Image src={FIRST_PICKUP.video.thumb} alt="" fill sizes="150px" />
              <span className="absolute inset-0 flex items-center justify-center bg-[rgba(27,34,48,0.35)]">
                <i className="flex h-[44px] w-[44px] items-center justify-center rounded-[50%] bg-jdc-white text-jdc-navy max-[720px]:h-[34px] max-[720px]:w-[34px]">
                  <Icon name="play" size={16} />
                </i>
              </span>
            </span>
            <span>
              <strong className="block text-[17px] text-jdc-navy max-[720px]:text-[15px] max-[720px]:leading-[1.3]">
                {FIRST_PICKUP.video.title}
              </strong>
              <small className="block text-[15px] text-jdc-muted max-[720px]:mt-[2px] max-[720px]:text-[13px] max-[720px]:leading-[1.4]">
                {FIRST_PICKUP.video.body}
              </small>
            </span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
