"use client"
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
};

// cartItemSlice.js
const cartItemSlice = createSlice({
  name: 'cart',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = cartItemSlice.actions;
export default cartItemSlice.reducer;

