"use client";

import { IoBagOutline, IoInformationCircleOutline } from "react-icons/io5";
import ReusableModal from "./Modal";
import { PurpleButton } from "./Buttons";

export default function BagsItemsWarningModal({
  isOpen,
  onOpenChange,
  onClose,
  missingServices = [],
  onGoBack,
  onProceedAnyway,
}) {
  return (
    <ReusableModal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      size="md"
      backdrop="blur"
      className="max-w-[480px]"
    >
      <div className="px-6 py-6 space-y-5 font-sf">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <IoBagOutline className="size-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="font-youth font-bold text-xl text-theme-blue">
              Bags &amp; Items Not Added
            </h3>
            <p className="text-sm text-theme-psGray leading-relaxed">
              You haven&apos;t specified the number of bags or items for the
              following services:
            </p>
          </div>
        </div>

        {missingServices.length > 0 ? (
          <ul className="rounded-xl bg-[#F5F5F5] px-5 py-4 space-y-2 list-disc list-inside text-sm font-medium text-black">
            {missingServices.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <IoInformationCircleOutline className="size-5 shrink-0 mt-0.5" />
          <p>
            Adding bags &amp; items helps the agent prepare accurately. You can
            still proceed without this info.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <PurpleButton
            text="Go Back & Add"
            bg="bg-theme-blue"
            color="text-white"
            onClick={onGoBack}
          />
          <button
            type="button"
            onClick={onProceedAnyway}
            className="w-full h-[56px] rounded-lg border border-gray-200 bg-white text-center font-sf font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </ReusableModal>
  );
}
