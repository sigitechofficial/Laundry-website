"use client";
import { setPage } from "@/app/store/slices/cartItemSlice";
import React from "react";
import { useDispatch } from "react-redux";

export function ClientBtn({ children }) {
  const dispatch = useDispatch();

  const handleClick = (e) => {
    dispatch(setPage(true));
    // Optionally, allow the Link to handle navigation
    // If you want to prevent navigation, use e.preventDefault();
  };

  // Clone the child and add onClick
  return React.cloneElement(children, {
    onClick: (e) => {
      handleClick(e);
      if (children.props.onClick) children.props.onClick(e);
    },
  });
}
