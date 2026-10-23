"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addToast } from "@heroui/react";
import ProtoIcon from "../proto/ProtoIcon";
import { cx } from "../ds/cx";
import { CTRL, CTRL_ICON, CTRL_INPUT, FIELD, FIELD_LABEL, FIELDSET, LEGEND } from "./ui";
import {
  useLazyGetAddressesByPostcodeQuery,
  useLazyGetPostcodeAutocompleteQuery,
} from "../../src/app/store/services/api";
import {
  filterAddresses,
  formatSpacedPostcode,
  getRetryAfterSeconds,
  isFullUkPostcode,
  normalizePostcode,
  readSessionAddressCache,
  writeSessionAddressCache,
} from "../../utilities/postcodeLookup";

/*
 * Book page "Address" group, prototype markup (book.html .bk2-row--addr):
 * Post code + find button, then the Address field with the address list
 * dropping down inside it (.bk-addrs). Addresses come from the postcode API;
 * picking one fills the booking (it carries the coordinates used for slots).
 * Saved addresses show in the same list when no postcode has been searched.
 */

// Address list dropping down inside the Address field (.bk-addrs).
// Postcode suggestions under the Post code field
const SUGGESTIONS =
  "absolute left-0 right-0 top-[calc(100%+6px)] thin-scroll z-40 max-h-[260px] overflow-y-auto overscroll-contain rounded-[14px] border border-jdc-line bg-white p-1.5 [box-shadow:0_14px_34px_rgba(27,34,48,0.10)]";
const SUGGESTION =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-none px-3 py-[11px] text-left text-[15px] font-semibold text-jdc-navy hover:bg-jdc-blue-tint focus-visible:bg-jdc-blue-tint focus-visible:[outline:none]";
// Round × inside a field (Post code, Address)
const CLEAR_BTN =
  "absolute right-3 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-[#F1F3F7] text-[18px] leading-none text-jdc-muted hover:bg-[#E4E8F0] hover:text-jdc-navy";

const ADDRS =
  "absolute left-0 right-0 top-[calc(100%+6px)] z-30 mt-0 animate-jdc-addrs-in overflow-hidden rounded-[14px] border border-jdc-blue bg-white [box-shadow:0_0_0_4px_rgba(2,120,254,0.10),0_14px_34px_rgba(27,34,48,0.10)]";

function lines(a, code) {
  const l1 = [a?.line1, a?.line2].filter(Boolean).join(", ") || a?.fullAddress || "";
  const l2 = [a?.town, a?.postcode ? formatSpacedPostcode(normalizePostcode(a.postcode)) : code]
    .filter(Boolean)
    .join(" ");
  return { l1, l2 };
}

export default function BookAddressFields({
  postcode,
  onPostcodeChange,
  address,
  savedAddresses = [],
  onPickAddress,
  onPickSaved,
  onClearAddress,
  disabled = false,
  autoSearch = "",
}) {
  const [items, setItems] = useState([]);
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(null); // null = show the chosen address
  const [cooldown, setCooldown] = useState(0);
  const listRef = useRef(null);
  const addrRef = useRef(null);
  const [fetchAddresses, { isFetching }] = useLazyGetAddressesByPostcodeQuery();
  const [fetchSuggestions, { isFetching: isSuggesting }] = useLazyGetPostcodeAutocompleteQuery();
  // Postcode suggestions while typing (only after the user edits the field)
  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestTypeRef = useRef("postcode");
  const debounceRef = useRef(null);
  const seqRef = useRef(0);
  const suggestRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const saved = Array.isArray(savedAddresses) ? savedAddresses : [];
  const showingSaved = items.length === 0 && saved.length > 0;
  const shown = useMemo(() => {
    if (!showingSaved) return filterAddresses(items, query || "");
    const q = (query || "").trim().toLowerCase();
    return saved.filter(
      (s) => !q || [s?.streetAddress, s?.district, s?.province, s?.postalCode].join(" ").toLowerCase().includes(q)
    );
  }, [items, saved, showingSaved, query]);

  const runSuggest = (raw, { immediate = false } = {}) => {
    const q = normalizePostcode(raw) || String(raw || "").trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      seqRef.current += 1;
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    const go = async () => {
      const seq = ++seqRef.current;
      try {
        const res = await fetchSuggestions(q, { forceRefetch: true, subscribe: false }).unwrap();
        if (seq !== seqRef.current) return;
        // hide the postcode that is already typed (e.g. "NW119ES" == "NW11 9ES")
        const list = (res?.data?.suggestions || []).filter((x) => (normalizePostcode(x) || x) !== q);
        suggestTypeRef.current = res?.data?.suggestionType || "postcode";
        setSuggestions(list);
        setSuggestOpen(list.length > 0);
      } catch {
        if (seq !== seqRef.current) return;
        setSuggestions([]);
        setSuggestOpen(false);
      }
    };
    if (immediate || isFullUkPostcode(q)) void go();
    else debounceRef.current = setTimeout(go, 350);
  };

  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);

  // close the suggestions when clicking outside the Post code field
  useEffect(() => {
    if (!suggestOpen) return undefined;
    const onDown = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [suggestOpen]);

  const pickSuggestion = (value) => {
    onPostcodeChange?.(value);
    if (suggestTypeRef.current === "outcode") {
      // an area like "NW11": show the full postcodes inside it
      runSuggest(value, { immediate: true });
      return;
    }
    setSuggestOpen(false);
    setSuggestions([]);
    void search(value);
  };

  const onSuggestKey = (e) => {
    const bs = Array.from(suggestRef.current?.querySelectorAll("[role=option]") || []);
    const i = bs.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      bs[Math.min(bs.length - 1, i + 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i <= 0) pcRef.current?.focus();
      else bs[i - 1]?.focus();
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      pcRef.current?.focus();
    }
  };

  const search = async (raw = postcode) => {
    const normalized = normalizePostcode(raw);
    if (!normalized) {
      addToast({ title: "Enter your postcode first", color: "warning" });
      return;
    }
    if (!isFullUkPostcode(normalized)) {
      addToast({ title: "Enter a full UK postcode (e.g. SW1A 1AA).", color: "warning" });
      return;
    }
    if (cooldown > 0) {
      addToast({ title: `Please wait ${cooldown}s before searching again.`, color: "warning" });
      return;
    }
    const spaced = formatSpacedPostcode(normalized);
    onPostcodeChange?.(spaced);
    let list = readSessionAddressCache(normalized)?.addresses || [];
    if (!list.length) {
      try {
        const res = await fetchAddresses(normalized).unwrap();
        list = res?.data?.addresses || [];
        if (list.length) writeSessionAddressCache(normalized, { addresses: list });
      } catch (error) {
        const retry = getRetryAfterSeconds(error);
        if (retry) setCooldown(retry);
        // 404 = no addresses for this postcode: a warning with a hint, not an error
        if (error?.status === 404) {
          addToast({
            title: "No addresses found for this postcode.",
            description: "Please check the postcode and try again.",
            color: "warning",
          });
          return;
        }
        addToast({
          title: error?.data?.message || error?.data?.error || "Could not fetch addresses. Please try again.",
          color: "danger",
        });
        return;
      }
    }
    if (!list.length) {
      addToast({ title: "No addresses found for this postcode.", color: "warning" });
      return;
    }
    setCode(spaced);
    setItems(list);
    setQuery("");
    setOpen(true);
    requestAnimationFrame(() => {
      const first = listRef.current?.querySelector("button");
      if (first) first.focus({ preventScroll: true });
    });
  };

  // A postcode handed in from elsewhere (home page form): look it up straight away.
  useEffect(() => {
    if (!autoSearch || disabled) return;
    if (isFullUkPostcode(normalizePostcode(autoSearch))) void search(autoSearch);
    else runSuggest(autoSearch, { immediate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSearch]);

  // The address can be filled in without a lookup this visit (saved booking, coming
  // back from Services). When the customer edits it, load that postcode's addresses
  // quietly so the list is there (no focus jump, no toasts).
  const quietLoadRef = useRef("");
  const loadPostcodeAddresses = async () => {
    const normalized = normalizePostcode(postcode);
    if (items.length || !isFullUkPostcode(normalized) || quietLoadRef.current === normalized) return;
    quietLoadRef.current = normalized;
    let list = readSessionAddressCache(normalized)?.addresses || [];
    if (!list.length) {
      try {
        const res = await fetchAddresses(normalized).unwrap();
        list = res?.data?.addresses || [];
        if (list.length) writeSessionAddressCache(normalized, { addresses: list });
      } catch {
        quietLoadRef.current = "";
        return;
      }
    }
    if (!list.length) return;
    setCode(formatSpacedPostcode(normalized));
    setItems(list);
    if (document.activeElement === addrRef.current) setOpen(true);
  };

  // close when clicking outside the Address field
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      const f = document.getElementById("bkAddrF");
      if (f && !f.contains(e.target)) {
        setOpen(false);
        setQuery(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (a) => {
    if (showingSaved) onPickSaved?.(a);
    else onPickAddress?.({ ...a, postcode: formatSpacedPostcode(normalizePostcode(a?.postcode || code)) || code });
    setOpen(false);
    setQuery(null);
    // One click / Enter closes the list and moves on to the collection time.
    // (Focusing the address box again reopened the list, so it took two clicks.)
    requestAnimationFrame(() => {
      const next = [document.getElementById("bkColWhen"), document.getElementById("bkDelWhen")].find((el) => el && !el.disabled);
      if (next) next.focus();
      else addrRef.current?.blur();
    });
  };

  const onListKey = (e) => {
    const bs = Array.from(listRef.current?.querySelectorAll("[role=option]") || []);
    const i = bs.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      bs[Math.min(bs.length - 1, i + 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i <= 0) addrRef.current?.focus();
      else bs[i - 1]?.focus();
    } else if (e.key === "Escape") {
      setOpen(false);
      addrRef.current?.focus();
    }
  };

  const countText = showingSaved
    ? "Your saved addresses"
    : shown.length
      ? `${shown.length} address${shown.length > 1 ? "es" : ""} for ${code}`
      : "No match — keep typing your address";

  return (
    <fieldset className={FIELDSET}>
      <legend className={LEGEND}>Address</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-[18px] max-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] max-[720px]:grid-cols-[minmax(0,1fr)] max-[720px]:gap-3.5">
        <div className={FIELD}>
          <label htmlFor="bkPc" className={FIELD_LABEL}>Post code</label>
          <div className="relative flex items-stretch gap-2.5" ref={suggestRef}>
            <div className={CTRL}>
              <span className={CTRL_ICON}>
                <ProtoIcon name="pin" size={18} />
              </span>
              <input
                ref={pcRef}
                className={cx(CTRL_INPUT, "pr-11")}
                id="bkPc"
                name="postcode"
                placeholder="e.g. NW11 9ES"
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="bkPcList"
                aria-expanded={suggestOpen ? "true" : "false"}
                value={postcode || ""}
                disabled={disabled}
                onChange={(e) => {
                  setItems([]);
                  setOpen(false);
                  onPostcodeChange?.(e.target.value);
                  runSuggest(e.target.value);
                }}
                onFocus={() => {
                  if (suggestions.length) setSuggestOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSuggestOpen(false);
                    void search();
                  } else if (e.key === "ArrowDown" && suggestOpen) {
                    e.preventDefault();
                    suggestRef.current?.querySelector("[role=option]")?.focus();
                  } else if (e.key === "Escape") {
                    setSuggestOpen(false);
                  }
                }}
              />
              {/* Clear the postcode (and the address that came from it) */}
              {!disabled && postcode ? (
                <button
                  type="button"
                  className={CLEAR_BTN}
                  aria-label="Clear postcode"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    seqRef.current += 1;
                    setSuggestions([]);
                    setSuggestOpen(false);
                    setItems([]);
                    setOpen(false);
                    setQuery(null);
                    quietLoadRef.current = "";
                    onPostcodeChange?.("");
                    onClearAddress?.();
                    pcRef.current?.focus();
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-xl border-0 bg-jdc-blue text-white hover:bg-jdc-blue-dark [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:h-14 [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:w-14 [@media(min-width:901px)_and_(max-height:860px)]:h-14 [@media(min-width:901px)_and_(max-height:860px)]:w-14 max-[720px]:h-14 max-[720px]:w-14"
              aria-label="Find my address"
              disabled={disabled || isFetching}
              onClick={() => void search()}
            >
              <ProtoIcon name="search" size={20} />
            </button>
            <div className={cx(SUGGESTIONS, !suggestOpen && "hidden")} hidden={!suggestOpen}>
              <ul id="bkPcList" role="listbox" aria-label="Suggested postcodes" className="m-0 list-none p-0" onKeyDown={onSuggestKey}>
                {suggestions.map((sug) => (
                  <li key={sug}>
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      tabIndex={-1}
                      className={SUGGESTION}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickSuggestion(sug)}
                    >
                      <ProtoIcon name="pin" size={16} />
                      {sug}
                    </button>
                  </li>
                ))}
              </ul>
              {isSuggesting ? <p className="m-0 px-3 py-2 text-[12.5px] text-jdc-muted">Searching postcodes…</p> : null}
            </div>
          </div>
        </div>
        <div className={cx(FIELD, "mt-0")} id="bkAddrF">
          <label htmlFor="bkAddr" className={FIELD_LABEL}>Address</label>
          <div className={CTRL}>
            <span className={CTRL_ICON}>
              <ProtoIcon name="home" size={18} />
            </span>
            <input
              ref={addrRef}
              className={cx(CTRL_INPUT, "pr-11")}
              id="bkAddr"
              name="address"
              placeholder="House number and street"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="bkAddrsList"
              aria-expanded={open ? "true" : "false"}
              disabled={disabled}
              value={query === null ? address || "" : query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (items.length || saved.length) setOpen(true);
                void loadPostcodeAddresses();
              }}
              onFocus={() => {
                if (items.length || saved.length) setOpen(true);
                void loadPostcodeAddresses();
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && open) {
                  e.preventDefault();
                  listRef.current?.querySelector("button")?.focus();
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery(null);
                }
              }}
            />
            {/* Clear the address and show this postcode's addresses again */}
            {!disabled && (query === null ? address : query) ? (
              <button
                type="button"
                className={CLEAR_BTN}
                aria-label="Clear address"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery("");
                  onClearAddress?.();
                  addrRef.current?.focus();
                  if (items.length || saved.length) setOpen(true);
                  void loadPostcodeAddresses();
                }}
              >
                ×
              </button>
            ) : null}
            <div className={cx(ADDRS, !(open) && "hidden")} id="bkAddrs" hidden={!open}>
              <div className="flex items-center justify-between gap-3 border-b border-jdc-line bg-jdc-blue-tint px-4 py-3 text-[13.5px] font-semibold text-jdc-navy max-[720px]:px-3.5 max-[720px]:py-[11px] max-[720px]:text-[13px]">
                <span id="bkAddrsCount">{countText}</span>
              </div>
              <ul
                className="thin-scroll m-0 max-h-[320px] list-none overflow-y-auto overscroll-contain p-1.5 max-[720px]:max-h-[min(52vh,360px)]"
                id="bkAddrsList"
                role="listbox"
                aria-label="Addresses for this postcode"
                ref={listRef}
                onKeyDown={onListKey}
              >
                {shown.map((a, i) => {
                  const t = showingSaved
                    ? { l1: a?.streetAddress || a?.district || "", l2: [a?.district, a?.postalCode].filter(Boolean).join(" ") }
                    : lines(a, code);
                  return (
                    <li key={a?.id || a?.suggestionId || i}>
                      <button
                        type="button"
                        className="flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-[10px] border-0 bg-none px-3 py-[11px] text-left text-jdc-text hover:bg-jdc-blue-tint hover:[outline:none] focus-visible:bg-jdc-blue-tint focus-visible:[box-shadow:inset_0_0_0_2px_var(--jdc-blue)] focus-visible:[outline:none]"
                        role="option"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(a)}
                      >
                        <span className="text-[15px] font-semibold text-jdc-navy">{t.l1}</span>
                        <span className="text-[13px] text-jdc-muted">{t.l2}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
