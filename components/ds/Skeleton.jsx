import { cx } from "./cx";

/*
 * Loading placeholders ("skeletons") for the booking journey. They have the same
 * size as the real content, so the page doesn't jump and the footer stays put
 * while data loads; the real content then fades in (animate-jdc-fade-in).
 */

/** A grey block with a soft pulse. Size it with className (h-*, w-*, rounded-*). */
export function Bone({ className }) {
  return <span aria-hidden="true" className={cx("block animate-pulse rounded-lg bg-[#E9EDF3]", className)} />;
}

/** Inline amount placeholder, e.g. a price that is still loading. */
export function BoneText({ className }) {
  return <Bone className={cx("inline-block h-[1em] w-14 align-middle", className)} />;
}

/** Same shape as a service card on the Add services page (CategoryCard). */
export function ServiceCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-[18px] rounded-[20px] border-[1.5px] border-jdc-line bg-white px-6 py-[22px] max-[720px]:min-h-[150px] max-[720px]:gap-3 max-[720px]:p-[18px]"
    >
      <Bone className="size-14 flex-none rounded-2xl max-[720px]:size-[42px]" />
      <span className="grid min-w-0 flex-1 gap-2.5">
        <Bone className="h-5 w-40 max-w-[60%]" />
        <Bone className="h-3.5 w-full max-w-[420px]" />
        <Bone className="h-3.5 w-16" />
      </span>
      <Bone className="size-[50px] flex-none rounded-full max-[720px]:size-11" />
    </div>
  );
}

/** A list of service-card placeholders with a screen-reader status. */
export function ServiceListSkeleton({ count = 4 }) {
  return (
    <>
      <span className="sr-only" role="status">
        Loading services…
      </span>
      {Array.from({ length: count }, (_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </>
  );
}

/** Same shape as an order card in Order history. */
export function OrderCardSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-3 rounded-[20px] border border-jdc-line bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-5 w-44" />
        <Bone className="h-7 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-4 w-36" />
        <Bone className="h-4 w-24" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-4 w-32" />
        <Bone className="h-4 w-24" />
      </div>
    </div>
  );
}

/** Details panel placeholder (order details / on hold details). */
export function DetailsSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <Bone className="h-24 w-full rounded-2xl" />
      <Bone className="h-40 w-full rounded-2xl" />
      <Bone className="h-28 w-full rounded-2xl" />
      <Bone className="h-20 w-full rounded-2xl" />
    </div>
  );
}
