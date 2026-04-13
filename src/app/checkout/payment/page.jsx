"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { ButtonYouth70018, PurpleButton } from "../../../../components/Buttons";
import {
  IoBagCheck,
  IoLocation,
  IoShirt,
  IoWalletOutline,
  IoCardOutline,
  IoHandLeftOutline,
} from "react-icons/io5";
import {
  useCreateBookingMutation,
  useGetActivePoliciesQuery,
  useGetChargesQuery,
  useRescheduleBookingMutation,
  useGetServicesQuery,
} from "@/app/store/services/api";
import { addToast, Spinner, useDisclosure } from "@heroui/react";
import ReusableModal from "../../../../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  setDriverInstruction,
  setDriverTip,
  setFrequency,
  updatePreference,
  clearCartData,
} from "@/app/store/slices/cartItemSlice";
import { FaTruck } from "react-icons/fa6";
import { formatDate, to24Hour } from "../../../../utilities/ConversionFunction";
import FAQs from "../../../../components/FAQs";
import Footer from "../../../../components/Footer";
import InputField from "../../../../components/InputHeroUi";
import { FaRegEdit } from "react-icons/fa";
import StripeCheckout from "../../../../utilities/StripeCheckout";
import { useRouter } from "next/navigation";

export default function Payment() {
  const dispatch = useDispatch();
  const router = useRouter();
  const orderData = useSelector((state) => state.cart.orderData);
  const preferencesData = useSelector((state) => state.cart.preferences);
  const isRescheduleFlow = Boolean(orderData?.rescheduleData?.isReschedule);
  const rescheduleTriggeredRef = useRef(false);
  const clientTimeZone =
    Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
  const [createBooking] = useCreateBookingMutation();
  const [rescheduleBooking] = useRescheduleBookingMutation();
  const customerId =
    typeof window !== "undefined" && localStorage.getItem("stripeCustomerId");
  const { data, isLoading } = useGetServicesQuery();
  const { data: addressData } = useGetChargesQuery(
    {
      lat: orderData?.collectionData?.lat,
      lng: orderData?.collectionData?.lng,
    },
    {
      skip: !orderData?.collectionData?.lat || !orderData?.collectionData?.lng,
    }
  );
  const zoneId = addressData?.data?.zoneId;
  const { data: activePoliciesData } = useGetActivePoliciesQuery(zoneId, {
    skip: zoneId == null,
  });
  const serviceTimeZone =
    addressData?.data?.zone?.timeZone ||
    addressData?.data?.zoneTimeZone ||
    orderData?.rescheduleData?.timeZone ||
    orderData?.collectionData?.timeZone ||
    orderData?.timeZone ||
    clientTimeZone;

  const currencySymbol = addressData?.data?.currency?.symbol ?? "$";

  // Example: Get all charge values (replace with your real data)
  const minimumOrderCharge =
    parseFloat(addressData?.data?.zoneUpfrontAmount) || 0;
  const serviceFee = parseFloat(addressData?.data?.zoneSeviceCharge) || 0;
  const driverTip = parseFloat(orderData?.driverTip) || 0;
  const collectionDelivery = 0; // Free

  // Add more fields as needed
  const charges = [
    { label: "Minimum order charge", value: minimumOrderCharge },
    { label: "Service fee", value: serviceFee },
    { label: "Driver Tip", value: driverTip },
    { label: "Collection & delivery", value: collectionDelivery },
    // Add more here as needed
  ];

  // Calculate total using useMemo for performance
  const totalAmount = useMemo(
    () => charges.reduce((sum, item) => sum + item.value, 0),
    [charges]
  );
  const policyContent = useMemo(() => {
    const policies = activePoliciesData?.data || {};
    const cancellationConfig =
      policies?.activeCancellationPolicy?.cancellationConfig;
    const rescheduleConfig = policies?.activeReschedulePolicy?.rescheduleConfig;
    const noShowConfig = policies?.activeNoShowPolicy?.noShowPolicyConfig;

    const formatWindow = (minutes) => {
      const mins = Number(minutes);
      if (!Number.isFinite(mins) || mins <= 0) return null;
      if (mins % 60 === 0) {
        const hours = mins / 60;
        return `${hours} hour${hours === 1 ? "" : "s"}`;
      }
      return `${mins} minute${mins === 1 ? "" : "s"}`;
    };

    const formatMoney = (currency, amount) => {
      const value = Number.parseFloat(amount);
      if (!Number.isFinite(value)) return null;
      return `${currency || ""} ${value.toFixed(2)}`.trim();
    };

    const formatPercent = (value) => {
      const num = Number.parseFloat(value);
      if (!Number.isFinite(num) || num <= 0) return null;
      return `${num}%`;
    };

    const cancellationWindow = formatWindow(
      cancellationConfig?.prePickupFreeChargeWindowMinutes
    );
    const cancellationFee =
      formatMoney(
        cancellationConfig?.prePickupAbsoluteCurrency,
        cancellationConfig?.prePickupAbsoluteAmount
      ) ||
      (formatPercent(cancellationConfig?.prePickupPercentage)
        ? `${formatPercent(cancellationConfig?.prePickupPercentage)} of order value`
        : null);

    const pickupRescheduleFee =
      formatMoney(
        rescheduleConfig?.atPickupAbsoluteCurrency,
        rescheduleConfig?.atPickupAbsoluteAmount
      ) ||
      (formatPercent(rescheduleConfig?.atPickupPercentage)
        ? `${formatPercent(rescheduleConfig?.atPickupPercentage)}`
        : null);

    const deliveryRescheduleFee =
      formatMoney(
        rescheduleConfig?.atDeliveryAbsoluteCurrency,
        rescheduleConfig?.atDeliveryAbsoluteAmount
      ) ||
      (formatPercent(rescheduleConfig?.atDeliveryPercentage)
        ? `${formatPercent(rescheduleConfig?.atDeliveryPercentage)}`
        : null);

    const noShowFee = noShowConfig?.useUnifiedFee
      ? formatMoney(noShowConfig?.currency, noShowConfig?.pickupNoShowFee)
      : null;
    const pickupNoShowFee = formatMoney(
      noShowConfig?.currency,
      noShowConfig?.pickupNoShowFee
    );
    const deliveryNoShowFee = formatMoney(
      noShowConfig?.currency,
      noShowConfig?.deliveryNoShowFee
    );
    const graceMinutes = Number(noShowConfig?.graceMinutesOnSite);
    const graceText =
      Number.isFinite(graceMinutes) && graceMinutes > 0
        ? `${graceMinutes} minute${graceMinutes === 1 ? "" : "s"}`
        : null;
    const storagePerDay = formatMoney(
      noShowConfig?.currency,
      noShowConfig?.storageFeePerDay
    );

    const hasAnyPolicy =
      Boolean(cancellationConfig) ||
      Boolean(rescheduleConfig) ||
      Boolean(noShowConfig);

    return {
      hasAnyPolicy,
      activeNames: [
        policies?.activeCancellationPolicy?.name ? "Cancellation" : null,
        policies?.activeReschedulePolicy?.name ? "Reschedule" : null,
        policies?.activeNoShowPolicy?.name ? "No-show" : null,
      ].filter(Boolean),
      cancellationLine1: cancellationWindow
        ? `Cancel at least ${cancellationWindow} before pickup to avoid extra charges.`
        : "This policy has no free cancellation window before pickup.",
      cancellationLine2: cancellationFee
        ? `Late cancellation fee: ${cancellationFee}.`
        : "Late cancellations may still be charged based on order status.",
      rescheduleLine1:
        "Reschedule before dispatch to avoid additional charges.",
      rescheduleLine2: `After dispatch, reschedule fee is ${pickupRescheduleFee || "policy-based"} at pickup and ${deliveryRescheduleFee || "policy-based"} at delivery.`,
      noShowLine: noShowConfig?.useUnifiedFee
        ? `No-show fee: ${noShowFee || "policy-based"}${graceText ? ` after a ${graceText} grace period` : ""}.${storagePerDay ? ` Storage fee: ${storagePerDay} per day.` : ""}`
        : `No-show fee: pickup ${pickupNoShowFee || "policy-based"}, delivery ${deliveryNoShowFee || "policy-based"}${graceText ? `, with a ${graceText} grace period` : ""}.${storagePerDay ? ` Storage fee: ${storagePerDay} per day.` : ""}`,
    };
  }, [activePoliciesData]);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll, setModalScroll] = useState(false);
  const [modal, setModal] = useState({
    modType: "wash",
    page: "stripe",
  });

  const handleModalScroll = (e) => { };

  const handleCreateBooking = async (payData) => {
    try {
      const flattenedPreferences =
        preferencesData
          ?.filter(
            (item) => item?.preferencesArray && Array.isArray(item.preferencesArray)
          )
          ?.flatMap((item) => item.preferencesArray) || [];

      const fallbackRescheduleServices =
        preferencesData
          ?.filter((item) => item?.serviceId)
          ?.map((item) => ({
            serviceId: Number(item.serviceId),
            categoryId: item?.categoryId ? Number(item.categoryId) : null,
            subCategoryId: item?.subCategoryId ? Number(item.subCategoryId) : null,
            categoryCharge: Number.parseFloat(item?.categoryprice) || 0,
          })) || [];

      const rescheduleServices = Array.isArray(orderData?.rescheduleData?.services)
        ? orderData.rescheduleData.services
        : fallbackRescheduleServices;

      const bookingData = {
        collectionDate: orderData?.collectionData?.collectionDate,
        collectionTimeTo: to24Hour(orderData?.collectionData?.collectionTimeTo),
        collectionTimeFrom: to24Hour(
          orderData?.collectionData?.collectionTimeFrom
        ),
        driverInstruction: orderData?.driverInstruction,
        frequency: orderData?.frequency,
        deliveryDate: orderData?.deliveryData?.deliveryDate,
        deliveryTimeTo: to24Hour(orderData?.deliveryData?.deliveryTimeTo),
        deliveryTimeFrom: to24Hour(orderData?.deliveryData?.deliveryTimeFrom),
        addressId: "",
        driverInstructionOptions:
          orderData?.collectionData?.driverInstructionOptions,
        pickUpAddress: {
          title: "Home", //'Office','Home','Other','Hotel'
          hotelName: null,
          apartmentNumber: null,
          floor: null,
          streetAddress: orderData?.collectionData?.streetAddress,
          district: orderData?.collectionData?.district,
          city: orderData?.collectionData?.city,
          province: orderData?.collectionData?.province,
          country: orderData?.collectionData?.country,
          postalCode: orderData?.collectionData?.postalCode,
          lat: orderData?.collectionData?.lat,
          lng: orderData?.collectionData?.lng,
          radius: orderData?.collectionData?.radius,
          addressType: orderData?.collectionData?.addressType || "pickUp",
          save: true,
        },
        // dropOffAddress: {
        //   title: "Office", //'Office','Home','Other','Hotel'
        //   hotelName: null,
        //   apartmentNumber: null,
        //   floor: null,
        //   streetAddress: "456 Business Road",
        //   district: "DHA",
        //   city: "Lahore",
        //   province: "Punjab",
        //   country: "Pakistan",
        //   postalCode: "54001",
        //   lat: 31.5404,
        //   lng: 74.3687,
        //   radius: null,
        //   addressType: "dropOff",
        // },
        driverInstructionOptions1:
          orderData?.deliveryData?.driverInstructionOptions1,
        addNewAddress: true,
        addNewDropOffAddress: false,
        dropOffSamePickUp: true,
        dropOffAddressId: null,
        pickUpAddressId: null,
        preferencesArray: flattenedPreferences,
        services: preferencesData
          ?.filter((item) => item?.serviceId)
          ?.map((item) => ({ serviceId: item.serviceId })),
        totalItems: 5,
        tipAmount: Number.isFinite(driverTip) ? driverTip : 0,
        timeZone: serviceTimeZone,
        clientTimeZone,
        paymentIntentId: payData?.paymentIntentId ?? null,
        setupIntentId: payData?.setupIntentId ?? null,
        paymentMethodId: payData?.paymentMethodId,
        stripeCustomerId: localStorage.getItem("stripeCustomerId"),
      };

      const finalPayload = isRescheduleFlow
        ? {
            bookingId: Number(orderData?.rescheduleData?.bookingId),
            collectionDate: orderData?.collectionData?.collectionDate,
            collectionTimeFrom: to24Hour(orderData?.collectionData?.collectionTimeFrom),
            collectionTimeTo: to24Hour(orderData?.collectionData?.collectionTimeTo),
            deliveryDate: orderData?.deliveryData?.deliveryDate,
            deliveryTimeFrom: to24Hour(orderData?.deliveryData?.deliveryTimeFrom),
            deliveryTimeTo: to24Hour(orderData?.deliveryData?.deliveryTimeTo),
            timeZone: serviceTimeZone,
            clientTimeZone,
            reasonText:
              orderData?.rescheduleData?.reasonText?.trim() ||
              "My plans changed",
            services: rescheduleServices,
            preferencesArray: flattenedPreferences,
          }
        : bookingData;

      const response = await (isRescheduleFlow
        ? rescheduleBooking(finalPayload)
        : createBooking(finalPayload)
      ).unwrap();
      if (response?.status === "1") {
        // Clear all cart data (address, preferences, etc.)
        dispatch(clearCartData());

        // Capture booking/payment IDs from response when backend returns them
        const bookingId = response?.data?.bookingId ?? response?.data?.booking_id;
        const paymentId = response?.data?.paymentId ?? response?.data?.payment_id ?? response?.data?.bookingPaymentId;

        const description = [
          response?.message,
          bookingId && `Booking ID: ${bookingId}`,
          paymentId && `Payment ID: ${paymentId}`,
        ]
          .filter(Boolean)
          .join(" • ");

        addToast({
          title: isRescheduleFlow ? "Reschedule Booking" : "Create Booking",
          description,
          color: "success",
        });

        router.replace("/");
      } else {
        const errorMsg = response?.error ?? response?.message ?? "Booking failed. Please try again.";
        addToast({
          title: isRescheduleFlow ? "Reschedule Booking" : "Create Booking",
          description: errorMsg,
          color: "danger",
        });
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err?.data?.error ??
        err?.data?.message ??
        err?.message ??
        "Something went wrong. Please try again.";
      addToast({
        title: isRescheduleFlow ? "Reschedule Booking" : "Create Booking",
        description: errorMsg,
        color: "danger",
      });
      throw err instanceof Error ? err : new Error(errorMsg);
    }
  };

  useEffect(() => {
    if (!isRescheduleFlow || rescheduleTriggeredRef.current) return;
    rescheduleTriggeredRef.current = true;
    handleCreateBooking({});
  }, [isRescheduleFlow]);

  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="order" />
        </div>

        <div className="w-full px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto pt-32 lg:pb-[50px] 2xl:py-[70px]">
            <h4 className="font-bold font-youth text-3xl 2xl:text-6xl">
              Add a payment method
            </h4>

            <div className="flex flex-col lg:flex-row gap-10 2xl:gap-20 pt-10">
              {/* PAYMENT - Stripe sheet only */}
              {isRescheduleFlow ? (
                <div className="w-full rounded-2xl border border-theme-gray overflow-hidden bg-white shadow-theme-shadow-light p-6 space-y-4">
                  <h4 className="font-sf font-bold text-base sm:text-lg text-black">
                    Rescheduling your booking
                  </h4>
                  <div className="flex items-center gap-3 text-theme-psGray">
                    <Spinner size="sm" />
                    <p className="font-sf text-sm sm:text-base">
                      Please wait while we submit your reschedule request...
                    </p>
                  </div>
                </div>
              ) : modal?.page === "stripe" ? (
                <div className="w-full space-y-6">
                  <StripeCheckout
                    paymentMethod={modal?.paymentMethod}
                    setModal={setModal}
                    modal={modal}
                    booking={handleCreateBooking}
                    totalAmount={totalAmount}
                    onOpen={onOpen}
                    customerId={customerId}
                  />
                  {/* How much do I pay? - policy box */}
                  <div className="w-full rounded-2xl border border-theme-gray overflow-hidden bg-white shadow-theme-shadow-light">
                    <div className="bg-theme-gray px-4 py-3">
                      <h4 className="font-sf font-bold text-base sm:text-lg text-black">
                        How much do I pay?
                      </h4>
                    </div>
                    <div className="px-4 py-4 space-y-4 font-sf text-sm sm:text-base text-black">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 mt-0.5 text-theme-gray-3">
                          <IoHandLeftOutline className="size-5" />
                        </span>
                        <p>You&apos;ll pay nothing when placing the order.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 mt-0.5 text-theme-gray-3">
                          <IoWalletOutline className="size-5" />
                        </span>
                        <p>Our local cleaning partner will check your bags and issue an itemised online receipt.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 mt-0.5 text-theme-gray-3">
                          <IoCardOutline className="size-5" />
                        </span>
                        <p>
                          You&apos;ll pay the order total after we clean your items. Service fee {currencySymbol}
                          {parseFloat(addressData?.data?.zoneSeviceCharge)?.toFixed(2) ?? "2.99"}, minimum order {currencySymbol}
                          {parseFloat(addressData?.data?.zoneUpfrontAmount)?.toFixed(2) ?? "20"}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">Thanks for payement</div>
              )}
              {/* Order */}

              <div className="lg:w-[600px] space-y-8">
                {/* ///////////////Order summary///////////// */}

                <div className="px-4 py-4 shadow-theme-shadow-light rounded-[20px] space-y-5">
                  <div className="flex items-center justify-center gap-x-3 my-2">
                    <p className="font-sf font-semibold">Order summary</p>
                  </div>

                  <InputField label="Enter Promo Code" />

                  <h4 className="font-sf font-semibold">Frequency</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-4">
                    <div
                      onClick={() => dispatch(setFrequency("Just once"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${orderData?.frequency === "Just once"
                        ? "bg-theme-blue text-white"
                        : ""
                        }`}
                    >
                      Just once
                    </div>
                    <div
                      onClick={() => dispatch(setFrequency("Weekly"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${orderData?.frequency === "Weekly"
                        ? "bg-theme-blue text-white"
                        : ""
                        }`}
                    >
                      Weekly
                    </div>
                    <div
                      onClick={() => dispatch(setFrequency("Every Two Weeks"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${orderData?.frequency === "Every Two Weeks"
                        ? "bg-theme-blue text-white"
                        : ""
                        }`}
                    >
                      Every Two Weeks
                    </div>
                    <div
                      onClick={() => dispatch(setFrequency("Every Four Weeks"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${orderData?.frequency === "Every Four Weeks"
                        ? "bg-theme-blue text-white"
                        : ""
                        }`}
                    >
                      Every Four Weeks
                    </div>
                  </div>

                  <h4 className="font-sf font-semibold">Add Driver Tip</h4>

                  <p className="font-sf text-theme-psGray text-sm">
                    Your tip is paid out directly to the courier with their
                    salary. To change or remove your tip. contact support.
                  </p>

                  <div className="flex items-center justify-around gap-2 [&>div]:flex [&>div]:items-center [&>div]:justify-center [&>div]:cursor-pointer [&>div]:rounded-full [&>div]:border-2 [&>div]:border-theme-gray [&>div]:px-4 [&>div]:h-8">
                    <div
                      className={
                        orderData?.driverTip === 0
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(0))}
                    >
                      {currencySymbol}0
                    </div>
                    <div
                      className={
                        orderData?.driverTip === 1
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(1))}
                    >
                      {currencySymbol}1
                    </div>
                    <div
                      className={
                        orderData?.driverTip === 2
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(2))}
                    >
                      {currencySymbol}2
                    </div>
                    <div
                      className={
                        orderData?.driverTip === 5
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(5))}
                    >
                      {currencySymbol}5
                    </div>
                    <div
                      onClick={() => {
                        setModal({ ...modal, modType: "customTip" });
                        onOpen();
                      }}
                      className={
                        ![0, 1, 2, 5].includes(orderData.driverTip)
                          ? "bg-theme-blue text-white"
                          : " text-gray-400"
                      }
                    >
                      <FaRegEdit size={15} />
                    </div>
                  </div>

                  <h4 className="font-sf font-semibold text-theme-blue">
                    How charges work?
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h4 className="font-youth font-bold">
                        Pay now (incl. tax)
                      </h4>
                      <h4 className="font-youth font-bold">
                        {currencySymbol}{totalAmount?.toFixed(2)}
                      </h4>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Minimum order charge</h4>
                      <p className="">
                        {currencySymbol}
                        {parseFloat(
                          addressData?.data?.zoneUpfrontAmount
                        )?.toFixed(2) ?? "0.00"}
                      </p>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Service fee</h4>
                      <p className="">
                        {currencySymbol}
                        {parseFloat(
                          addressData?.data?.zoneSeviceCharge
                        )?.toFixed(2) ?? "0.00"}
                      </p>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Driver Tip</h4>
                      <p className="">
                        {currencySymbol}{parseFloat(orderData?.driverTip)?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Collection & delivery</h4>
                      <p className="">Free</p>
                    </div>
                  </div>

                  {policyContent?.hasAnyPolicy && (
                    <div className="pt-3 space-y-4">
                      <div>
                        <h4 className="font-youth font-bold text-2xl">
                          Laundry Policies
                        </h4>
                        {policyContent.activeNames?.length > 0 && (
                          <p className="font-sf text-sm text-theme-psGray mt-1">
                            Active policies: {policyContent.activeNames.join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="font-sf text-theme-psGray space-y-3">
                        <p className="text-sm leading-6">
                          {policyContent.cancellationLine1}
                          <br />
                          {policyContent.cancellationLine2}
                        </p>
                        <p className="text-sm leading-6">
                          {policyContent.rescheduleLine1}
                          <br />
                          {policyContent.rescheduleLine2}
                        </p>
                        <p className="text-sm leading-6">
                          {policyContent.noShowLine}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ///////////////Order details///////////// */}

                <div className="px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
                  <div className="flex items-center gap-x-3 my-2">
                    <FaTruck size={20} />

                    <p className="font-sf font-semibold">Pickup</p>
                  </div>

                  <div className="space-y-4">
                    <div className="font-sf space-y-3">
                      <p className="text-theme-psGray">Scheduled for</p>
                      <p className="text-theme-psGray">Collection</p>
                      <div className="flex gap-4 items-center">
                        <div>
                          <IoLocation size="20" />
                        </div>

                        <p className="text-sm font-medium">
                          {formatDate(
                            orderData?.collectionData?.collectionDate
                          )}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div>
                          <IoLocation size="20" />
                        </div>

                        <p className="text-sm font-medium">
                          {to24Hour(
                            orderData?.collectionData?.collectionTimeFrom
                          )}{" "}
                          -{" "}
                          {to24Hour(
                            orderData?.collectionData?.collectionTimeTo
                          )}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div>
                          <IoLocation size="20" />
                        </div>

                        <p className="text-sm font-medium">
                          {orderData?.collectionData?.driverInstructionOptions}
                        </p>
                      </div>
                    </div>
                    <div className="font-sf space-y-3">
                      <p className="text-theme-psGray">Delivery</p>
                      <div className="flex gap-4 items-center">
                        <div>
                          <IoLocation size="20" />
                        </div>

                        <p className="text-sm font-medium">
                          {formatDate(orderData?.deliveryData?.deliveryDate)}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div>
                          <IoLocation size="20" />
                        </div>

                        <p className="text-sm font-medium">
                          {to24Hour(orderData?.deliveryData?.deliveryTimeFrom)}{" "}
                          - {to24Hour(orderData?.deliveryData?.deliveryTimeTo)}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div>
                          <IoLocation size="20" />
                        </div>

                        <p className="text-sm font-medium">
                          {orderData?.deliveryData?.driverInstructionOptions1}
                        </p>
                      </div>
                    </div>
                    <div className="font-sf space-y-3">
                      <p className="text-theme-psGray">Address</p>

                      <div className="flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoBagCheck />
                          </div>

                          <p className="text-sm font-medium line-clamp-1">
                            {orderData?.collectionData?.streetAddress}
                          </p>
                        </div>

                        <p
                          onClick={() => {
                            router.push("/place-order");
                          }}
                          className="uppercase cursor-pointer text-theme-blue font-sf font-normal px-2 py-1 border border-black rounded-full shrink-0 text-sm"
                        >
                          Modify
                        </p>
                      </div>
                    </div>
                    <div className="font-sf space-y-3">
                      <p className="text-theme-psGray">Driver instructions</p>

                      <div className="flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoBagCheck />
                          </div>

                          <p className="text-sm font-medium line-clamp-1">
                            {orderData?.driverInstruction}
                          </p>
                        </div>

                        <p
                          onClick={() => {
                            setModal({
                              ...modal,
                              modType: "driverInstructions",
                            });
                            onOpen();
                          }}
                          className="text-white font-sf font-normal px-3 capitalize py-1 cursor-pointer bg-black rounded-full shrink-0 text-sm"
                        >
                          add
                        </p>
                      </div>
                    </div>
                    <div className="font-sf space-y-3">
                      <p className="text-theme-psGray">Collection Method</p>

                      <p className="text-sm font-medium font-sf">
                        {orderData?.collectionData?.driverInstructionOptions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*FAQs section  */}

        <div className="w-full px-5 sm:px-[45px]">
          <FAQs />
        </div>

        {/*footer section  */}
        <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        showHeader={true}
        headerTitle={
          ["wash", "iron", "dry cleaning"].includes(modal.modType)
            ? "Service Preferences"
            : ""
        }
        modalScroll={modalScroll}
        onBack={false}
        onClose={false}
        showFooter={modal.modType === "success" ? false : true}
        footerContent={
          modal.modType === "customTip" ? (
            <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
              <ButtonYouth70018
                text="Done"
                onClick={() => {
                  setModal({ ...modal, modType: "" });
                  onClose();
                }}
              />
            </div>
          ) : (
            <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
              <ButtonYouth70018
                text="continue"
                onClick={() => {
                  setModal({ ...modal, modType: "" });
                  onClose();
                }}
              />
            </div>
          )
        }
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class max-h-[90vh] overflow-auto"
      >
        {modal?.modType === "wash" ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Service Preferences
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6 font-sf">
              <div className="pt-3">
                <p className="font-sf text-lg pb-3">
                  Additional Service instructions
                </p>

                <textarea
                  className="w-full h-40 bg-theme-gray rounded-lg p-5 text-base text-theme-gray-2 resize-none outline-none"
                  type="text"
                  name=""
                  id=""
                  placeholder="Enter your instructions"
                />

                <p className="font-sf pb-5 text-sm text-theme-psGray">
                  The user is responsible if the clothes color bleeds due to the
                  selected wash settings and temperature.
                </p>
              </div>
            </div>
          </div>
        ) : modal?.modType === "iron" ? (
          <div className="modal-scroll overflow-auto">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Service Preferences
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6 font-sf">
              <div className="space-y-2">
                <p className="font-sf text-lg">After ironing:</p>
                <div className="grid grid-cols-2 h-[53px]">
                  <div
                    className={`flex justify-center items-center cursor-pointer ${true === "hung"
                      ? "bg-theme-blue text-white"
                      : "bg-theme-gray"
                      }`}
                  >
                    Hung
                  </div>
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        ironingAfter: "folded",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${preferences.ironingAfter === "folded"
                      ? "bg-theme-blue text-white"
                      : "bg-theme-gray"
                      }`}
                  >
                    Folded
                  </div>
                </div>

                <p className="font-sf text-lg">Choose Iron Temperature</p>
                <div className="grid grid-cols-4 h-[53px]">
                  {["30 C", "40 C", "50 C", "60 C"].map((temp) => (
                    <div
                      key={temp}
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          ironingTemperature: temp,
                        }))
                      }
                      className={`flex justify-center items-center cursor-pointer ${preferences.ironingTemperature === temp
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                        }`}
                    >
                      {temp}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <p className="font-sf text-lg pb-3">
                  Additional Service instructions
                </p>

                <textarea
                  className="w-full h-40 bg-theme-gray rounded-lg p-5 text-base text-theme-gray-2 resize-none outline-none"
                  type="text"
                  name=""
                  id=""
                  placeholder="Enter your instructions"
                  value={preferences.additionalInstructionsIroning}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      additionalInstructionsIroning: e.target.value,
                    }))
                  }
                />

                <p className="font-sf pb-5 text-sm text-theme-psGray">
                  The user is responsible if the clothes color bleeds due to the
                  selected wash settings and temperature.
                </p>
              </div>
            </div>
          </div>
        ) : modal.modType === "dry cleaning" ? (
          "Dry cleaning preferences will be added soon."
        ) : modal.modType === "customTip" ? (
          <div className="w-full px-7 py-6 flex flex-col items-center">
            <h4 className="font-youth font-bold text-xl mb-4">
              Add Custom Tip
            </h4>

            <InputField
              type="number"
              label="Enter tip amount"
              className="w-full border border-theme-gray rounded px-4 py-2 text-center mb-4"
              value={orderData?.driverTip === 0 || orderData?.driverTip ? String(orderData.driverTip) : ""}
              min={0}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  dispatch(setDriverTip(0));
                  return;
                }
                const value = Number(raw);
                if (!Number.isFinite(value)) return;
                dispatch(setDriverTip(Math.max(0, value)));
              }}
            />
          </div>
        ) : modal.modType === "driverInstructions" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Driver instruction
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6">
              <div className="">
                <p className="font-sf text-lg pb-5">
                  Add instructions for the driver
                </p>

                <textarea
                  className="w-full h-40 bg-theme-gray rounded-lg p-5 text-base text-theme-gray-2 resize-none outline-none"
                  type="text"
                  name=""
                  id=""
                  value={orderData?.driverInstruction}
                  onChange={(e) => {
                    dispatch(setDriverInstruction(e.target.value));
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-5 flex flex-col items-center">
            <div className="w-32 mx-auto mt-7 space-y-5">
              <img src="/images/check-green.gif" alt="cehck" />
              <h6 className="font-sf font-bold text-2xl">Thank you</h6>
            </div>
            <p className="text-center font-sf font-medium text-xl py-8 px-8">
              We truly appreciate your trust in us to take care of your laundry
              needs.
            </p>
          </div>
        )}
      </ReusableModal>
    </>
  );
}
