"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
};

// OrderDataSlice.js
const OrderDataSlice = createSlice({
  name: "OrderDataSlice",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = OrderDataSlice.actions;
export default OrderDataSlice.reducer;
