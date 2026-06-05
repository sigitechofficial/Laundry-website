import { BASE_URL } from "./URL";

function authHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchZoneForCoordinates(lat, lng) {
  const response = await fetch(
    `${BASE_URL}customer/fetchZoneAndCharges?lat=${lat}&lng=${lng}`,
    { method: "GET", headers: authHeaders() }
  );
  const json = await response.json();
  if (!response.ok || json?.status === "0") {
    throw new Error(json?.message || "Zone lookup failed");
  }
  return json.data;
}

export async function fetchBookingSlots({
  countryId,
  zoneId,
  clientTimeZone,
  type = "collection",
  daysCount,
  startAfterHours,
  fromDate,
}) {
  const params = new URLSearchParams();
  if (countryId != null) params.set("countryId", String(countryId));
  if (zoneId != null) params.set("zoneId", String(zoneId));
  if (clientTimeZone) params.set("clientTimeZone", clientTimeZone);
  if (type) params.set("type", type);
  if (daysCount != null) params.set("daysCount", String(daysCount));
  if (startAfterHours != null) {
    params.set("startAfterHours", String(startAfterHours));
  }
  if (fromDate) params.set("fromDate", fromDate);

  const response = await fetch(
    `${BASE_URL}customer/bookingSlots?${params.toString()}`,
    { method: "GET", headers: authHeaders() }
  );
  const json = await response.json();
  if (!response.ok || json?.status === "0") {
    throw new Error(json?.message || "Could not load booking slots");
  }
  return json.data;
}
