"use client";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function PhoneInputComp({
  value = "",
  onChange,
  country = "pk",
  error,
}) {


  console.log(error,"errorerror")
  const [isFocused, setIsFocused] = useState(false);
const active = value?.length>0 || isFocused
  return (
    <div>
      <PhoneInput
        country={country}
        enableSearch
        value={value}
        onChange={onChange}
        inputProps={{
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        inputStyle={{
          width: "100%",
          height: "60px",
          borderRadius: "8px",
          outline: "none",
          paddingLeft: "58px",
          paddingRight: "12px",
          border: active ? "2px solid #000099" : "none",
          background: active ? "#fff" : "#E8E7E3",
        }}
        buttonStyle={{
          background: "transparent",
          border: "none",
          paddingLeft: "4px",
          margin:"4px 0",
        }}
        
      />
      <p className="text-xs text-red-500">{error??""}</p>
    </div>
  );
}
