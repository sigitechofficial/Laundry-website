export function generateCollectionSlots({
  daysCount = 4,
  slotDurationInHours = 1,
  lastHour = 19, // 7 PM
  startAfterHours = 1, // default: 1 hour ahead
} = {}) {
  const result = [];
  const now = new Date();
  const minSlotStart = new Date(now.getTime() + startAfterHours * 60 * 60 * 1000);

  // Step 1: Determine firstSlotDate (earliest time allowed)
  let firstSlotDate = new Date(minSlotStart);
  if (firstSlotDate.getHours() >= lastHour) {
    firstSlotDate.setDate(firstSlotDate.getDate() + 1);
    firstSlotDate.setHours(7, 0, 0, 0);
  } else if (firstSlotDate.getHours() < 7) {
    firstSlotDate.setHours(7, 0, 0, 0);
  } else {
    firstSlotDate.setMinutes(0, 0, 0); // round to full hour start
  }

  // Step 2: Start loop from this day forward
  let loopDate = new Date(firstSlotDate);
  loopDate.setHours(0, 0, 0, 0); // midnight of current loop date

  while (result.length < daysCount) {
    const workingDate = new Date(loopDate);
    const day = workingDate.getDay(); // 0 = Sun, 6 = Sat

    if (day !== 0 && day !== 6) {
      const slots = [];
      let slotStart;

      if (result.length === 0) {
        // First valid day
        slotStart = new Date(firstSlotDate);
      } else {
        slotStart = new Date(workingDate);
        slotStart.setHours(7, 0, 0, 0);
      }

      while (slotStart.getHours() < lastHour) {
        const slotEnd = new Date(slotStart.getTime() + slotDurationInHours * 60 * 60 * 1000);

        // Avoid overflow past the day or lastHour
        if (
          slotEnd.getDate() !== slotStart.getDate() ||
          slotEnd.getHours() > lastHour ||
          slotEnd.getHours() < slotStart.getHours()
        ) {
          break;
        }

        slots.push({
          start: formatTime(slotStart),
          end: formatTime(slotEnd),
        });

        slotStart = new Date(slotEnd);
      }

      result.push({
        date: `${workingDate.getFullYear()}-${String(workingDate.getMonth() + 1).padStart(2, "0")}-${String(workingDate.getDate()).padStart(2, "0")}`,
        dayLabel: workingDate.toLocaleDateString("en-US", { weekday: "short" }),
        displayDate: workingDate.getDate().toString(),
        timeSlots: slots,
      });
    }

    // 🚨 Always increment the loop date, even if it's a weekend
    loopDate.setDate(loopDate.getDate() + 1);
  }

  return result;
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
