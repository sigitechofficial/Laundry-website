import { BASE_URL } from "../../utilities/URL";
import { htmlToText } from "../../utilities/sanitizeHtml";

const FALLBACK_IMAGE = "/jdc/media/hero-blog-white-shirts.jpg";
const WORDS_PER_MINUTE = 200;

/** The blogs endpoint has returned several shapes; accept them all. */
export function toBlogList(data) {
  const candidates = [data, data?.message, data?.data, data?.blogs, data?.data?.blogs, data?.data?.items];
  const list = candidates.find(Array.isArray) ?? [];
  return list.filter((b) => b && b.status !== false && b.title).map(toPost);
}

/** Single post from `admin/getBlog/:id`. */
export function toBlogPost(data) {
  const raw = [data?.message, data?.data, data?.blog, data].find(
    (x) => x && typeof x === "object" && !Array.isArray(x) && x.title
  );
  return raw ? toPost(raw) : null;
}

export function blogImageUrl(image) {
  if (!image || typeof image !== "string") return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
}

function toPost(b) {
  const text = htmlToText(b.description);
  const words = text ? text.split(" ").length : 0;
  return {
    id: b.id ?? b.blogId,
    title: String(b.title).trim(),
    html: b.description ?? "",
    excerpt: text.length > 170 ? `${text.slice(0, 167).replace(/\s+\S*$/, "")}…` : text,
    image: blogImageUrl(b.image),
    readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    date: b.createdAt ? new Date(b.createdAt) : null,
  };
}

export function formatPostDate(date) {
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export const postHref = (id) => `/blog/${encodeURIComponent(id)}`;
