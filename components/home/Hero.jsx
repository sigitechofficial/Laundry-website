"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "../ds/Icon";
import BackgroundVideo from "../ds/BackgroundVideo";
import ProtoIcon from "../proto/ProtoIcon";
import { HERO } from "./content";
import { useStartBooking } from "../../utilities/useStartBooking";
import { normalisePostcode, postcodeError } from "../../utilities/ukPostcode";
import { ensureGuestSession } from "../../utilities/guestSession";
import { useLazyGetPostcodeAutocompleteQuery } from "../../src/app/store/services/api";

// Postcode suggestions under the booking pill ("NW" -> NW1, NW2…; "NW11 9" -> NW11 9AA…)
const SUGGEST_LIST =
  "absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[280px] thin-scroll max-w-[460px] overflow-y-auto overscroll-contain rounded-[16px] border border-jdc-line bg-white p-1.5 text-left text-jdc-navy";
const SUGGEST_ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-3 py-2.5 text-left text-[15px] font-semibold text-jdc-navy hover:bg-jdc-paper focus:bg-jdc-paper focus:[outline:none] [&_svg]:flex-none [&_svg]:text-[#8A93A6]";

/* Long copy on desktop/tablet, short copy on phones.
   Short phones use the variant [@media(max-width:720px)_and_(max-height:700px)]. */
const ONLY_LG = "max-[720px]:hidden";
const ONLY_SM = "hidden max-[720px]:inline";

/* Booking pill field. The pill shows the focus ring, so the inner controls don't need one. */
const FIELD =
  "flex min-w-0 flex-col justify-center p-[6px_22px] max-[720px]:flex-[1_1_100%] max-[720px]:p-[7px_14px] [&_input:focus-visible]:[outline:none] [&_select:focus-visible]:[outline:none]";
const FIELD_LABEL = "text-[13px] font-bold text-jdc-navy max-[720px]:mb-[2px] max-[720px]:text-[12px]";
const FIELD_CONTROL = "w-full min-w-0 border-0 bg-transparent p-0 text-[15px] text-jdc-muted [outline:none]";

/** "Pickup" day picker in the booking pill: site-styled menu instead of the browser's own select list. */
function PickupSelect({ id, labelId, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(0, options.indexOf(value)));
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openMenu = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  const pick = (opt) => {
    onChange(opt);
    setOpen(false);
    btnRef.current?.focus();
  };
  const onKeyDown = (e) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(options[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-controls={`${id}-menu`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        className="flex w-full min-w-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-[15px] text-jdc-muted [outline:none]"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">{value}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
          className={`ml-auto flex-none text-jdc-navy transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
        </svg>
      </button>
      <ul
        id={`${id}-menu`}
        role="listbox"
        aria-labelledby={labelId}
        hidden={!open}
        className="absolute left-[-14px] top-[calc(100%+14px)] z-30 m-0 w-[190px] list-none rounded-[14px] border border-jdc-line bg-white p-1.5 text-left max-[720px]:left-[-8px]"
      >
        {options.map((opt, i) => {
          const selected = opt === value;
          return (
            <li
              key={opt}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={selected}
              className={`flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2.5 text-[15px] font-semibold ${
                i === active ? "bg-jdc-paper" : ""
              } ${selected ? "text-jdc-blue" : "text-jdc-navy"}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(opt)}
            >
              <span className="flex-1">{opt}</span>
              {selected ? (
                <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                </svg>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Hero() {
  const startBooking = useStartBooking();
  const uid = useId();
  const [pickup, setPickup] = useState(HERO.pickupOptions[0]);
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");

  const ids = { when: `${uid}-when`, where: `${uid}-where`, error: `${uid}-error`, list: `${uid}-pc-list` };

  const [fetchSuggestions] = useLazyGetPostcodeAutocompleteQuery();
  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestTypeRef = useRef("postcode");
  const debounceRef = useRef(null);
  const seqRef = useRef(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const runSuggest = (raw, immediate = false) => {
    const q = String(raw || "").replace(/\s+/g, "").toUpperCase();
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
        await ensureGuestSession();
        const res = await fetchSuggestions(q, { forceRefetch: true, subscribe: false }).unwrap();
        if (seq !== seqRef.current) return;
        const list = (res?.data?.suggestions || []).filter((x) => String(x).replace(/\s+/g, "").toUpperCase() !== q);
        suggestTypeRef.current = res?.data?.suggestionType || "postcode";
        setSuggestions(list);
        setSuggestOpen(list.length > 0);
      } catch {
        if (seq !== seqRef.current) return;
        setSuggestions([]);
        setSuggestOpen(false);
      }
    };
    if (immediate) void go();
    else debounceRef.current = setTimeout(go, 300);
  };

  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);

  // close the list when clicking elsewhere
  useEffect(() => {
    if (!suggestOpen) return undefined;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [suggestOpen]);

  const book = (value) => {
    const message = postcodeError(value);
    setError(message);
    if (message) return;
    startBooking({ pickup, postcode: normalisePostcode(value) });
  };

  const pickSuggestion = (value) => {
    if (suggestTypeRef.current === "outcode") {
      // an area (e.g. NW11): narrow down to its full postcodes
      const next = `${value} `;
      setPostcode(next);
      runSuggest(next, true);
      inputRef.current?.focus();
      return;
    }
    setPostcode(value);
    setSuggestOpen(false);
    book(value);
  };

  const onListKey = (e) => {
    const items = Array.from(boxRef.current?.querySelectorAll("[role=option]") || []);
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[Math.min(items.length - 1, i + 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i <= 0) inputRef.current?.focus();
      else items[i - 1]?.focus();
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSuggestOpen(false);
    book(postcode);
  };

  return (
    <section
      className="relative flex min-h-[max(560px,100svh)] overflow-hidden bg-jdc-navy text-jdc-white after:absolute after:inset-0 after:content-[''] after:[background:linear-gradient(90deg,rgba(27,34,48,0.96)_0%,rgba(27,34,48,0.88)_40%,rgba(27,34,48,0.68)_72%,rgba(27,34,48,0.58)_100%),linear-gradient(0deg,rgba(15,20,28,0.82)_0%,rgba(15,20,28,0)_42%)] max-[720px]:min-h-[100svh] max-[720px]:flex-col max-[720px]:after:[background:linear-gradient(0deg,rgba(27,34,48,0.96)_0%,rgba(27,34,48,0.7)_55%,rgba(27,34,48,0.45)_100%)]"
      aria-labelledby={`${uid}-title`}
    >
      <BackgroundVideo
        className="absolute inset-0 h-full w-full object-cover object-center"
        poster={HERO.poster}
        hd={HERO.video.hd}
        sd={HERO.video.sd}
      />

      <div className="relative z-[3] flex w-full flex-col justify-center gap-[clamp(24px,5vh,64px)] px-jdc-gutter pb-[112px] pt-[clamp(150px,20vh,200px)] max-[720px]:flex-[1_0_auto] max-[720px]:justify-evenly max-[720px]:gap-[30px] max-[720px]:pb-[24px] max-[720px]:pt-[100px] [@media(max-width:720px)_and_(max-height:700px)]:justify-start [@media(max-width:720px)_and_(max-height:700px)]:gap-[28px] [@media(max-width:720px)_and_(max-height:700px)]:pb-[28px] [@media(max-width:720px)_and_(max-height:700px)]:pt-[92px]">
        <h1
          id={`${uid}-title`}
          className="m-0 max-w-[760px] font-display text-jdc-h1 font-extrabold uppercase leading-[1.04] tracking-[-0.02em] [overflow-wrap:break-word] [&_span]:block max-[720px]:leading-[1.1] [@media(max-width:720px)_and_(max-height:700px)]:text-[length:clamp(30px,9vw,38px)]"
        >
          {HERO.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <p className="m-0 max-w-[460px] text-[18px] leading-[1.5] text-[rgba(255,255,255,0.88)] max-[720px]:max-w-[300px] max-[720px]:text-[16px]">
          <span className={ONLY_LG}>{HERO.sub}</span>
          <span className={ONLY_SM}>{HERO.subShort}</span>
        </p>

        <div className="relative" ref={boxRef}>
          <form
            className="flex max-w-[460px] items-center rounded-jdc-pill bg-jdc-white p-[6px] [transition:box-shadow_0.2s] focus-within:[box-shadow:0_0_0_3px_var(--jdc-blue)] max-[720px]:flex-wrap max-[720px]:rounded-[18px] max-[720px]:p-[8px]"
            onSubmit={onSubmit}
            noValidate
          >
            <div className={`${FIELD} relative`}>
              <span id={`${ids.when}-label`} className={FIELD_LABEL}>
                Pickup
              </span>
              <PickupSelect id={ids.when} labelId={`${ids.when}-label`} value={pickup} options={HERO.pickupOptions} onChange={setPickup} />
            </div>
            <div
              className={`${FIELD} flex-1 border-l border-solid border-l-jdc-line max-[720px]:border-l-0 max-[720px]:border-t max-[720px]:border-t-jdc-line`}
            >
              <label htmlFor={ids.where} className={FIELD_LABEL}>
                Where
              </label>
              <input
                ref={inputRef}
                id={ids.where}
                className={`${FIELD_CONTROL} aria-[invalid=true]:text-jdc-danger`}
                type="text"
                inputMode="text"
                placeholder="Enter your postcode"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={10}
                role="combobox"
                aria-autocomplete="list"
                aria-controls={ids.list}
                aria-expanded={suggestOpen ? "true" : "false"}
                value={postcode}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? ids.error : undefined}
                onFocus={() => {
                  void ensureGuestSession();
                  if (suggestions.length) setSuggestOpen(true);
                }}
                onChange={(e) => {
                  setPostcode(e.target.value);
                  runSuggest(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && suggestOpen) {
                    e.preventDefault();
                    boxRef.current?.querySelector("[role=option]")?.focus();
                  } else if (e.key === "Escape") {
                    setSuggestOpen(false);
                  }
                }}
              />
            </div>
            <button
              className="flex h-[58px] w-[58px] flex-none cursor-pointer items-center justify-center rounded-[50%] border-0 bg-jdc-blue text-jdc-white [transition:background_0.2s] hover:bg-jdc-blue-dark max-[720px]:mt-[6px] max-[720px]:h-[46px] max-[720px]:w-full max-[720px]:rounded-[14px]"
              type="submit"
              aria-label="Check availability and book"
            >
              <Icon name="arrowRightThin" size={22} />
            </button>
          </form>
          <div className={SUGGEST_LIST} hidden={!suggestOpen}>
            <ul id={ids.list} role="listbox" aria-label="Suggested postcodes" className="m-0 list-none p-0" onKeyDown={onListKey}>
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    tabIndex={-1}
                    className={SUGGEST_ITEM}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(s)}
                  >
                    <ProtoIcon name="pin" size={16} />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p
            id={ids.error}
            className="m-[10px_0_0_22px] min-h-[1.5em] text-[14px] font-semibold text-[#ffb4ab] empty:mt-0 empty:min-h-0 max-[720px]:ml-[4px]"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[2] border-t border-solid border-t-[rgba(255,255,255,0.14)] bg-[rgba(15,20,28,0.45)] [backdrop-filter:blur(6px)] max-[720px]:relative">
        <ul className="m-0 flex list-none justify-between gap-[24px] px-jdc-gutter py-[22px] font-display text-[16px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.9)] [@media(min-width:901px)_and_(max-width:1400px)]:gap-4 [@media(min-width:901px)_and_(max-width:1400px)]:text-[clamp(11.5px,1.16vw,15px)] [@media(min-width:901px)_and_(max-width:1400px)]:tracking-[0.06em] max-[900px]:grid max-[900px]:grid-cols-[1fr_1fr] max-[900px]:gap-[14px_24px] max-[900px]:text-[14px] max-[900px]:tracking-[0.08em] max-[720px]:grid max-[720px]:grid-cols-[1fr_1fr] max-[720px]:gap-[12px_14px] max-[720px]:py-[16px] max-[720px]:text-[11.5px] max-[720px]:tracking-[0.07em]">
          {HERO.benefits.map((b) => (
            <li
              key={b.label}
              className="flex items-center gap-[10px] whitespace-nowrap [&_svg]:flex-none [&_svg]:text-jdc-blue max-[720px]:gap-[8px] max-[720px]:[&_svg]:h-[16px] max-[720px]:[&_svg]:w-[16px]"
            >
              <Icon name={b.icon} size={18} />
              <span className={ONLY_LG}>{b.label}</span>
              <span className={ONLY_SM}>{b.short}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
