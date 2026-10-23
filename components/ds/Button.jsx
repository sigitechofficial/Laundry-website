import Link from "next/link";
import { forwardRef } from "react";
import { cx } from "./cx";

const BASE =
  "inline-flex h-14 cursor-pointer touch-manipulation items-center justify-center gap-2.5 whitespace-nowrap rounded-jdc-pill border-0 bg-jdc-blue px-[30px] font-body text-jdc-base font-bold leading-none text-jdc-white no-underline [transition:background_var(--jdc-duration),color_var(--jdc-duration),border-color_var(--jdc-duration)] hover:bg-jdc-blue-dark focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-jdc-blue disabled:cursor-not-allowed disabled:opacity-[0.55] aria-disabled:cursor-not-allowed aria-disabled:opacity-[0.55]";

const VARIANTS = {
  primary: "",
  white: "bg-jdc-white text-jdc-navy hover:bg-jdc-white hover:text-jdc-blue-dark focus-visible:outline-jdc-white",
  ghost: "border-[1.5px] border-solid border-jdc-navy bg-transparent text-jdc-navy hover:bg-jdc-navy hover:text-jdc-white",
};

const SIZES = {
  sm: "h-[46px] px-[22px] text-jdc-sm",
  md: "",
  lg: "h-[62px] px-9 text-jdc-lg",
};

/** Class string for anything that should look like a design-system button. */
export function buttonClass({ variant = "primary", size = "md", block = false, className } = {}) {
  return cx(BASE, VARIANTS[variant], SIZES[size], block && "w-full", className);
}

/**
 * Design system button.
 *
 * Renders a Next.js <Link> when `href` is given, otherwise a <button>.
 *
 * @param {"primary"|"white"|"ghost"} [variant="primary"]
 * @param {"sm"|"md"|"lg"} [size="md"]
 * @param {boolean} [block] stretch to the container width
 */
const Button = forwardRef(function Button(
  { href, variant = "primary", size = "md", block = false, className, children, type, ...rest },
  ref
) {
  const classes = buttonClass({ variant, size, block, className });

  if (href) {
    return (
      <Link ref={ref} href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  );
});

export default Button;
