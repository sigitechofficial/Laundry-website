"use client";

import { Input } from "@heroui/react";
import React from "react";

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
}) {
  const isActive = value?.length > 0;
  const defaultClassNames = {
    label: [
      "group-data-[focus=true]:text-gray-500 text-sm text-gray-400",
    ],
    input: ["bg-transparent text-lg", "dark:hover:bg-transparent"],
    innerWrapper: [
      "bg-transparent",
      "hover:bg-transparent",
      "dark:hover:bg-transparent",
    ],
    inputWrapper: [
      "border-0",
      !isActive ? "bg-[#E8E7E3]" : "bg-white border-[#000099] border-2",
      "group-data-[focus=true]:border-[#000099] border-2",
      "group-data-[focus=true]:!bg-white",
      "dark:border-gray-400",
      "dark:hover:border-theme-green-2",
      "shadow-none",
      // "backdrop-blur-xl",
      // "backdrop-saturate-0",
      "!cursor-text",
      "hover:!bg-[#E8E7E3]",
      "rounded-[8px]",
      "h-[60px]",
    ],
  };

  // Merge custom classNames with defaults
  const mergedClassNames = {
    label: [...(defaultClassNames.label || []), ...(customClassNames?.label || [])],
    input: [...(defaultClassNames.input || []), ...(customClassNames?.input || [])],
    innerWrapper: [...(defaultClassNames.innerWrapper || []), ...(customClassNames?.innerWrapper || [])],
    inputWrapper: [...(defaultClassNames.inputWrapper || []), ...(customClassNames?.inputWrapper || [])],
  };

  return (
    <Input
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
      validate={validate}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      isRequired={isRequired}
      endContent={endContent}
      classNames={mergedClassNames}
    />
  );
}
