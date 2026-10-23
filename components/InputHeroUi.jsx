"use client";

import { Input } from "@heroui/react";
import React from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

/*
 * Legacy text input API on HeroUI, restyled to the design system
 * (white field, 1.5px line border, blue focus ring). Props unchanged.
 * Previous version: see git history (before the 2026 redesign)
 */
export default function InputField({
  label = "Enter value...",
  type = "text",
  value,
  onChange,
  onFocus,
  onKeyDown,
  placeholder,
  name,
  disabled,
  validate,
  errorMessage,
  isInvalid,
  isDisabled,
  isRequired,
  endContent,
  classNames: customClassNames,
  min,
  max,
  step,
}) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField ? (isPasswordVisible ? "text" : "password") : type;

  const defaultClassNames = {
    label: ["font-body text-sm !text-jdc-muted group-data-[focus=true]:!text-jdc-blue"],
    input: ["bg-transparent font-body text-base !text-jdc-text", "placeholder:text-[#8a93a8]"],
    innerWrapper: ["bg-transparent", "hover:bg-transparent"],
    inputWrapper: [
      "!bg-white",
      "border-[1.5px] border-jdc-line",
      "hover:!bg-white hover:border-jdc-line-strong",
      "group-data-[focus=true]:!border-jdc-blue",
      "group-data-[focus=true]:shadow-[0_0_0_4px_rgba(2,120,254,0.14)]",
      "group-data-[invalid=true]:!border-jdc-danger",
      "shadow-none",
      "!cursor-text",
      "relative",
      "rounded-[14px]",
      "h-[58px]",
      "transition-[border-color,box-shadow]",
    ],
    errorMessage: ["font-body text-[13px] font-semibold !text-jdc-danger"],
  };

  const merge = (key) => [...(defaultClassNames[key] || []), ...(customClassNames?.[key] || [])];

  return (
    <Input
      label={label}
      type={resolvedType}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      name={name}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      validate={validate}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      isRequired={isRequired}
      autoComplete={
        type === "email" ? "email" : isPasswordField ? (name === "password" || name === "confirmPassword" ? "new-password" : "current-password") : undefined
      }
      endContent={
        isPasswordField ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            // centred on the whole field (HeroUI pins end content to the bottom when the label sits inside)
            className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-jdc-muted transition-colors hover:bg-jdc-paper hover:text-jdc-blue"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </button>
        ) : (
          endContent
        )
      }
      classNames={{
        label: merge("label"),
        input: [...merge("input"), isPasswordField && "pr-10"].filter(Boolean),
        innerWrapper: merge("innerWrapper"),
        inputWrapper: merge("inputWrapper"),
        errorMessage: merge("errorMessage"),
      }}
    />
  );
}
