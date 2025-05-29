"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://backend.fomino.ch:3041/",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (token) {
        headers.set("accessToken", token);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCountriesAndCities: builder.query({
      query: () => "users/getCountriesAndCities",
    }),
    discoveryData: builder.query({
      query: (city) => `users/home3?cityName=${city}`,
    }),
    resDetailByid: builder.query({
      query: ({ userId, resId }) =>
        `users/restaurantbyid?restaurantId=${resId}&userId=${userId}`,
    }),
    userStampsAndBanners: builder.query({
      query: ({ userId, resId }) =>
        `users/userStampsAndBannersForWeb?restaurantId=${resId}&userId=${userId}`,
    }),
    stampCardHistory: builder.query({
      query: (userId) => `users/stampCardHistory/${userId}`,
    }),
    joinStampCard: builder.mutation({
      query: (body) => ({
        url: "users/joinStampCard",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetCountriesAndCitiesQuery,
  useDiscoveryDataQuery,
  useResDetailByidQuery,
  useUserStampsAndBannersQuery,
  useStampCardHistoryQuery,
  useJoinStampCardMutation,
} = api;
