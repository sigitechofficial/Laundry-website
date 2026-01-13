"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../../../utilities/URL";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // Get access token from localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Profile'], // Define cache tags
  endpoints: (builder) => ({
    userLogin: builder.mutation({
      query: (body) => ({
        url: "customer/loginUser",
        method: "POST",
        body,
      }),
      invalidatesTags: ['Profile'], // Invalidate profile cache on login
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
      query: (userId) => ({
        url: `customer/getUserProfile`,
        method: "GET",
      }),
      keepUnusedDataFor: 0, // Don't cache unused data
      providesTags: ['Profile'], // Tag for cache invalidation
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
    getServiceById: builder.query({
      query: (id) => ({
        url: `customer/serviceDetail/${id}`,
        method: "GET",
      }),
    }),

    getServiceWithPreferenceDetails: builder.query({
      query: (serviceId) => ({
        url: `customer/getAllServiceWithPreferenceDetails/${serviceId}`,
        method: "GET",
      }),
    }),

    createBooking: builder.mutation({
      query: (body) => ({
        url: "customer/createBooking",
        method: "POST",
        body,
      }),
    }),
    getAllAddress: builder.query({
      query: () => ({
        url: "customer/customerAddresses",
        method: "GET",
      }),
    }),
    getCharges: builder.query({
      query: ({ lat, lng }) => ({
        url: `customer/fetchZoneAndCharges?lat=31.486481351267308&lng=74.21796094626188`,
        method: "GET",
      }),
    }),
    getAllOrders: builder.query({
      query: () => ({
        url: "customer/allBookings",
        method: "GET",
      }),
    }),

    bookingDetailById: builder.query({
      query: (id) => ({
        url: `customer/bookingDetailsById?bookingId=${id}`,
        method: "GET",
      }),
    }),
    getOnHoldBookings: builder.query({
      query: () => ({
        url: `/customer/getOnHoldBookingsForCustomer`,
        method: "GET",
      }),
    }),

    getOnHoldBookingById: builder.query({
      query: (id) => ({
        url: `customer/getOnHoldBookings/${id}`,
        method: "GET",
      }),
    }),
    updateOnHoldBooking: builder.mutation({
      query: (body) => ({
        url: `customer/updateCustomerResponseForOnHoldBooking`,
        method: "PATCH",
        body,
      }),
    }),

    createIntent: builder.mutation({
      query: (body) => ({
        url: "customer/createIntentUsingStripe",
        method: "POST",
        body,
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
  useGetServiceByIdQuery,
  useGetServiceWithPreferenceDetailsQuery,
  useCreateBookingMutation,
  useGetAllAddressQuery,
  useGetChargesQuery,
  useGetAllOrdersQuery,
  useCreateIntentMutation,
  useBookingDetailByIdQuery,
  useGetOnHoldBookingsQuery,
  useGetOnHoldBookingByIdQuery,
  useUpdateOnHoldBookingMutation,
} = api;
