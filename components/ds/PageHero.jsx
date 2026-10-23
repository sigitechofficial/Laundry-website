import Image from "next/image";
import Link from "next/link";
import { cx } from "./cx";

// Decorative rings (top right), hidden on phones.
const RINGS =
  "before:pointer-events-none before:absolute before:right-[-140px] before:top-[-180px] before:h-[560px] before:w-[560px] before:rounded-[50%] before:border-2 before:border-white/[0.08] before:content-[''] after:pointer-events-none after:absolute after:right-[-40px] after:top-[-80px] after:h-[380px] after:w-[380px] after:rounded-[50%] after:border-2 after:border-[rgba(2,120,254,0.35)] after:content-[''] max-[720px]:before:hidden max-[720px]:after:hidden";

/**
 * Navy hero for inner pages, sitting under the overlay header.
 *
 * @param {React.ReactNode} title  main heading; wrap the second phrase in <span>
 * @param {React.ReactNode} [lead] supporting sentence
 * @param {Array<{label: string, href?: string}>} [crumbs] breadcrumb trail
 * @param {string} [image] optional faded background photo
 * @param {"md"|"sm"} [size="md"] sm trims the bottom padding
 */
export default function PageHero({ title, lead, crumbs, image, size = "md", children, className }) {
  return (
    <section
      className={cx(
        "relative overflow-hidden bg-jdc-navy pb-[104px] pt-[176px] text-jdc-white max-[720px]:pb-16 max-[720px]:pt-[118px]",
        RINGS,
        size === "sm" && "pb-14 max-[720px]:pb-9",
        className
      )}
    >
      {image ? (
        /^https?:\/\//i.test(image) ? (
          // CMS images come from the API host, which isn't in next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="absolute inset-0 h-full w-full object-cover opacity-[0.35]" src={image} alt="" />
        ) : (
          // On phones the hero is taller than a landscape photo, so object-cover crops the
          // sides and draws it ~1.7x the screen width; ask for a file that wide, or it is
          // stretched and looks blurred.
          <Image className="object-cover opacity-[0.35]" src={image} alt="" fill priority sizes="(max-width: 720px) 170vw, 100vw" />
        )
      ) : null}
      <div className="relative z-[1] px-jdc-gutter">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="m-0 mb-[18px] flex list-none flex-wrap gap-2 p-0 text-[14px] text-white/65">
              {crumbs.map((c, i) => (
                <li key={c.label} className={i > 0 ? "before:mr-2 before:opacity-60 before:content-['/']" : undefined}>
                  {c.href && i < crumbs.length - 1 ? (
                    <Link href={c.href} className="text-inherit no-underline hover:text-jdc-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="m-0 max-w-[880px] break-words font-display text-[clamp(36px,4.4vw,64px)] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] max-[720px]:text-[clamp(30px,9vw,40px)] max-[720px]:leading-[1.08] [&_span]:block">
          {title}
        </h1>
        {lead ? (
          <p className="mb-0 mt-[18px] max-w-[620px] text-[19px] text-white/[0.82] max-[720px]:text-[16.5px]">{lead}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
