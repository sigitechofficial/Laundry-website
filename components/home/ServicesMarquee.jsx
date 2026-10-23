import Icon from "../ds/Icon";

/** Scrolling band of every live service. Pauses on hover and for reduced motion. */
export default function ServicesMarquee({ services }) {
  if (!services?.length) return null;

  const run = (copy) =>
    services.map((s) => (
      <span
        key={`${copy}-${s.id}`}
        className="inline-flex items-center gap-[14px] [&:nth-child(even)_span]:text-transparent [&:nth-child(even)_span]:[-webkit-text-stroke:1.2px_rgba(255,255,255,0.75)] [&_svg]:flex-none [&_svg]:text-jdc-blue"
      >
        <Icon name={s.icon} size={18} />
        <span>{s.name}</span>
      </span>
    ));

  return (
    <div className="group overflow-hidden border-t border-solid border-t-[rgba(255,255,255,0.06)] bg-jdc-navy py-[26px] text-jdc-white">
      <p className="sr-only">Our services: {services.map((s) => s.name).join(", ")}.</p>
      <div
        className="flex w-max animate-jdc-marquee items-center gap-[34px] whitespace-nowrap font-display text-[length:clamp(18px,1.7vw,24px)] font-bold uppercase tracking-[-0.01em] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        aria-hidden="true"
      >
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}
