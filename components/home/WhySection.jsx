import Image from "next/image";
import Icon from "../ds/Icon";
import Reveal from "../ds/Reveal";
import { Container, Lead, Section, SectionHead } from "../ds/Layout";
import { WHY } from "./content";

export default function WhySection() {
  return (
    <Section id="why" aria-labelledby="why-title">
      <Container>
        <Reveal>
          <SectionHead
            id="why-title"
            title={
              <>
                {WHY.titleA} <em>{WHY.titleB}</em>
              </>
            }
            aside={<Lead>{WHY.lead}</Lead>}
          />
        </Reveal>
        <ul className="m-0 grid list-none grid-cols-[repeat(4,minmax(0,1fr))] gap-[22px] p-0 max-[1080px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[720px]:gap-[12px]">
          {WHY.tiles.map((tile) => (
            <Reveal
              as="li"
              key={tile.title}
              className="flex flex-col rounded-[26px] border border-solid border-jdc-line bg-jdc-white p-[12px_12px_24px] max-[720px]:rounded-[16px] max-[720px]:p-[7px_7px_14px]"
            >
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[18px] bg-jdc-mist [&_img]:object-cover max-[1080px]:aspect-[4/3] max-[720px]:aspect-[3/2] max-[720px]:rounded-[12px]">
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 1080px) 50vw, 25vw"
                />
                <span className="absolute bottom-[14px] left-[14px] flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-jdc-blue text-jdc-white max-[720px]:bottom-[9px] max-[720px]:left-[9px] max-[720px]:h-[34px] max-[720px]:w-[34px] max-[720px]:rounded-[10px] max-[720px]:[&_svg]:h-[18px] max-[720px]:[&_svg]:w-[18px]">
                  <Icon name={tile.icon} size={22} />
                </span>
              </div>
              <h3 className="m-[20px_12px_6px] font-display text-[21px] font-semibold tracking-[-0.01em] text-jdc-navy max-[720px]:m-[10px_8px_3px] max-[720px]:text-[15px]">
                {tile.title}
              </h3>
              <p className="m-[0_12px] text-[15.5px] leading-[1.55] text-jdc-muted max-[720px]:m-[0_8px] max-[720px]:text-[12.5px] max-[720px]:leading-[1.45]">
                {tile.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
