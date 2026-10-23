import { cx } from "./cx";

const TONES = { paper: "", mist: "bg-jdc-mist", white: "bg-jdc-white" };

/** Horizontal page container with the design system gutters. */
export function Container({ as: Tag = "div", className, children, ...rest }) {
  return (
    <Tag className={cx("mx-auto w-full px-jdc-gutter", className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Vertical page section.
 * @param {"paper"|"mist"|"white"} [tone="paper"] background tone
 */
export function Section({ as: Tag = "section", tone = "paper", className, children, ...rest }) {
  return (
    <Tag className={cx("py-jdc-section", TONES[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Section heading row. `title` may contain an <em> for the second phrase.
 * `aside` renders on the right (a lead paragraph or an action).
 */
export function SectionHead({ id, title, aside, className }) {
  return (
    <div
      className={cx(
        "mb-11 flex items-end justify-between gap-8 [&>*]:min-w-0 max-[720px]:mb-7 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-5",
        className
      )}
    >
      <h2
        id={id}
        className="m-0 max-w-[720px] font-display text-jdc-h2 font-bold leading-[1.08] tracking-[-0.02em] text-jdc-navy [&_em]:not-italic"
      >
        {title}
      </h2>
      {aside}
    </div>
  );
}

export function Lead({ className, children, ...rest }) {
  return (
    <p className={cx("m-0 max-w-[440px] text-jdc-lg text-jdc-muted max-[720px]:text-[16.5px]", className)} {...rest}>
      {children}
    </p>
  );
}

/** Heavy uppercase display type used for hero and band headings. */
export function Display({ as: Tag = "h2", className, children, ...rest }) {
  return (
    <Tag
      className={cx(
        "m-0 break-words font-display font-extrabold uppercase leading-[0.95] tracking-[-0.02em]",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
