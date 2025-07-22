"use client";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";

export function ClientBtn({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();

  let token = null;
  let orderData = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("loginStatus");
    orderData = localStorage.getItem("orderData");
  }

  const handleClick = (e) => {
    dispatch(setPage(true));

    if (!token) {
      router.push("/sign-in");
    } else if (orderData && token) {
      router.push("/checkout/order");
    } else if (token && !orderData) {
      router.push("/place-order");
    } else if (children.props.href) {
      router.push(children.props.href);
    }
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
