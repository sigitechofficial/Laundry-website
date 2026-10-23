import { ChevronDown } from "./Icon";
import { cx } from "./cx";

/**
 * Accordion of questions using native <details>/<summary>, so it works
 * without JavaScript and is keyboard and screen reader friendly.
 *
 * @param {Array<{id?: string|number, question: string, answer: React.ReactNode}>} items
 */
export default function FaqList({ items, className, ...rest }) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[20px] border border-jdc-line bg-jdc-white px-[22px] max-[720px]:rounded-2xl max-[720px]:px-4",
        className
      )}
      {...rest}
    >
      {items.map((item, i) => (
        <details key={item.id ?? i} className="group border-b border-jdc-line last:border-b-0">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-[18px] py-4 text-[15px] font-semibold text-jdc-navy focus-visible:rounded-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-jdc-blue max-[720px]:gap-3 max-[720px]:py-[15px] [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <i
              aria-hidden="true"
              className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[50%] bg-jdc-mist text-jdc-navy [transition:transform_0.3s,background_0.3s,color_0.3s] group-open:rotate-180 group-open:bg-jdc-blue group-open:text-jdc-white"
            >
              <ChevronDown size={14} />
            </i>
          </summary>
          <div className="max-w-[680px] whitespace-pre-line pb-[18px] text-[15.5px] leading-[1.6] text-jdc-muted max-[720px]:pb-[15px] max-[720px]:text-[14.5px] max-[720px]:leading-[1.55] [&_a]:font-bold [&_a]:text-jdc-blue [&_p]:m-0">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

/** The FAQ API has returned several shapes over time; accept all of them. */
export function toFaqList(data) {
  const candidates = [data, data?.message, data?.data, data?.faqs, data?.data?.faqs, data?.data?.items];
  const list = candidates.find(Array.isArray) ?? [];
  return list
    .filter((f) => f && f.status !== false && f.question && f.answer)
    .map((f, i) => ({ id: f.id ?? f.faqId ?? i, question: String(f.question), answer: String(f.answer) }));
}
