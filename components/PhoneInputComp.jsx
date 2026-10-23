"use client";
import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { cx } from "./ds/cx";

/*
 * Phone number field, restyled to the design system. Props unchanged.
 * Defaults to the UK (the service operates in London); pass `country`
 * to override. Classes use `!` because the library's own stylesheet
 * targets `.react-tel-input .form-control` (higher specificity).
 */
const INPUT =
  "!h-[58px] !w-full !rounded-[14px] !border-[1.5px] !border-solid !border-jdc-line !bg-white !pl-[58px] !pr-3 !font-body !text-[16px] !font-normal !text-jdc-text ![box-shadow:none] [outline:none] [transition:border-color_0.2s,box-shadow_0.2s] focus:!border-jdc-blue focus:![box-shadow:0_0_0_4px_rgba(2,120,254,0.14)]";
const INPUT_ERROR = "!border-[#C0392B] focus:!border-[#C0392B]";
const FLAG_BUTTON =
  "!mx-0 !my-1 !border-none !bg-transparent !pl-1.5 [&_.selected-flag]:!rounded-[10px] [&_.selected-flag:hover]:!bg-jdc-paper [&_.selected-flag.open]:!bg-jdc-paper";

// Country list: same look as the site's other dropdowns (white panel, 1px border, slim
// scrollbar, no shadow) and above the fields below it, whose labels showed through.
const DROPDOWN = cx(
  "thin-scroll !z-[60] !m-0 !mt-1.5 !w-[340px] max-[480px]:!w-[calc(100vw-72px)] !max-h-[300px] !rounded-[14px] !border !border-solid !border-jdc-line !bg-white !p-1.5 ![box-shadow:none] !font-body",
  // rows
  "[&_.country]:!flex [&_.country]:!items-center [&_.country]:!gap-2.5 [&_.country]:!rounded-[10px] [&_.country]:!px-3 [&_.country]:!py-2.5 [&_.country]:!text-[15px] [&_.country]:!text-jdc-navy",
  "[&_.country:hover]:!bg-jdc-paper [&_.country.highlight]:!bg-[#EAF3FF] [&_.country.highlight]:!font-semibold",
  "[&_.country_.flag]:!static [&_.country_.flag]:!m-0 [&_.country_.flag]:!flex-none",
  "[&_.country-name]:!m-0 [&_.dial-code]:!ml-auto [&_.dial-code]:!text-[13.5px] [&_.dial-code]:!text-jdc-muted",
  "[&_.divider]:!mx-1 [&_.divider]:!my-1.5 [&_.divider]:!border-jdc-line [&_.no-entries-message]:!px-3 [&_.no-entries-message]:!py-2.5 [&_.no-entries-message]:!text-jdc-muted"
);
// Search box pinned at the top of the list
const SEARCH =
  "!sticky !top-0 !z-[1] !m-0 !mb-1 !flex !bg-white !p-0 !pb-1.5 [&_input]:!m-0 [&_input]:!h-[42px] [&_input]:!w-full [&_input]:!rounded-[10px] [&_input]:!border [&_input]:!border-solid [&_input]:!border-jdc-line [&_input]:!px-3 [&_input]:!font-body [&_input]:!text-[15px] [&_input]:!text-jdc-text [&_input]:[outline:none] [&_input:focus]:!border-jdc-blue";

export default function PhoneInputComp({ value = "", onChange, country = "gb", error }) {
  return (
    // own layer, so the open country list sits above the next fields' labels
    <div className="relative z-30">
      <PhoneInput
        country={country}
        preferredCountries={["gb"]}
        enableSearch
        disableSearchIcon
        searchPlaceholder="Search country or code"
        dropdownClass={DROPDOWN}
        searchClass={SEARCH}
        value={value}
        onChange={onChange}
        inputProps={{
          "aria-label": "Phone number",
          "aria-invalid": error ? true : undefined,
          autoComplete: "tel",
        }}
        inputClass={cx(INPUT, error && INPUT_ERROR)}
        buttonClass={FLAG_BUTTON}
      />
      {error ? (
        <p className="mt-1.5 font-body text-[13px] font-semibold text-jdc-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
