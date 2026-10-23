import Button from "../ds/Button";
import Reveal from "../ds/Reveal";
import { Container } from "../ds/Layout";
import { ROUTES } from "../ds/siteConfig";
import { GUARANTEE } from "./content";

export default function Guarantee() {
  const reportWindow = GUARANTEE.reportWindowDays
    ? ` within ${GUARANTEE.reportWindowDays} days`
    : "";
  const stats = Array.isArray(GUARANTEE.stats) ? GUARANTEE.stats : [];

  return (
    <section
      className="bg-jdc-navy-deep py-[120px] text-jdc-white max-[720px]:py-[64px]"
      aria-labelledby="guarantee-title"
    >
      <Container>
        <div className="grid grid-cols-[1.1fr_1fr] items-center gap-[80px] [&>*]:min-w-0 max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-[48px] max-[720px]:gap-[28px] max-[720px]:text-center">
          <Reveal>
            <h2
              id="guarantee-title"
              className="m-0 font-display text-jdc-h2 font-extrabold uppercase leading-[1.08] tracking-[-0.02em]"
            >
              {GUARANTEE.titleA} <span>{GUARANTEE.titleB}</span>
            </h2>
          </Reveal>
          <Reveal>
            <span
              className="inline-block text-[28px] tracking-[6px] text-jdc-star max-[720px]:text-[24px] max-[720px]:tracking-[5px]"
              role="img"
              aria-label="Five stars"
            >
              ★★★★★
            </span>
            <p className="m-[18px_0_28px] text-[20px] text-[#c3cce0] max-[720px]:m-[14px_auto_22px] max-[720px]:max-w-[420px] max-[720px]:text-[16px]">
              Every order is backed by our guarantee. If you are not happy with the cleaning, tell
              us{reportWindow} and we will collect it, re-clean it and return it, free of charge.
            </p>
            <Button href={ROUTES.helpCenter}>{GUARANTEE.cta}</Button>
          </Reveal>
        </div>

        {stats.length > 0 ? (
          <Reveal>
            <dl className="m-[80px_0_0] grid grid-cols-[repeat(3,1fr)] border-t border-solid border-t-[#1e2c57] max-[720px]:mt-[40px] max-[720px]:grid-cols-[1fr] max-[720px]:border-t-0 max-[720px]:text-center">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex min-w-0 flex-col-reverse p-[36px_28px_0_0] ${
                    i > 0 ? "border-l border-solid border-l-[#1e2c57] pl-[28px]" : ""
                  } max-[720px]:border-l-0 max-[720px]:border-t max-[720px]:border-solid max-[720px]:border-t-[#1e2c57] max-[720px]:p-[22px_0]`}
                >
                  <dt className="text-[16px] text-[#9ba8c6] max-[720px]:text-[14px]">{s.label}</dt>
                  <dd
                    className={`m-0 font-display text-[62px] font-bold leading-none max-[1080px]:text-[length:clamp(32px,5.2vw,52px)] max-[1080px]:[overflow-wrap:anywhere] max-[720px]:text-[40px] ${
                      i === stats.length - 1 ? "text-jdc-blue" : ""
                    }`}
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="m-[24px_0_0] text-[13px] text-[#7383a8] max-[720px]:mt-[18px] max-[720px]:text-center">
              {GUARANTEE.statsNote}
            </p>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
