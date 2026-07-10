"use client";

import React from "react";

function formatMinutesWindow(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return "No free window";
  if (value % 60 === 0) {
    const hours = value / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${value} minute${value === 1 ? "" : "s"}`;
}

function formatMoney(amount, currency) {
  const numeric = Number.parseFloat(amount);
  if (!Number.isFinite(numeric)) return null;
  return `${currency || ""} ${numeric.toFixed(2)}`.trim();
}

function formatChargeWithFallback(amount, currency, percentage) {
  const money = formatMoney(amount, currency);
  if (money) return money;
  const numericPercentage = Number.parseFloat(percentage);
  if (Number.isFinite(numericPercentage) && numericPercentage > 0) {
    return `${numericPercentage}% of prepaid bill`;
  }
  return "N/A";
}

function formatPhaseLabel(phase) {
  const labels = {
    pre_pickup: "Pre-pickup",
    unprocessed: "Unprocessed",
    invoiced: "Invoice generated",
    processing: "Processing",
    post_invoice: "Post-invoice",
    completed: "Completed",
    cancelled: "Cancelled",
    unknown: "Unknown",
  };
  return labels[phase] || phase || "N/A";
}

function formatAttemptStatus(status) {
  if (!status) return "N/A";
  return String(status).replace(/_/g, " ");
}

export function OrderPhaseBadge({ orderStatusContext, cancellationSummary }) {
  const phase =
    cancellationSummary?.phaseLabel ||
    formatPhaseLabel(orderStatusContext?.cancellationPhase);
  const title = orderStatusContext?.title;

  if (!phase && !title) return null;

  return (
    <div className="rounded-lg border border-[#E4E8F0] bg-[#F8FAFC] px-3 py-2 space-y-1">
      {title ? (
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      ) : null}
      {phase ? (
        <p className="text-xs text-theme-psGray">
          Cancellation phase:{" "}
          <span className="font-medium text-gray-800">{phase}</span>
        </p>
      ) : null}
      {cancellationSummary?.canCancel === false && cancellationSummary?.cancelBlockedReason ? (
        <p className="text-xs text-amber-700">{cancellationSummary.cancelBlockedReason}</p>
      ) : null}
    </div>
  );
}

export function CancellationSummaryCard({
  cancellationPolicy,
  cancellationSummary,
  compact = false,
}) {
  const policy = cancellationSummary?.policy || cancellationPolicy;
  const feePreview = cancellationSummary?.feePreview;

  if (!policy && !cancellationSummary) return null;

  return (
    <div className={`font-sf space-y-3 ${compact ? "" : "border-t pt-4"}`}>
      <p className="font-youth font-bold">
        Cancellation Policy
        {cancellationSummary?.policySource === "snapshotted" ? " (on this order)" : ""}
      </p>

      {cancellationSummary ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 space-y-1 text-sm">
          <p>
            <span className="text-theme-psGray">Phase: </span>
            <span className="font-medium">
              {cancellationSummary.phaseLabel || formatPhaseLabel(cancellationSummary.phase)}
            </span>
          </p>
          <p>
            <span className="text-theme-psGray">Can cancel now: </span>
            <span className="font-medium">
              {cancellationSummary.canCancel ? "Yes" : "No"}
            </span>
          </p>
          {feePreview ? (
            <>
              <p>
                <span className="text-theme-psGray">Estimated fee: </span>
                <span className="font-medium">
                  {formatMoney(feePreview.cancellationCharge, feePreview.currency) ||
                    "No charge"}
                </span>
              </p>
              {Number.isFinite(Number.parseFloat(feePreview.refundAmount)) ? (
                <p>
                  <span className="text-theme-psGray">Estimated refund: </span>
                  <span className="font-medium">
                    {formatMoney(feePreview.refundAmount, feePreview.currency)}
                  </span>
                </p>
              ) : null}
              {feePreview.message ? (
                <p className="text-xs text-gray-600">{feePreview.message}</p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {policy ? (
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-theme-psGray">Policy: </span>
            <span className="font-medium">{policy.name || "N/A"}</span>
          </p>
          {policy.description ? (
            <p>
              <span className="text-theme-psGray">Description: </span>
              <span className="font-medium">{policy.description}</span>
            </p>
          ) : null}
          <p>
            <span className="text-theme-psGray">Free cancellation window: </span>
            <span className="font-medium">
              {formatMinutesWindow(policy.freeCancellationWindowMinutes)}
            </span>
          </p>
          <p>
            <span className="text-theme-psGray">Late cancellation charge: </span>
            <span className="font-medium">
              {formatChargeWithFallback(
                policy.prePickupChargeAmount,
                policy.prePickupChargeCurrency,
                policy.prePickupChargePercentage
              )}
            </span>
          </p>
          <p>
            <span className="text-theme-psGray">First cancellation free: </span>
            <span className="font-medium">
              {policy.firstCancellationFree ? "Yes" : "No"}
            </span>
          </p>
          <p>
            <span className="text-theme-psGray">Unprocessed cancellation: </span>
            <span className="font-medium">
              {policy.allowCancelUnprocessed ? "Allowed" : "Not allowed"}
            </span>
          </p>
          {policy.allowCancelUnprocessed ? (
            <p>
              <span className="text-theme-psGray">Unprocessed charge: </span>
              <span className="font-medium">
                {formatChargeWithFallback(
                  policy.unprocessedChargeAmount,
                  policy.unprocessedChargeCurrency,
                  policy.unprocessedChargePercentage
                )}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function NoShowSummaryCard({ noShowSummary, noShowPolicy }) {
  const policy = noShowSummary?.policy || noShowPolicy;
  if (!noShowSummary && !policy) return null;

  const pickupPreview = noShowSummary?.feePreview?.pickup;
  const deliveryPreview = noShowSummary?.feePreview?.delivery;
  const attempts = Array.isArray(noShowSummary?.attempts) ? noShowSummary.attempts : [];

  return (
    <div className="font-sf space-y-3 border-t pt-4">
      <p className="font-youth font-bold">
        No-Show Policy
        {noShowSummary?.policySource === "snapshotted" ? " (on this order)" : ""}
      </p>

      {noShowSummary ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 space-y-1 text-sm">
          <p>
            <span className="text-theme-psGray">Pickup attempts used: </span>
            <span className="font-medium">
              {noShowSummary.pickupAttemptCount ?? 0} / {noShowSummary.maxPickupAttempts ?? 3}
            </span>
          </p>
          <p>
            <span className="text-theme-psGray">Delivery attempts used: </span>
            <span className="font-medium">{noShowSummary.deliveryAttemptCount ?? 0}</span>
          </p>
          {Number.isFinite(noShowSummary.remainingPickupAttempts) ? (
            <p>
              <span className="text-theme-psGray">Pickup attempts remaining: </span>
              <span className="font-medium">{noShowSummary.remainingPickupAttempts}</span>
            </p>
          ) : null}
          {Number.parseFloat(noShowSummary.noShowFeeAccrued) > 0 ? (
            <p>
              <span className="text-theme-psGray">Fees accrued on order: </span>
              <span className="font-medium">
                {formatMoney(
                  noShowSummary.noShowFeeAccrued,
                  pickupPreview?.currency || policy?.currency
                )}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {policy ? (
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-theme-psGray">Policy: </span>
            <span className="font-medium">{policy.name || "N/A"}</span>
          </p>
          <p>
            <span className="text-theme-psGray">Grace on site: </span>
            <span className="font-medium">
              {formatMinutesWindow(policy.graceMinutesOnSite)}
            </span>
          </p>
          {pickupPreview ? (
            <p>
              <span className="text-theme-psGray">Pickup no-show fee: </span>
              <span className="font-medium">
                {pickupPreview.feeWaived
                  ? "Waived"
                  : formatMoney(pickupPreview.feeAmount, pickupPreview.currency) ||
                    formatMoney(policy.pickupNoShowFee, policy.currency) ||
                    "N/A"}
              </span>
            </p>
          ) : null}
          {deliveryPreview ? (
            <p>
              <span className="text-theme-psGray">Delivery no-show fee: </span>
              <span className="font-medium">
                {deliveryPreview.feeWaived
                  ? "Waived"
                  : formatMoney(deliveryPreview.feeAmount, deliveryPreview.currency) ||
                    formatMoney(policy.deliveryNoShowFee, policy.currency) ||
                    "N/A"}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {attempts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">Attempt history</p>
          <div className="space-y-2">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs space-y-0.5"
              >
                <p className="font-medium capitalize">
                  {attempt.attemptType} · Attempt {attempt.attemptNumber} ·{" "}
                  {formatAttemptStatus(attempt.status)}
                </p>
                {attempt.unattendedMethod ? (
                  <p className="text-theme-psGray">
                    Method: {String(attempt.unattendedMethod).replace(/_/g, " ")}
                  </p>
                ) : null}
                {attempt.failureReason ? (
                  <p className="text-theme-psGray">Reason: {attempt.failureReason}</p>
                ) : null}
                {Number.parseFloat(attempt.feeAmount) > 0 ? (
                  <p className="text-theme-psGray">
                    Fee:{" "}
                    {attempt.feeWaived
                      ? "Waived"
                      : formatMoney(attempt.feeAmount, attempt.feeCurrency)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function BookingPolicySummary({
  orderStatusContext,
  cancellationPolicy,
  cancellationSummary,
  noShowPolicy,
  noShowSummary,
}) {
  const hasContent =
    orderStatusContext ||
    cancellationPolicy ||
    cancellationSummary ||
    noShowPolicy ||
    noShowSummary;

  if (!hasContent) return null;

  return (
    <div className="space-y-4">
      <OrderPhaseBadge
        orderStatusContext={orderStatusContext}
        cancellationSummary={cancellationSummary}
      />
      <CancellationSummaryCard
        cancellationPolicy={cancellationPolicy}
        cancellationSummary={cancellationSummary}
      />
      <NoShowSummaryCard noShowSummary={noShowSummary} noShowPolicy={noShowPolicy} />
    </div>
  );
}
