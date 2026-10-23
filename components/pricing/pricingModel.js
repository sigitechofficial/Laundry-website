import { iconForService, normaliseServiceName } from "../home/serviceModel";
import { parseTimeRequiredDays } from "../../utilities/turnaroundTime";
import { SERVICE_BLURBS } from "./content";

const toNumber = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export function blurbFor(name, description) {
  if (typeof description === "string" && description.trim()) return description.trim();
  const n = normaliseServiceName(name);
  return SERVICE_BLURBS.find((b) => b.match.some((m) => n.includes(m)))?.text ?? "";
}

export function turnaroundLabel(days) {
  if (!days) return null;
  return days === 1 ? "Ready in 1 day" : `Ready in ${days} days`;
}

/**
 * Maps the `customer/serviceDetail` response to the pricing view model.
 * Inactive services, categories and items are dropped.
 */
export function buildPricingModel(serviceData) {
  if (!Array.isArray(serviceData)) return [];

  return serviceData
    .filter((s) => s?.service && s.service.status !== false)
    .map((s) => {
      const name = String(s.service.name ?? "").trim();
      const categories = (s.categories ?? [])
        .filter((c) => c?.category && c.category.status !== false)
        .map((c) => ({
          id: c.categoryId ?? c.category.id,
          name: String(c.category.name ?? "").trim(),
          description: c.category.description?.trim() || "",
          items: (c.subCategories ?? [])
            .filter((sc) => sc && sc.status !== false)
            .map((sc) => ({ id: sc.id, name: String(sc.name ?? "").trim(), price: toNumber(sc.price) })),
        }))
        .filter((c) => c.items.length > 0 || c.description);

      const prices = categories.flatMap((c) => c.items.map((i) => i.price)).filter((p) => p !== null);
      const days = parseTimeRequiredDays(s.service.turnAroundTime);

      return {
        id: s.serviceId ?? s.service.id,
        name,
        description: blurbFor(name, s.service.description),
        icon: iconForService(name),
        turnaround: turnaroundLabel(days),
        categories,
        itemCount: categories.reduce((n, c) => n + c.items.length, 0),
        minPrice: prices.length ? Math.min(...prices) : null,
      };
    })
    .filter((s) => s.name);
}

/** Case-insensitive item search across category and item names. */
export function filterCategories(categories, query) {
  const q = query.trim().toLowerCase();
  if (!q) return categories;
  return categories
    .map((c) => {
      if (c.name.toLowerCase().includes(q)) return c;
      const items = c.items.filter((i) => i.name.toLowerCase().includes(q));
      return items.length ? { ...c, items } : null;
    })
    .filter(Boolean);
}
