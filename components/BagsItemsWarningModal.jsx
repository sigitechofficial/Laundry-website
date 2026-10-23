"use client";

import ProtoIcon from "./proto/ProtoIcon";
import Dialog from "./ds/Dialog";

/*
 * "Bags / items not added" check before placing an order. Opens over the other
 * checkout popups (layer "alert"); the shared Dialog gives it the same backdrop,
 * motion, Escape / focus handling and phone bottom sheet as every other popup.
 */
export default function BagsItemsWarningModal({
  isOpen,
  onOpenChange,
  onClose,
  missingServices = [],
  onGoBack,
  onProceedAnyway,
}) {
  const close = () => {
    onOpenChange?.(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onClose={close} labelledBy="bagsWarnTitle" width="md" layer="alert">
        <div className="grid gap-4 px-6 pb-2 pt-6 max-[720px]:px-5 max-[720px]:pt-4">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 flex-none items-center justify-center rounded-[12px] bg-[#F1F3F7] text-jdc-navy">
              <ProtoIcon name="bag" size={22} />
            </span>
            <div className="min-w-0">
              <h2 id="bagsWarnTitle" className="m-0 font-display text-[19px] font-bold text-jdc-navy">
                Add your bags or items?
              </h2>
              <p className="m-0 mt-1 text-[14.5px] leading-normal text-jdc-muted">
                You haven&apos;t said how many bags or items for:
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="ml-auto flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-jdc-paper text-jdc-navy hover:bg-[#EEF0F4]"
              onClick={close}
            >
              <ProtoIcon name="close" size={15} />
            </button>
          </div>

          {missingServices.length > 0 ? (
            <ul className="m-0 grid list-none gap-1.5 rounded-[14px] border border-jdc-line bg-[#F7F8FA] px-4 py-3">
              {missingServices.map((name) => (
                <li key={name} className="flex items-center gap-2 text-[14.5px] font-semibold text-jdc-navy">
                  <span className="size-1.5 flex-none rounded-full bg-[#8A93A6]" aria-hidden="true" />
                  {name}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="m-0 text-[13.5px] leading-normal text-jdc-muted">
            It helps our team prepare. You can still place the order without it.
          </p>
        </div>

        <div className="grid gap-2 px-6 pb-6 pt-3 max-[720px]:px-5 max-[720px]:pb-[calc(16px+env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="h-[50px] cursor-pointer rounded-xl border-0 bg-jdc-blue text-[15.5px] font-bold text-white hover:bg-jdc-blue-dark"
            onClick={onGoBack}
          >
            Go back and add
          </button>
          <button
            type="button"
            className="h-[50px] cursor-pointer rounded-xl border-0 bg-[#EEF0F4] text-[15px] font-bold text-jdc-navy hover:bg-[#E4E7ED]"
            onClick={onProceedAnyway}
          >
            Continue without
          </button>
        </div>
    </Dialog>
  );
}
