"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../../../utilities/URL";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    // Add timeout to prevent hanging requests
    timeout: 10000, // 10 seconds timeout
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
  tagTypes: ['Profile', 'Orders'], // Define cache tags
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
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId }], // Tag with userId for proper cache invalidation
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
        url: "customer/allServices",
        method: "GET",
      }),
    }),
    getServiceById: builder.query({
      query: (id) => ({
        url: `customer/serviceDetail/${id}`,
        method: "GET",
      }),
    }),

    getServiceDetails: builder.query({
      query: () => ({
        url: "customer/serviceDetail",
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
      invalidatesTags: ['Orders'],
    }),
    rescheduleBooking: builder.mutation({
      query: (body) => ({
        url: "customer/rescheduleBooking",
        method: "POST",
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
    getAllAddress: builder.query({
      query: () => ({
        url: "customer/customerAddresses",
        method: "GET",
      }),
    }),
    getCharges: builder.query({
      query: ({ lat, lng }) => ({
        url: `customer/fetchZoneAndCharges?lat=${lat}&lng=${lng}`,
        method: "GET",
      }),
    }),
    getAllOrders: builder.query({
      query: () => ({
        url: "customer/allBookings",
        method: "GET",
      }),
      providesTags: ['Orders'], // Tag orders for cache invalidation
    }),

    bookingDetailById: builder.query({
      query: (id) => ({
        url: `customer/bookingDetailsById?bookingId=${id}`,
        method: "GET",
      }),
    }),
    getOnHoldBookings: builder.query({
      query: () => ({
        url: "customer/getOnHoldBookingsForCustomer",
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

    getCancellationPolicies: builder.query({
      query: () => ({
        url: "admin/getCancellationPolicies?isActive=1&isDefault=1&limit=1",
        method: "GET",
      }),
    }),
    getActivePolicies: builder.query({
      query: (zoneId) => ({
        url: `admin/getActivePolicies?zoneId=${zoneId}`,
        method: "GET",
      }),
    }),
    getCustomerActivePolicies: builder.query({
      query: () => ({
        url: "customer/getActivePolicies",
        method: "GET",
      }),
    }),

    getAllReasons: builder.query({
      query: () => ({
        url: "admin/getAllReasons",
        method: "GET",
      }),
    }),

    cancelBooking: builder.mutation({
      query: (body) => ({
        url: "customer/cancelBooking",
        method: "POST",
        body,
      }),
      invalidatesTags: ['Orders'], // Invalidate orders cache after cancellation
    }),

    getAddressesByPostcode: builder.query({
      query: (postcode) => ({
        url: `customer/postcode/${postcode}`,
        method: "GET",
      }),
    }),

    getFAQs: builder.query({
      query: () => ({
        url: "admin/getAllFAQs",
        method: "GET",
      }),
    }),

    getBlogs: builder.query({
      query: () => ({
        url: "admin/getAllBlogs",
        method: "GET",
      }),
    }),

    getBlogById: builder.query({
      query: (id) => ({
        url: `admin/getBlog/${id}`,
        method: "GET",
      }),
    }),

    registerAgent: builder.mutation({
      query: (body) => ({
        url: "admin/registerAgent",
        method: "POST",
        body,
      }),
    }),

    getCountries: builder.query({
      query: () => ({
        url: "admin/getCountries",
        method: "GET",
      }),
    }),

    getCitiesByCountry: builder.query({
      query: (countryId) => ({
        url: `admin/getCities/${countryId}`,
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
  useGetServiceByIdQuery,
  useGetServiceDetailsQuery,
  useGetServiceWithPreferenceDetailsQuery,
  useCreateBookingMutation,
  useRescheduleBookingMutation,
  useGetAllAddressQuery,
  useGetChargesQuery,
  useGetAllOrdersQuery,
  useCreateIntentMutation,
  useBookingDetailByIdQuery,
  useGetOnHoldBookingsQuery,
  useGetOnHoldBookingByIdQuery,
  useUpdateOnHoldBookingMutation,
  useGetCancellationPoliciesQuery,
  useGetActivePoliciesQuery,
  useGetCustomerActivePoliciesQuery,
  useGetAllReasonsQuery,
  useCancelBookingMutation,
  useGetAddressesByPostcodeQuery,
  useLazyGetAddressesByPostcodeQuery,
  useGetFAQsQuery,
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useRegisterAgentMutation,
  useGetCountriesQuery,
  useGetCitiesByCountryQuery,
} = api;
