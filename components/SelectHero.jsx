"use client";

import { Select, SelectItem } from "@heroui/react";
import React from "react";

export const animals = [
  { key: "cat", label: "Cat" },
  { key: "dog", label: "Dog" },
  { key: "elephant", label: "Elephant" },
  { key: "lion", label: "Lion" },
  { key: "tiger", label: "Tiger" },
  { key: "giraffe", label: "Giraffe" },
  { key: "dolphin", label: "Dolphin" },
  { key: "penguin", label: "Penguin" },
  { key: "zebra", label: "Zebra" },
  { key: "shark", label: "Shark" },
  { key: "whale", label: "Whale" },
  { key: "otter", label: "Otter" },
  { key: "crocodile", label: "Crocodile" },
];

export default function SelectHero({label, list = [] ,onChange,value}) {
  return (
    <div className="">
      <Select
        label={label}
        onChange={onChange}
        value={value}
        classNames={{
          label: [
            "group-data-[focus=true]:text-gray-500",
            "group-data-[has-value=true]:text-gray-500",
            "text-base text-gray-400",
          ],
          trigger: [
            "border-0",
            "!bg-[#E8E7E3]",
            "group-data-[focus=true]:border-[#000099]",
            "group-data-[focus=true]:border-2",
            "group-data-[focus=true]:!bg-white",
            "group-data-[has-value=true]:!bg-white",
            "group-data-[has-value=true]:border-[#000099]",
            "group-data-[has-value=true]:border-2",
            "hover:!bg-[#E8E7E3]",
            "dark:border-gray-400",
            "dark:hover:border-theme-green-2",
            "shadow-none",
            "backdrop-blur-xl",
            "backdrop-saturate-0",
            "!cursor-pointer",
            "rounded-[8px]",
            "h-[60px]",
          ],
        }}
      >
        {list?.map((item) => (
          <SelectItem key={item.key}>{item.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
