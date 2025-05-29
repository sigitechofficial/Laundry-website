"use client"
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api'; // RTK Query service
import cartItemSlice from './slices/cartItemSlice'; // your custom slice

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    cart: cartItemSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);
