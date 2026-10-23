/**
 * Chips shown on an added service card. Direct port of the prototype's
 * cardChips() (Prototype/web/assets/pages.js):
 *  - sub-choices ("<Option> - Wash temperature") are grouped with the
 *    option they belong to: "Mixed Wash · 40 °C · Bio soap"
 *  - text in brackets is dropped ("Mixed Wash (£19.50 / 6kg)" -> "Mixed Wash")
 *  - bag / item counts read "2 bags", "3 items"
 *  - instructions are left out (the "Services requested" summary shows them)
 *
 * @param {Array<{preferenceTypeName?: string, value?: any}>} prefs preferencesDisplay
 * @returns {string[]}
 */
export function serviceCardChips(prefs) {
  const strip = (v) => String(v == null ? "" : v).replace(/\s*\(.*?\)\s*/g, "").trim();
  const chips = [];
  const groups = {};

  (prefs || []).forEach((pr) => {
    const label = String(pr?.preferenceTypeName ?? pr?.label ?? "");
    const value = pr?.value;
    // "<Option> - Detergent" or "<Option> — instructions"
    const sub = label.match(/^(.*?)\s+[-—]\s+(.*)$/);

    if (sub) {
      const parent = strip(sub[1]);
      // instructions are shown in the "Services requested" summary, not on the card
      if (/instruction/i.test(sub[2])) return;
      if (groups[parent]) groups[parent].push(strip(value));
      return;
    }
    if (/^instructions?$/i.test(label)) return;

    const l = label.toLowerCase();
    // several ticks in one list arrive merged ("Shirt Hang, Polo Folded")
    String(value ?? "")
      .split(/,\s+/)
      .forEach((part) => {
        const v = strip(part);
        if (!v) return;
        let text = v;
        if (/bag/.test(l) && /^\d+$/.test(v)) text = `${v} bag${v === "1" ? "" : "s"}`;
        else if (/item/.test(l) && /^\d+$/.test(v)) text = `${v} item${v === "1" ? "" : "s"}`;
        const g = [text];
        chips.push(g);
        groups[v] = g;
      });
  });

  return chips.map((g) => g.join(" · "));
}

/**
 * Preferences of one service, grouped for the "Services requested" summary:
 * each chosen option (e.g. a wash type) carries its own temperature,
 * detergent and note, the way the mobile app lists them. Everything else
 * (single choices, bag / item counts) stays a plain label/value row.
 *
 * @param {Array<{preferenceTypeName?: string, value?: any}>} prefs preferencesDisplay
 * @returns {Array<{title: string, detail?: string, rows: Array<{label: string, value: string}>, note?: string}>}
 */
export function groupServicePrefs(prefs) {
  const text = (v) => String(v == null ? "" : v).trim();
  // "Wash Tempreture" (backend spelling) -> "Temperature"
  const tidy = (l) => text(l).replace(/^wash\s+/i, "").replace(/tempreture/i, "Temperature");
  // "Mixed Wash (£19.50 / 6kg)" -> title "Mixed Wash", detail "£19.50 / 6kg"
  const split = (v) => {
    const m = text(v).match(/^(.*?)\s*\((.*)\)\s*$/);
    return m ? { title: m[1], detail: m[2] } : { title: text(v) };
  };
  const SUB = /^(.*?)\s+[-—]\s+(.*)$/;

  const list = (prefs || []).map((pr) => ({
    label: text(pr?.preferenceTypeName ?? pr?.label),
    value: text(pr?.value),
  }));
  // options that have settings of their own ("<Option> - Detergent", "<Option> — instructions")
  const parents = new Set(list.map(({ label }) => label.match(SUB)?.[1]).filter(Boolean));

  const blocks = [];
  const byParent = {};
  let plain = null;
  list.forEach(({ label, value }) => {
    const m = label.match(SUB);
    if (m && byParent[m[1]]) {
      if (/instruction/i.test(m[2])) byParent[m[1]].note = value;
      else byParent[m[1]].rows.push({ label: tidy(m[2]), value: value || "-" });
      return;
    }
    if (parents.has(value) && !byParent[value]) {
      byParent[value] = { ...split(value), rows: [] };
      blocks.push(byParent[value]);
      plain = null;
      return;
    }
    if (!plain) {
      plain = { title: "", rows: [] };
      blocks.push(plain);
    }
    plain.rows.push({ label: label || "Preference", value: value || "-" });
  });
  return blocks;
}
