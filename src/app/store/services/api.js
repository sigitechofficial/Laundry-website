"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://backendlaundary.fomino.ch/",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    userLogin: builder.mutation({
      query: (body) => ({
        url: "customer/loginUser",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "customer/forgetPasswordRequest",
        method: "POST",
        body,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (body) => ({
        url: "customer/verifyOTPforPassword",
        method: "POST",
        body,
      }),
    }),
    resendOTP: builder.mutation({
      query: (body) => ({
        url: "customer/resendOTP",
        method: "POST",
        body,
      }),
    }),
    changePasswordReset: builder.mutation({
      query: (body) => ({
        url: "customer/changePasswordOTP",
        method: "POST",
        body,
      }),
    }),
    registerUser: builder.mutation({
      query: (body) => ({
        url: "customer/registerCustomer",
        method: "POST",
        body,
      }),
    }),
    verifyOTPRegister: builder.mutation({
      query: (body) => ({
        url: "customer/verifyOTpSignUp",
        method: "POST",
        body,
      }),
    }),

    getProfile: builder.query({
      query: () => ({
        url: `customer/getUserProfile`,
        method: "GET",
      }),
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "customer/updateUserProfile",
        method: "PATCH",
        body,
      }),
    }),

    getServices: builder.query({
      query: () => ({
        url: "/customer/allServices",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useUserLoginMutation,
  useResetPasswordMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useChangePasswordResetMutation,
  useRegisterUserMutation,
  useVerifyOTPRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetServicesQuery,
} = api;
