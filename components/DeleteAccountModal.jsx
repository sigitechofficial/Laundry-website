"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableModal from "./Modal";
import { ButtonYouth70018 } from "./Buttons";
import { useGetAccountDeletionReasonsQuery } from "../src/app/store/services/api";

const FALLBACK_REASONS = [
  { id: "fallback-1", label: "Had an issue with a shop", isOther: false },
  { id: "fallback-2", label: "The shop I use isn't on Trim", isOther: false },
  { id: "fallback-3", label: "Can't find the services I need", isOther: false },
  { id: "fallback-4", label: "Technical issues", isOther: false },
  { id: "fallback-5", label: "I no longer use Trim", isOther: false },
  { id: "fallback-6", label: "Other", isOther: true },
];

const SUPPORT_EMAIL = "support@trimworldwide.co.uk";

const STEP_HEADERS = {
  1: "Delete my account",
  2: "Before you go",
  3: "Confirmation",
};

const LOSS_ACKNOWLEDGMENTS = [
  { id: "order-history", label: "Your order history and active bookings" },
  { id: "addresses", label: "Saved addresses and payment preferences" },
  { id: "notifications", label: "Notifications and account settings" },
];

export default function DeleteAccountModal({
  isOpen,
  onOpenChange,
  onClose,
  userEmail = "",
  supportEmail = SUPPORT_EMAIL,
  onDeleteAccount,
  isDeleting = false,
}) {
  const [step, setStep] = useState(1);
  const [selectedReasonId, setSelectedReasonId] = useState(null);

  const { data: reasonsResponse, isLoading: reasonsLoading } =
    useGetAccountDeletionReasonsQuery(undefined, { skip: !isOpen });

  const reasonsList = useMemo(() => {
    const rows = Array.isArray(reasonsResponse?.data)
      ? reasonsResponse.data
      : [];
    return rows.length > 0 ? rows : FALLBACK_REASONS;
  }, [reasonsResponse]);

  const selectedReasonRow = useMemo(
    () => reasonsList.find((r) => String(r.id) === String(selectedReasonId)),
    [reasonsList, selectedReasonId]
  );
  const [otherReason, setOtherReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [selectedAcknowledgments, setSelectedAcknowledgments] = useState([]);

  const normalizedUserEmail = (userEmail || "").trim().toLowerCase();
  const normalizedConfirmEmail = confirmEmail.trim().toLowerCase();

  const resetState = () => {
    setStep(1);
    setSelectedReasonId(null);
    setOtherReason("");
    setConfirmEmail("");
    setSelectedAcknowledgments([]);
  };

  const toggleAcknowledgment = (id) => {
    setSelectedAcknowledgments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const canContinueStep2 = selectedAcknowledgments.length > 0;

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetState();
    onClose?.();
    onOpenChange?.(false);
  };

  const canContinueStep1 =
    selectedReasonId != null &&
    (!selectedReasonRow?.isOther || otherReason.trim().length > 0);

  const canDeleteStep3 =
    normalizedConfirmEmail.length > 0 &&
    normalizedConfirmEmail === normalizedUserEmail;

  const headerTitle = STEP_HEADERS[step] || "Delete my account";

  const footerContent = useMemo(() => {
    if (step === 1) {
      return (
        <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
          <ButtonYouth70018
            text="Continue"
            isDisabled={!canContinueStep1}
            onClick={() => setStep(2)}
          />
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
          <ButtonYouth70018
            text="Continue"
            isDisabled={!canContinueStep2}
            onClick={() => setStep(3)}
          />
        </div>
      );
    }
    return (
      <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
        <button
          type="button"
          disabled={!canDeleteStep3 || isDeleting}
          onClick={() =>
            onDeleteAccount?.({
              reason: selectedReasonRow?.label || "",
              reasonId: selectedReasonRow?.id,
              otherText: selectedReasonRow?.isOther ? otherReason.trim() : "",
              email: confirmEmail.trim(),
              acknowledgedItems: selectedAcknowledgments,
            })
          }
          className={`w-full relative rounded-full flex justify-center items-center font-medium sm:font-bold px-4 sm:px-8 h-14 sm:h-[60px] font-youth text-lg text-white ${
            canDeleteStep3 && !isDeleting
              ? "bg-[#5c1a2e] hover:bg-[#4a1525]"
              : "bg-theme-darkBlue/30 cursor-not-allowed"
          }`}
        >
          {isDeleting ? "Deleting..." : "Delete account"}
        </button>
      </div>
    );
  }, [
    step,
    canContinueStep1,
    canContinueStep2,
    canDeleteStep3,
    selectedAcknowledgments,
    isDeleting,
    selectedReasonRow,
    otherReason,
    confirmEmail,
    onDeleteAccount,
  ]);

  return (
    <ReusableModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={null}
      onBack={null}
      showHeader={false}
      showFooter
      footerContent={footerContent}
      size="xl"
      backdrop="blur"
      isDismissable={!isDeleting}
      className="custom-modal-class max-h-[90vh] overflow-auto"
    >
      <div className="font-sf">
        <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
          {step > 1 && (
            <p
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="font-sf text-base absolute top-4 left-4 cursor-pointer"
            >
              Back
            </p>
          )}
          <h4 className="font-youth font-bold text-[22px] text-center px-16">
            {headerTitle}
          </h4>
          <p
            onClick={handleClose}
            className="font-sf text-base absolute top-4 right-4 cursor-pointer"
          >
            Cancel
          </p>
        </div>

        <div className="w-full px-6 py-6">
          {step === 1 && (
            <>
              <h2 className="font-youth font-bold text-xl sm:text-2xl mb-3 text-theme-black-2">
                Sorry to see you go
              </h2>
              <p className="text-theme-psGray text-sm sm:text-base leading-relaxed mb-6">
                Can we change your mind? Drop us a line at{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-theme-black-2 underline underline-offset-2"
                >
                  {supportEmail}
                </a>
              </p>
              <p className="font-semibold text-base mb-4 text-theme-black-2">
                Why do you want to leave?
              </p>
              {reasonsLoading ? (
                <p className="text-theme-psGray text-sm py-4">Loading reasons...</p>
              ) : (
              <ul className="space-y-4">
                {reasonsList.map((reason) => (
                  <li key={reason.id}>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <span
                        className={`shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          String(selectedReasonId) === String(reason.id)
                            ? "border-theme-darkBlue"
                            : "border-gray-400 group-hover:border-gray-600"
                        }`}
                      >
                        {String(selectedReasonId) === String(reason.id) && (
                          <span className="size-2.5 rounded-full bg-theme-darkBlue" />
                        )}
                      </span>
                      <input
                        type="radio"
                        name="deleteReason"
                        value={reason.id}
                        checked={String(selectedReasonId) === String(reason.id)}
                        onChange={() => setSelectedReasonId(reason.id)}
                        className="sr-only"
                      />
                      <span className="text-base text-theme-black-2">{reason.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
              )}
              {selectedReasonRow?.isOther && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Tell us more..."
                  rows={3}
                  className="mt-5 w-full rounded-lg bg-theme-gray p-5 text-base text-theme-black-2 placeholder:text-theme-psGray resize-none outline-none"
                />
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-theme-psGray text-sm sm:text-base leading-relaxed mb-4">
                If you delete your account, you will lose access to the following.
                Select all that apply:
              </p>
              <ul className="space-y-4 mb-5">
                {LOSS_ACKNOWLEDGMENTS.map((item) => {
                  const isChecked = selectedAcknowledgments.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <span
                          className={`shrink-0 size-6 rounded-md border-2 flex items-center justify-center transition-colors mt-0.5 ${
                            isChecked
                              ? "border-theme-darkBlue bg-theme-darkBlue"
                              : "border-gray-400 bg-white group-hover:border-gray-600"
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="size-3.5 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAcknowledgment(item.id)}
                          className="sr-only"
                        />
                        <span className="text-base text-theme-black-2 leading-snug">
                          {item.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {selectedReasonRow && (
                <p className="text-sm text-theme-psGray rounded-lg bg-theme-gray px-4 py-3 mb-5">
                  Reason:{" "}
                  <span className="text-theme-black-2 font-medium">
                    {selectedReasonRow.label}
                  </span>
                  {selectedReasonRow.isOther && otherReason
                    ? ` — ${otherReason}`
                    : null}
                </p>
              )}
              <p className="text-theme-psGray text-sm">
                This action cannot be undone. You can still contact us at{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-theme-black-2 underline"
                >
                  {supportEmail}
                </a>{" "}
                if you need help.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-theme-psGray text-sm sm:text-base leading-relaxed mb-6">
                To confirm deleting your account, please enter your email below:
              </p>
              <label className="block text-sm text-theme-black-2 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="example@gmail.com"
                autoComplete="email"
                className="w-full h-14 rounded-lg border-2 border-theme-gray-2/25 px-4 text-theme-black-2 placeholder:text-theme-psGray outline-none focus:border-theme-darkBlue"
              />
              {confirmEmail && !canDeleteStep3 && (
                <p className="text-red-600 text-sm mt-3">
                  Email must match your account email ({userEmail || "—"}).
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </ReusableModal>
  );
}
