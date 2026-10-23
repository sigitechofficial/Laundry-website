import BackgroundVideo from "../ds/BackgroundVideo";
import Reveal from "../ds/Reveal";
import { Container } from "../ds/Layout";
import { STUDIO } from "./content";

/* Phones: numbered glass cards (counter badge in ::before) */
const POINT_PHONE =
  "max-[720px]:relative max-[720px]:[counter-increment:studio] max-[720px]:p-[15px_16px_15px_62px] max-[720px]:border max-[720px]:border-solid max-[720px]:border-[rgba(255,255,255,0.18)] max-[720px]:rounded-jdc-md max-[720px]:bg-[rgba(255,255,255,0.09)] max-[720px]:[backdrop-filter:blur(8px)] max-[720px]:before:content-[counter(studio,decimal-leading-zero)] max-[720px]:before:absolute max-[720px]:before:left-[16px] max-[720px]:before:top-[15px] max-[720px]:before:flex max-[720px]:before:h-[34px] max-[720px]:before:w-[34px] max-[720px]:before:items-center max-[720px]:before:justify-center max-[720px]:before:rounded-[50%] max-[720px]:before:bg-jdc-blue max-[720px]:before:font-display max-[720px]:before:text-[13px] max-[720px]:before:font-bold";

export default function StudioBand() {
  return (
    <section
      className="relative flex min-h-[640px] items-end overflow-hidden bg-jdc-navy text-jdc-white after:absolute after:inset-0 after:bg-[linear-gradient(0deg,rgba(27,34,48,0.95)_0%,rgba(27,34,48,0.55)_50%,rgba(27,34,48,0.25)_100%)] after:content-[''] max-[720px]:min-h-0"
      aria-labelledby="studio-title"
    >
      <BackgroundVideo
        className="absolute inset-0 h-full w-full object-cover"
        poster={STUDIO.poster}
        hd={STUDIO.video.hd}
        sd={STUDIO.video.sd}
      />
      <Container className="relative z-[2] pb-[80px] pt-[120px] max-[720px]:pb-[36px] max-[720px]:pt-[72px]">
        <Reveal>
          <h2
            id="studio-title"
            className="m-0 max-w-[900px] font-display text-jdc-h2 font-extrabold uppercase leading-[1.08] tracking-[-0.02em]"
          >
            {STUDIO.titleA} <span>{STUDIO.titleB}</span>
          </h2>
        </Reveal>
        <Reveal
          as="ol"
          className="m-[56px_0_0] grid list-none grid-cols-[repeat(3,1fr)] border-t border-solid border-t-jdc-on-dark-line p-0 max-[720px]:mt-[26px] max-[720px]:grid-cols-[1fr] max-[720px]:gap-[10px] max-[720px]:border-t-0 max-[720px]:[counter-reset:studio]"
        >
          {STUDIO.points.map((p, i) => (
            <li
              key={p.title}
              className={`p-[28px_28px_0_0] ${
                i > 0 ? "border-l border-solid border-l-jdc-on-dark-line pl-[28px]" : ""
              } ${POINT_PHONE}`}
            >
              <h3 className="m-[0_0_6px] font-display text-jdc-h3 font-semibold max-[720px]:m-[0_0_4px] max-[720px]:pt-[6px] max-[720px]:text-[17px] max-[720px]:leading-[1.25]">
                {p.title}
              </h3>
              <p className="m-0 text-[16px] text-jdc-on-dark-muted max-[720px]:text-[14px] max-[720px]:leading-[1.5] max-[720px]:text-[rgba(255,255,255,0.8)]">
                {p.body}
              </p>
            </li>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
