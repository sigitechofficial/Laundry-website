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
const FLAG_BUTTON = "!mx-0 !my-1 !border-none !bg-transparent !pl-1.5";

export default function PhoneInputComp({ value = "", onChange, country = "gb", error }) {
  return (
    <div>
      <PhoneInput
        country={country}
        preferredCountries={["gb"]}
        enableSearch
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
