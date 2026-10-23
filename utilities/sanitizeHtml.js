/**
 * Minimal allow-list HTML sanitiser for CMS content (blog posts).
 *
 * Runs in the browser only (uses DOMParser). Anything not on the allow
 * list is unwrapped (its text is kept) or dropped (script, style, iframe
 * and similar). Attributes are stripped except a safe href on links and
 * src/alt on images; javascript: and data: URLs are removed.
 */

const ALLOWED_TAGS = new Set([
  "P", "BR", "STRONG", "B", "EM", "I", "U", "S", "UL", "OL", "LI",
  "H2", "H3", "H4", "BLOCKQUOTE", "A", "IMG", "SPAN", "HR",
]);
const DROP_WITH_CONTENT = new Set([
  "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM", "INPUT",
  "BUTTON", "TEXTAREA", "SELECT", "NOSCRIPT", "TEMPLATE", "SVG", "MATH",
]);
// Headings below the page H1 are mapped down one level.
const RENAME = { H1: "H2" };

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

function cleanNode(node, doc) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    let el = child;
    if (DROP_WITH_CONTENT.has(el.tagName)) {
      el.remove();
      continue;
    }
    if (RENAME[el.tagName]) {
      const renamed = doc.createElement(RENAME[el.tagName]);
      while (el.firstChild) renamed.appendChild(el.firstChild);
      el.replaceWith(renamed);
      el = renamed;
    }

    cleanNode(el, doc);

    if (!ALLOWED_TAGS.has(el.tagName)) {
      el.replaceWith(...Array.from(el.childNodes));
      continue;
    }

    const keep = {};
    if (el.tagName === "A") {
      const href = (el.getAttribute("href") || "").trim();
      if (SAFE_URL.test(href)) keep.href = href;
    }
    if (el.tagName === "IMG") {
      const src = (el.getAttribute("src") || "").trim();
      if (!/^https?:\/\//i.test(src)) {
        el.remove();
        continue;
      }
      keep.src = src;
      keep.alt = el.getAttribute("alt") || "";
      keep.loading = "lazy";
    }
    for (const attr of Array.from(el.attributes)) el.removeAttribute(attr.name);
    for (const [k, v] of Object.entries(keep)) el.setAttribute(k, v);
    if (el.tagName === "A" && /^https?:/i.test(keep.href || "")) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer nofollow");
    }
  }
}

export function sanitizeHtml(html) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<body>${html ?? ""}</body>`, "text/html");
  cleanNode(doc.body, doc);
  return doc.body.innerHTML;
}

/** Plain text from HTML without a DOM (safe on the server too). */
export function htmlToText(html) {
  return String(html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
