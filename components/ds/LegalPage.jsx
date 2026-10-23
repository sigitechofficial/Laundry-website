import PageHero from "./PageHero";
import PageShell from "./PageShell";
import { Container } from "./Layout";

const P = "mb-3 mt-0 text-[17px] leading-[1.7] text-jdc-text max-[720px]:text-[15.5px]";
const UL =
  "mb-3 mt-0 grid list-disc gap-1.5 pl-[22px] text-[17px] leading-[1.6] text-jdc-text marker:text-jdc-blue max-[720px]:text-[15.5px]";

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Renders a plain-text legal section. Lines starting with "•" become a
 * bulleted list; other lines become paragraphs. React nodes pass through.
 */
function SectionBody({ body }) {
  if (typeof body !== "string") return <div className={P}>{body}</div>;

  const blocks = [];
  let list = null;
  body.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("•")) {
      if (!list) {
        list = [];
        blocks.push({ type: "ul", items: list });
      }
      list.push(line.replace(/^•\s*/, ""));
    } else {
      list = null;
      blocks.push({ type: "p", text: line });
    }
  });

  return blocks.map((b, i) =>
    b.type === "ul" ? (
      <ul key={i} className={UL}>
        {b.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : (
      <p key={i} className={P}>
        {b.text}
      </p>
    )
  );
}

/**
 * Long-form legal page (privacy, terms) with a sticky contents list.
 * @param {Array<{heading: string, body: string|React.ReactNode}>} sections
 */
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <PageShell header="overlay">
      <PageHero size="sm" title={title} lead={intro}>
        {updated ? <p className="mb-0 mt-[18px] text-[14px] text-white/65">Last updated: {updated}</p> : null}
      </PageHero>

      <section className="pb-20 pt-14 max-[720px]:pb-12 max-[720px]:pt-8">
        <Container className="grid grid-cols-[280px_minmax(0,1fr)] [align-items:start] gap-16 max-[1080px]:grid-cols-[1fr] max-[1080px]:gap-8">
          <nav
            className="sticky top-[calc(var(--jdc-header-h)+24px)] rounded-[18px] border border-jdc-line bg-jdc-white p-5 max-[1080px]:static"
            aria-label="On this page"
          >
            <p className="mb-2.5 mt-0 text-[12.5px] font-bold uppercase tracking-[0.14em] text-jdc-muted">On this page</p>
            <ol className="m-0 grid max-h-[calc(100vh-220px)] list-none gap-0.5 overflow-y-auto p-0 max-[1080px]:max-h-none">
              {sections.map((s) => (
                <li key={s.heading}>
                  <a
                    href={`#${slug(s.heading)}`}
                    className="block rounded-[10px] px-2.5 py-[7px] text-[14px] font-semibold leading-[1.35] text-jdc-navy no-underline hover:bg-jdc-mist hover:text-jdc-blue"
                  >
                    {s.heading.replace(/^\d+\.\s*/, "")}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-[780px]">
            {sections.map((s) => (
              <section
                key={s.heading}
                id={slug(s.heading)}
                className="mb-8 scroll-mt-[calc(var(--jdc-header-h)+24px)] border-b border-jdc-line pb-8 last:mb-0 last:border-b-0"
              >
                <h2 className="mb-3 mt-0 font-display text-[24px] tracking-[-0.01em] text-jdc-navy max-[720px]:text-[20px]">
                  {s.heading}
                </h2>
                <SectionBody body={s.body} />
              </section>
            ))}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
