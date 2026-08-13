import { formatTo24Hour } from "../utilities/bookingScheduleDisplay";

/**
 * Collection or delivery slot: operational time (large) + local time (small).
 */
export default function BookingSlotTimes({
  timeFrom,
  timeTo,
  slot,
  operationalShortLabel,
  className = "",
}) {
  const operationalLabel =
    slot?.operational?.label ||
    (timeFrom && timeTo
      ? `${formatTo24Hour(timeFrom)} – ${formatTo24Hour(timeTo)}`
      : "");

  const localLabel = slot?.local?.label || null;

  if (!operationalLabel) return null;

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex gap-2 items-center">
        <p className="text-sm font-medium">
          {operationalLabel}
          {operationalShortLabel ? (
            <span className="text-theme-psGray text-xs ml-1">
              ({operationalShortLabel})
            </span>
          ) : null}
        </p>
      </div>
      {localLabel ? (
        <p className="text-xs text-theme-psGray pl-0 sm:pl-6">
          Your time: {localLabel}
        </p>
      ) : null}
    </div>
  );
}
