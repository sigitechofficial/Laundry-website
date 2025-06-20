'use client';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  page: "",
};

const cartItemSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const { increment, setPage } = cartItemSlice.actions;
export default cartItemSlice.reducer;
