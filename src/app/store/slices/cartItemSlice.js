"use client";
import { createSlice } from "@reduxjs/toolkit";

// Get persisted data from localStorage if available
const getInitialState = () => {
  let orderData = {
    collectionData: {},
    deliveryData: {},
    driverInstruction: "",
    frequency: "Just once",
    driverTip: 0,
  };
  let preferences = [];
  let page = "";

  if (typeof window !== "undefined") {
    const storedOrderData = localStorage.getItem("orderData");
    const storedPreferences = localStorage.getItem("preferences");
    const storedPage = localStorage.getItem("cartPage");

    if (storedOrderData) orderData = JSON.parse(storedOrderData);
    if (storedPreferences) preferences = JSON.parse(storedPreferences);
    if (storedPage) page = storedPage;
  }

  return {
    orderData: {
      collectionData: {
        addressType: "pickUp",
        apartmentNumber: null,
        availableTimeSlots: [],
        city: "",
        collectionDate: "",
        collectionTimeFrom: "",
        collectionTimeTo: "",
        country: "",
        district: "",
        driverInstruction: "",
        driverInstructionOptions: "Collect from the reception",
        floor: null,
        hotelName: null,
        lat: null,
        lng: null,
        postalCode: "",
        province: "",
        radius: 10,
        save: false,
        streetAddress: "",
        title: "Home",
        ...(orderData.collectionData || {}),
      },
      deliveryData: {
        deliveryDate: "",
        deliveryTimeTo: "",
        deliveryTimeFrom: "",
        driverInstructionOptions1: "",
        availableTimeSlots: [],
        title: "Home",
        hotelName: null,
        apartmentNumber: null,
        floor: null,
        streetAddress: "",
        district: "",
        city: "",
        province: "",
        country: "",
        postalCode: "",
        lat: null,
        lng: null,
        radius: 10,
        addressType: "dropOff",
        ...(orderData.deliveryData || {}),
      },
      driverInstruction: orderData?.driverInstruction || "",
      frequency: orderData?.frequency || "Just once",
      driverTip: orderData?.driverTip || 0,
    },
    preferences,
    page,
  };
};

const cartItemSlice = createSlice({
  name: "cart",
  initialState: getInitialState(),
  reducers: {
    setOrderData: (state, action) => {
      state.orderData = { ...state.orderData, ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("orderData", JSON.stringify(state.orderData));
      }
    },
    setCollectionData: (state, action) => {
      state.orderData.collectionData = {
        ...state.orderData.collectionData,
        ...action.payload,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("orderData", JSON.stringify(state.orderData));
      }
    },
    setDeliveryData: (state, action) => {
      state.orderData.deliveryData = {
        ...state.orderData.deliveryData,
        ...action.payload,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("orderData", JSON.stringify(state.orderData));
      }
    },
    setDriverInstruction: (state, action) => {
      state.orderData.driverInstruction = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("orderData", JSON.stringify(state.orderData));
      }
    },
    setFrequency: (state, action) => {
      state.orderData.frequency = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("orderData", JSON.stringify(state.orderData));
      }
    },
    setDriverTip: (state, action) => {
      state.orderData.driverTip = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("orderData", JSON.stringify(state.orderData));
      }
    },
    updatePreference: (state, action) => {
      const { serviceId, data } = action.payload;
      const existingIndex = state.preferences.findIndex(
        (item) => item.serviceId === serviceId
      );

      if (existingIndex !== -1) {
        state.preferences[existingIndex] = {
          ...state.preferences[existingIndex],
          ...data,
        };
      } else {
        state.preferences.push({ serviceId, ...data });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("preferences", JSON.stringify(state.preferences));
      }
    },

    removePreference: (state, action) => {
      const serviceId = action.payload;
      state.preferences = state.preferences.filter(
        (item) => item.serviceId !== serviceId
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("preferences", JSON.stringify(state.preferences));
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("cartPage", JSON.stringify(state.page));
      }
    },
    clearCartData: (state) => {
      // Reset to truly empty state (not from getInitialState which may have defaults)
      state.orderData = {
        collectionData: {
          addressType: "pickUp",
          apartmentNumber: null,
          availableTimeSlots: [],
          city: "",
          collectionDate: "",
          collectionTimeFrom: "",
          collectionTimeTo: "",
          country: "",
          district: "",
          driverInstruction: "",
          driverInstructionOptions: "",
          floor: null,
          hotelName: null,
          lat: null,
          lng: null,
          postalCode: "",
          province: "",
          radius: 10,
          save: false,
          streetAddress: "",
          title: "Home",
        },
        deliveryData: {
          deliveryDate: "",
          deliveryTimeTo: "",
          deliveryTimeFrom: "",
          driverInstructionOptions1: "",
          availableTimeSlots: [],
          title: "Home",
          hotelName: null,
          apartmentNumber: null,
          floor: null,
          streetAddress: "",
          district: "",
          city: "",
          province: "",
          country: "",
          postalCode: "",
          lat: null,
          lng: null,
          radius: 10,
          addressType: "dropOff",
        },
        driverInstruction: "",
        frequency: "Just once",
        driverTip: 0,
      };
      state.preferences = [];
      state.page = "";
      if (typeof window !== "undefined") {
        localStorage.removeItem("orderData");
        localStorage.removeItem("preferences");
        localStorage.removeItem("cartPage");
      }
    },
  },
});

export const {
  setOrderData,
  setCollectionData,
  setDeliveryData,
  setDriverInstruction,
  updatePreference,
  setPage,
  clearCartData,
  setFrequency,
  setDriverTip,
  removePreference,
} = cartItemSlice.actions;
export default cartItemSlice.reducer;
