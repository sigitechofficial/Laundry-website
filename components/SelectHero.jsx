"use client";

import { Select, SelectItem } from "@heroui/react";
import React from "react";

/*
 * Legacy select API on HeroUI, restyled to the design system.
 * Props unchanged. Previous version: see git history (before the 2026 redesign)
 */
export default function SelectHero({ label, list = [], onChange, value }) {
  const handleSelectionChange = (selection) => {
    if (onChange) {
      // Convert Selection Set to string value; synthetic event for compatibility
      const selectedValue = Array.from(selection)[0] || "";
      onChange({ target: { value: selectedValue }, currentTarget: { value: selectedValue } });
    }
  };

  return (
    <Select
      label={label}
      selectedKeys={value || []}
      onSelectionChange={handleSelectionChange}
      classNames={{
        label: ["font-body text-sm !text-jdc-muted group-data-[focus=true]:!text-jdc-blue"],
        value: ["font-body text-base !text-jdc-text"],
        trigger: [
          "!bg-white",
          "border-[1.5px] border-jdc-line",
          "hover:!bg-white hover:border-jdc-line-strong",
          "group-data-[focus=true]:!border-jdc-blue",
          "group-data-[open=true]:!border-jdc-blue",
          "data-[open=true]:!border-jdc-blue",
          "shadow-none",
          "!cursor-pointer",
          "rounded-[14px]",
          "h-[58px]",
        ],
        popoverContent: ["rounded-[14px] border border-jdc-line font-body"],
      }}
    >
      {list?.map((item) => (
        <SelectItem key={item.key}>{item.label}</SelectItem>
      ))}
    </Select>
  );
}
