import { FALLBACK_SERVICE_NAMES, FEATURED_SERVICES, SERVICE_ICONS } from "./content";

/** Lower-case, collapse "and" / "&" and whitespace for name matching. */
export function normaliseServiceName(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/\band\b/g, "&")
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalisedMatch = (list) => list.map(normaliseServiceName);

export function iconForService(name) {
  const n = normaliseServiceName(name);
  const hit = SERVICE_ICONS.find((entry) => entry.match.some((m) => n.includes(m)));
  return hit ? hit.icon : "washer";
}

/**
 * Builds the landing page service model from the `customer/serviceDetail`
 * response.
 *
 * @returns {{
 *   featured: Array,      featured cards that are live (all of them if no API data)
 *   more: Array<{id, name, icon}>,  other live services, for the chips
 *   all: Array<{id, name, icon}>,   every live service, for the marquee
 *   total: number,
 *   isLive: boolean,      true when the data came from the API
 * }}
 */
export function buildServiceModel(apiServices) {
  const live = Array.isArray(apiServices)
    ? apiServices
        .filter((s) => s?.service && s.service.status !== false)
        .map((s) => ({
          id: s.serviceId ?? s.service.id ?? s.service.name,
          name: String(s.service.name ?? "").trim(),
        }))
        .filter((s) => s.name)
    : [];

  const isLive = live.length > 0;
  const source = isLive
    ? live
    : FALLBACK_SERVICE_NAMES.map((name) => ({ id: name, name }));

  const featuredIds = new Set();
  const featured = FEATURED_SERVICES.filter((card) => {
    if (!isLive) return true;
    const keys = normalisedMatch(card.match);
    const hit = source.find((s) => keys.includes(normaliseServiceName(s.name)));
    if (hit) featuredIds.add(hit.id);
    return Boolean(hit);
  });

  const withIcon = (s) => ({ ...s, icon: iconForService(s.name) });
  const all = source.map(withIcon);
  const more = isLive
    ? all.filter((s) => !featuredIds.has(s.id))
    : all.filter(
        (s) =>
          !FEATURED_SERVICES.some((card) =>
            normalisedMatch(card.match).includes(normaliseServiceName(s.name))
          )
      );

  return { featured, more, all, total: source.length, isLive };
}
