export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function to24Hour(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Converts a 24-hour time string (e.g. "13:00:00" or "13:00") to 12-hour AM/PM format.
 * @param {string} timeStr - Time in 24h format (HH:mm or HH:mm:ss)
 * @returns {string} e.g. "1:00 PM", "12:00 PM"
 */
export function formatTimeToAmPm(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return "";
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
  if (isNaN(hours)) return timeStr;
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const m = String(minutes).padStart(2, "0");
  return `${h12}:${m} ${period}`;
}
