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
