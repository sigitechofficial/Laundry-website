"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";
import { cx } from "./cx";

// Text input / select / textarea look. aria-invalid turns the border red.
const INPUT =
  "h-[54px] w-full appearance-none rounded-[14px] border-[1.5px] border-jdc-line bg-jdc-white px-4 text-[16px] text-jdc-text [transition:border-color_0.2s,box-shadow_0.2s] placeholder:text-[#8a93a8] focus:border-jdc-blue focus:[outline:none] focus:[box-shadow:0_0_0_4px_rgba(2,120,254,0.14)] aria-[invalid=true]:border-jdc-danger aria-[invalid=true]:focus:[box-shadow:0_0_0_4px_rgba(192,57,43,0.14)] max-[720px]:h-[50px]";
const SELECT = "bg-jdc-chevron bg-[position:right_16px_center] bg-no-repeat pr-11";
const TEXTAREA = "h-auto min-h-[130px] resize-y px-4 py-3.5 max-[720px]:h-auto";

/** White rounded panel that holds a form. */
export function FormCard({ title, intro, children, className }) {
  return (
    <div
      className={cx(
        "rounded-jdc-lg border border-jdc-line bg-jdc-white p-8 max-[720px]:rounded-[20px] max-[720px]:px-[18px] max-[720px]:py-[22px]",
        className
      )}
    >
      {title ? (
        <h2 className="m-0 font-display text-[26px] tracking-[-0.02em] text-jdc-navy max-[720px]:text-[22px]">{title}</h2>
      ) : null}
      {intro ? <p className="mb-[22px] mt-1.5 text-[16px] text-jdc-muted">{intro}</p> : null}
      {children}
    </div>
  );
}

/** Two fields side by side on wide screens. */
export function FormRow({ children }) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-4 max-[720px]:grid-cols-[1fr] max-[720px]:gap-0">{children}</div>
  );
}

/**
 * Shared label / hint / error wrapper. Wires up aria-describedby and
 * aria-invalid on the control it renders.
 */
function Field({ id: idProp, label, hint, error, icon, required, children, className }) {
  const generated = useId();
  const id = idProp ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("mb-4 grid min-w-0 gap-[7px]", className)}>
      <label htmlFor={id} className="text-[14px] font-bold text-jdc-navy">
        {label}
        {required ? (
          <span className="ml-[3px] text-jdc-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className={cx("relative", icon && "[&_input]:pl-[46px] [&_select]:pl-[46px] [&_textarea]:pl-[46px] [&_button[role=combobox]]:pl-[46px]")}>
        {icon ? (
          <span className="pointer-events-none absolute bottom-0 left-4 top-0 flex items-center text-jdc-muted">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        {children({
          id,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
          required,
        })}
      </div>
      {hint ? (
        <p id={hintId} className="m-0 text-[13px] text-jdc-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="m-0 text-[13px] font-semibold text-jdc-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const TextField = forwardRef(function TextField(
  { id, label, hint, error, icon, required, className, ...props },
  ref
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} icon={icon} required={required} className={className}>
      {(a11y) => <input ref={ref} className={INPUT} {...a11y} {...props} />}
    </Field>
  );
});

/**
 * Dropdown field with a site-styled menu (white card, blue tick on the chosen
 * option) instead of the browser's own select list. Same API as a <select>:
 * `value` + `onChange(event)` where `event.target.value` is the chosen value.
 */
export const SelectField = forwardRef(function SelectField(
  { id, label, hint, error, icon, required, options, className, value, onChange, name, disabled },
  ref
) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <Field id={id} label={label} hint={hint} error={error} icon={icon} required={required} className={className}>
      {(a11y) => (
        <SelectMenu
          ref={ref}
          a11y={a11y}
          options={opts}
          value={value}
          name={name}
          disabled={disabled}
          onChange={(v) => onChange?.({ target: { value: v, name } })}
        />
      )}
    </Field>
  );
});

const SelectMenu = forwardRef(function SelectMenu({ a11y, options, value, name, disabled, onChange }, ref) {
  const [open, setOpen] = useState(false);
  const current = Math.max(0, options.findIndex((o) => o.value === value));
  const [active, setActive] = useState(current);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const menuId = `${a11y.id}-menu`;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openMenu = () => {
    setActive(current);
    setOpen(true);
  };
  const pick = (i) => {
    onChange(options[i].value);
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
      pick(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <button
        ref={(el) => {
          btnRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-activedescendant={open ? `${menuId}-${active}` : undefined}
        disabled={disabled}
        className={cx(INPUT, SELECT, "flex cursor-pointer items-center text-left", open && "border-jdc-blue")}
        {...a11y}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">{options[current]?.label}</span>
      </button>
      <ul
        id={menuId}
        role="listbox"
        hidden={!open}
        className="thin-scroll absolute left-0 right-0 top-[calc(100%+6px)] z-30 m-0 max-h-[280px] list-none overflow-y-auto rounded-[14px] border border-jdc-line bg-white p-1.5"
      >
        {options.map((o, i) => {
          const selected = i === current;
          return (
            <li
              key={o.value}
              id={`${menuId}-${i}`}
              role="option"
              aria-selected={selected}
              className={cx(
                "flex cursor-pointer items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[15px] font-semibold text-jdc-navy",
                i === active && "bg-jdc-paper",
                selected && "text-jdc-blue"
              )}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              <span className="flex-1">{o.label}</span>
              {selected ? <Icon name="check" size={14} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export const TextAreaField = forwardRef(function TextAreaField(
  { id, label, hint, error, required, className, ...props },
  ref
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {(a11y) => <textarea ref={ref} className={cx(INPUT, TEXTAREA)} {...a11y} {...props} />}
    </Field>
  );
});

/** Small print under a form. */
export function FormNote({ icon = "clockBold", children }) {
  return (
    <p className="mb-0 mt-3.5 flex items-center gap-2 text-[13.5px] text-jdc-muted [&>svg]:flex-none [&>svg]:text-[#8A93A6]">
      <Icon name={icon} size={16} />
      <span>{children}</span>
    </p>
  );
}

/** Inline success / error banner. */
export function FormAlert({ tone = "success", children }) {
  return (
    <div
      className={cx(
        "mb-4 mt-0 flex items-start gap-2.5 rounded-xl bg-jdc-blue-tint px-3.5 py-3 text-[14.5px] font-semibold text-jdc-blue-dark [&>svg]:mt-[3px] [&>svg]:flex-none",
        tone === "error" && "bg-jdc-danger-tint text-jdc-danger"
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon name={tone === "error" ? "close" : "checkBold"} size={16} />
      <span>{children}</span>
    </div>
  );
}
