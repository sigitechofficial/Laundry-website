"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useApplyCouponMutation,
  useCreateBookingMutation,
  useGetCustomerActivePoliciesQuery,
  useGetChargesQuery,
  useRescheduleBookingMutation,
  useGetServicesQuery,
  useGetPromotionOffersQuery,
  useGetCustomerCreditQuery,
} from "@/app/store/services/api";
import { addToast, useDisclosure } from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { setDriverTip, setFrequency, clearCartData } from "@/app/store/slices/cartItemSlice";
import { formatDate, to24Hour } from "../../../../utilities/ConversionFunction";
import PageShell from "../../../../components/ds/PageShell";
import StripeCheckout from "../../../../utilities/StripeCheckout";
import ProtoIcon from "../../../../components/proto/ProtoIcon";
import ServiceBar from "../../../../components/booking/ServiceBar";
import * as ui from "../../../../components/booking/ui";
import { cx } from "../../../../components/ds/cx";
import { lockPageScroll } from "../../../../utilities/scrollLock";
import { useFitsViewport } from "../../../../components/ds/useFitsViewport";
import { useRouter } from "next/navigation";
import BagsItemsWarningModal from "../../../../components/BagsItemsWarningModal";
import { getServicesMissingBagsOrItems } from "../../../../utilities/checkoutBagsItems";

const parseQuantityCount = (value) => {
  const parsed = parseInt(String(value ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export default function Payment() {
  const dispatch = useDispatch();
  const router = useRouter();
  const orderData = useSelector((state) => state.cart.orderData);
  const preferencesData = useSelector((state) => state.cart.preferences);
  const isRescheduleFlow = Boolean(orderData?.rescheduleData?.isReschedule);
  const rescheduleTriggeredRef = useRef(false);
  const [asideRef, asideFits] = useFitsViewport(108 + 16);
  const clientTimeZone =
    Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
  const [createBooking] = useCreateBookingMutation();
  const [rescheduleBooking] = useRescheduleBookingMutation();
  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const customerId =
    typeof window !== "undefined" && localStorage.getItem("stripeCustomerId");
  const { data } = useGetServicesQuery();
  const serviceList = data?.data?.serviceData ?? [];


  const useSharedBags = useMemo(() => {
    const serviceCount = (preferencesData || []).filter((p) => p?.serviceId)
      .length;
    return serviceCount >= 2 && orderData?.sameBagForAllServices === true;
  }, [preferencesData, orderData?.sameBagForAllServices]);

  const sharedBagCount = parseQuantityCount(orderData?.totalBags);

  const resolvedTotalBags = useMemo(() => {
    if (useSharedBags) {
      return sharedBagCount > 0 ? sharedBagCount : null;
    }
    const sum = (preferencesData || []).reduce((acc, item) => {
      const n = parseQuantityCount(item?.bagsCount);
      return acc + (n > 0 ? n : 0);
    }, 0);
    return sum > 0 ? sum : null;
  }, [useSharedBags, sharedBagCount, preferencesData]);
  const { data: addressData, refetch: refetchCharges } = useGetChargesQuery(
    {
      lat: orderData?.collectionData?.lat,
      lng: orderData?.collectionData?.lng,
    },
    {
      skip: !orderData?.collectionData?.lat || !orderData?.collectionData?.lng,
    }
  );
  const zoneId = addressData?.data?.zoneId;
  const { data: activePoliciesData } = useGetCustomerActivePoliciesQuery(zoneId, {
    skip: zoneId == null,
  });
  const promotionZoneId = addressData?.data?.zoneId ?? addressData?.data?.zone?.id;
  const { data: promotionOffersData } = useGetPromotionOffersQuery(promotionZoneId, {
    skip: promotionZoneId == null,
  });
  // Customer credit (cashback): used automatically on the invoice. Display only.
  const { data: creditData } = useGetCustomerCreditQuery();
  const creditBalance = Number.parseFloat(creditData?.data?.balance) || 0;
  // Display only: offers are applied by the shop on the final invoice, never to Pay Now.
  const promotionOffers = useMemo(
    () =>
      (Array.isArray(promotionOffersData?.data) ? promotionOffersData.data : []).filter(
        (offer) => offer && (offer.label || offer.name)
      ),
    [promotionOffersData]
  );
  const serviceTimeZone =
    orderData?.collectionData?.operationalTimeZone ||
    addressData?.data?.operationalTimeZone ||
    addressData?.data?.ianaTimeZone ||
    orderData?.rescheduleData?.timeZone ||
    orderData?.collectionData?.timeZone ||
    orderData?.timeZone ||
    clientTimeZone;

  const currencySymbol = addressData?.data?.currency?.symbol ?? "£";

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

  const couponDiscount = useMemo(() => {
    const discountAmount = Number.parseFloat(appliedCoupon?.discountAmount);
    if (Number.isFinite(discountAmount) && discountAmount >= 0) {
      return discountAmount;
    }
    return 0;
  }, [appliedCoupon]);

  // Pay Now = full prepaid. Laundry promo does not reduce Stripe hold.
  const payableTotal = useMemo(() => totalAmount, [totalAmount]);

  const handleApplyCoupon = async () => {
    const code = promoCode.trim();
    if (!code) {
      addToast({
        title: "Coupon code required",
        description: "Please enter a coupon code first.",
        color: "warning",
      });
      return;
    }

    try {
      const response = await applyCoupon({
        code,
        laundryCartAmount: 0,
        zoneId: addressData?.data?.zoneId ?? addressData?.data?.zone?.id,
      }).unwrap();

      if (String(response?.status) !== "1") {
        addToast({
          title: "Coupon not applied",
          description: response?.message || "Invalid coupon code.",
          color: "warning",
        });
        setAppliedCoupon(null);
        return;
      }

      const data = response?.data || {};
      const codeFromApi = data?.code || code;
      const deferred = Boolean(data?.minOrderDeferred) || data?.appliesAt === "invoice";
      const customerMessage =
        data?.customerMessage ||
        `${codeFromApi} saved. Discount applies on your invoice after inspection — Pay Now unchanged.`;
      setAppliedCoupon({
        code: codeFromApi,
        discountAmount: 0,
        discountType: data?.discountType,
        discountValue: data?.discountValue,
        minOrderDeferred: deferred,
        minOrderAmount: data?.minOrderAmount,
        prepaidUnchanged: true,
        customerMessage,
        offerLabel:
          typeof data?.offerLabel === "string" && data.offerLabel.trim()
            ? data.offerLabel.trim()
            : null,
      });
      addToast({
        title: "Promo saved",
        description: customerMessage,
        color: "success",
      });

      // Refresh zone/charges to keep totals in sync with backend pricing rules
      await refetchCharges();
    } catch (error) {
      setAppliedCoupon(null);
      addToast({
        title: "Coupon not applied",
        description:
          error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "Unable to apply coupon right now.",
        color: "danger",
      });
    }
  };
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
  const {
    isOpen: isBagsWarningOpen,
    onOpen: onBagsWarningOpen,
    onClose: onBagsWarningClose,
    onOpenChange: onBagsWarningOpenChange,
  } = useDisclosure();
  const skipBagsCheckRef = useRef(false);
  const proceedAfterWarningRef = useRef(null);
  const stripeSubmitRef = useRef(null);
  const [missingQuantityServices, setMissingQuantityServices] = useState([]);
  const [modal, setModal] = useState({
    modType: "wash",
    page: "stripe",
  });
  const [paymentType, setPaymentType] = useState("card");
  const [isCashBooking, setIsCashBooking] = useState(false);
  // prototype checkout state (card popup, cash confirm, done, custom tip, charges info)
  const [cardComplete, setCardComplete] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payForPlace, setPayForPlace] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [chargesOpen, setChargesOpen] = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [tipOtherOpen, setTipOtherOpen] = useState(false);
  const [tipOtherActive, setTipOtherActive] = useState(false);
  const [tipInput, setTipInput] = useState("");
  // where to go once the order is placed (the new order's details), and the auto-redirect timer
  const doneUrlRef = useRef("/profile?tab=order-history");
  const doneTimerRef = useRef(null);
  // The cart is cleared only when leaving: clearing it here re-rendered this page
  // with an empty order (and reset the card form) behind the confirmation.
  const goToOrder = () => {
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    doneTimerRef.current = null;
    lockPageScroll(false);
    dispatch(clearCartData());
    router.replace(doneUrlRef.current);
  };
  useEffect(() => () => {
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
  }, []);

  const cashEstimateDue = useMemo(() => {
    // Cash: full prepaid estimate at delivery; laundry promo settles on final invoice.
    const effectiveMin = Math.max(minimumOrderCharge, 0);
    return Math.max(0, effectiveMin + serviceFee + driverTip);
  }, [minimumOrderCharge, serviceFee, driverTip]);

  const payNowAmount = paymentType === "cash" ? 0 : payableTotal;

  const getMissingQuantityServices = useCallback(
    () =>
      getServicesMissingBagsOrItems({
        preferencesData,
        serviceList,
        orderData,
        useSharedBags,
      }),
    [preferencesData, serviceList, orderData, useSharedBags]
  );

  const runWithBagsCheck = useCallback(
    (action) => {
      if (skipBagsCheckRef.current) {
        skipBagsCheckRef.current = false;
        return action();
      }

      const missing = getMissingQuantityServices();
      if (missing.length === 0) {
        return action();
      }

      setMissingQuantityServices(missing);
      proceedAfterWarningRef.current = action;
      onBagsWarningOpen();
    },
    [getMissingQuantityServices, onBagsWarningOpen]
  );

  const handleBeforePay = useCallback(() => {
    if (skipBagsCheckRef.current) {
      skipBagsCheckRef.current = false;
      return true;
    }

    const missing = getMissingQuantityServices();
    if (missing.length === 0) {
      return true;
    }

    setMissingQuantityServices(missing);
    // The card popup sits above the warning, so hide it (it stays mounted, so the
    // card details are kept) and bring it back to finish placing the order.
    setPayOpen(false);
    lockPageScroll(false);
    proceedAfterWarningRef.current = () => {
      setPayOpen(true);
      lockPageScroll(true);
      stripeSubmitRef.current?.requestSubmit();
    };
    onBagsWarningOpen();
    return false;
  }, [getMissingQuantityServices, onBagsWarningOpen]);

  const handleBagsWarningGoBack = () => {
    proceedAfterWarningRef.current = null;
    onBagsWarningClose();
    router.push("/checkout/order");
  };

  const handleBagsWarningProceed = () => {
    skipBagsCheckRef.current = true;
    const action = proceedAfterWarningRef.current;
    proceedAfterWarningRef.current = null;
    onBagsWarningClose();
    action?.();
  };

  const handleCashBooking = () => {
    runWithBagsCheck(async () => {
      setIsCashBooking(true);
      try {
        await handleCreateBooking({});
      } finally {
        setIsCashBooking(false);
      }
    });
  };

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

      const rescheduleServicesWithInstructions = rescheduleServices.map((svc) => {
        const prefRow = preferencesData?.find(
          (p) => Number(p.serviceId) === Number(svc.serviceId)
        );
        const extra = (prefRow?.additionalInstructions || "").trim();
        const bags = !useSharedBags
          ? parseQuantityCount(prefRow?.bagsCount)
          : 0;
        const items = parseQuantityCount(prefRow?.itemsCount);
        return {
          ...svc,
          ...(extra ? { serviceInstruction: extra } : {}),
          ...(!useSharedBags && bags > 0 ? { bags } : {}),
          ...(items > 0 ? { items } : {}),
        };
      });

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
          ?.map((item) => {
            const extra = (item.additionalInstructions || "").trim();
            const bags = !useSharedBags
              ? parseQuantityCount(item.bagsCount)
              : 0;
            const items = parseQuantityCount(item.itemsCount);
            return {
              serviceId: item.serviceId,
              ...(extra ? { serviceInstruction: extra } : {}),
              ...(!useSharedBags && bags > 0 ? { bags } : {}),
              ...(items > 0 ? { items } : {}),
            };
          }),
        totalItems: (() => {
          const fromPrefs = (preferencesData || []).reduce((sum, item) => {
            const n = Number(item?.itemsCount);
            return sum + (Number.isFinite(n) && n > 0 ? n : 0);
          }, 0);
          return fromPrefs > 0 ? fromPrefs : undefined;
        })(),
        totalBags: resolvedTotalBags,
        sameBagForAllServices: useSharedBags,
        tipAmount: Number.isFinite(driverTip) ? driverTip : 0,
        timeZone: serviceTimeZone,
        clientTimeZone,
        paymentIntentId: payData?.paymentIntentId ?? null,
        setupIntentId: payData?.setupIntentId ?? null,
        paymentMethodId:
          paymentType === "card" ? payData?.paymentMethodId : undefined,
        stripeCustomerId:
          paymentType === "card"
            ? localStorage.getItem("stripeCustomerId")
            : undefined,
        couponCode: appliedCoupon?.code || undefined,
        paymentType,
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
            services: rescheduleServicesWithInstructions,
            preferencesArray: flattenedPreferences,
            totalBags: resolvedTotalBags,
            sameBagForAllServices: useSharedBags,
            totalItems: (() => {
              const fromPrefs = (preferencesData || []).reduce((sum, item) => {
                const n = Number(item?.itemsCount);
                return sum + (Number.isFinite(n) && n > 0 ? n : 0);
              }, 0);
              return fromPrefs > 0 ? fromPrefs : undefined;
            })(),
          }
        : bookingData;

      const response = await (isRescheduleFlow
        ? rescheduleBooking(finalPayload)
        : createBooking(finalPayload)
      ).unwrap();
      if (response?.status === "1") {
        // Capture booking/payment IDs from response when backend returns them
        const bookingId = response?.data?.bookingId ?? response?.data?.booking_id ?? response?.data?.id;
        // Order history opens this order's details from ?bookingId=
        doneUrlRef.current = bookingId
          ? `/profile?tab=order-history&bookingId=${encodeURIComponent(bookingId)}`
          : "/profile?tab=order-history";
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

        if (isRescheduleFlow) {
          dispatch(clearCartData());
          router.replace(doneUrlRef.current);
        } else {
          setPayOpen(false);
          setOrderDone(true);
          lockPageScroll(true);
          // show the confirmation briefly, then open the new order's details
          doneTimerRef.current = setTimeout(goToOrder, 2000);
        }
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

  // "Wants to know more?" (prototype checkout FAQ)
  const checkoutFaq = [
    { q: "What if I receive a missing item?", a: "Let us know as soon as possible and we’ll track it down or put it right — everything is checked against your itemised receipt." },
    { q: "Can I change my pickup or delivery time after placing the order?", a: "Yes. You can change your times until your driver is on the way — use the Modify links in your pickup summary, or contact support." },
    { q: "What is the difference between free, first and courtesy cancellation?", a: policyContent?.hasAnyPolicy ? `${policyContent.cancellationLine1} ${policyContent.cancellationLine2}` : "Cancelling before your pickup is free. Courtesy cancellations after that are offered case by case." },
    { q: "What services do you offer?", a: "Wash & fold, dry cleaning, pressing, alterations, duvets & bulky items, and specialist leather and curtains — all collected and delivered to your door." },
    { q: "Can I update my address?", a: "Yes — use Modify next to your address, or update it in your account before the driver sets off." },
    { q: "How do I know if I’ll be charged for cancelling an order?", a: "You’ll always see any cancellation charge before you confirm, and we’ll text you if anything changes." },
  ];

  // Fee display: NaN-safe (the old ?.toFixed(2) ?? fallback printed NaN).
  const money = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n.toFixed(2) : "—";
  };

  const TIP_PRESETS = [0, 1, 2, 5];
  const tipIsOther = tipOtherActive || (!TIP_PRESETS.includes(Number(orderData?.driverTip || 0)) && Number(orderData?.driverTip) > 0);
  const totalText = `${currencySymbol}${payNowAmount.toFixed(2)}`;
  const lockScroll = (v) => {
    lockPageScroll(v);
  };
  const openCard = (forPlace) => {
    setPayForPlace(Boolean(forPlace));
    setPayOpen(true);
    lockScroll(true);
  };
  const closeCard = () => {
    setPayOpen(false);
    lockScroll(false);
  };
  const submitCard = () => {
    if (!cardComplete) return;
    stripeSubmitRef.current?.requestSubmit();
  };
  const placeOrder = () => {
    if (paymentType === "cash") {
      setCashOpen(true);
      lockScroll(true);
      return;
    }
    if (!cardSaved) {
      openCard(true);
      return;
    }
    submitCard();
  };
  const orderBusy = isCashBooking || stripeProcessing;

  return (
    <>
      <PageShell header="solid">
        {/* Checkout: layout from the prototype (checkout.html), styled with Tailwind */}
        <div id="jdcCheckoutRoot" className={ui.ROOT}>
          <div className={ui.PAGE_BG}>
            <section className={ui.HERO_SECTION}>
              <div className={ui.WRAP}>
                <div className="mt-0 grid grid-cols-[minmax(0,1fr)_310px] [align-items:start] gap-7 min-[1200px]:grid-cols-[minmax(0,1fr)_330px] max-[980px]:flex max-[980px]:grid-cols-[minmax(0,1fr)] max-[980px]:flex-col max-[980px]:gap-[18px]">
                  <div className="min-w-0 max-[980px]:contents max-[980px]:max-w-full max-[980px]:[&>*]:w-full max-[980px]:[&>*]:max-w-full max-[980px]:[&>*]:self-stretch">
                    <div className={cx(ui.PG_HEAD, "mb-6 max-[980px]:order-none max-[980px]:mb-0 max-[720px]:mb-0")}>
                      <a
                        className={cx(ui.BACK, "mb-3.5")}
                        href="/checkout/order"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push("/checkout/order");
                        }}
                      >
                        <ProtoIcon name="back" size={16} />
                        Back
                      </a>
                      <h1 className={ui.H2}>
                        {isRescheduleFlow ? (
                          <>
                            Rescheduling <em>your booking.</em>
                          </>
                        ) : (
                          <>
                            Add a <em>payment method.</em>
                          </>
                        )}
                      </h1>
                      <p className={ui.LEAD}>
                        {isRescheduleFlow
                          ? "Please wait while we submit your reschedule request…"
                          : "Nothing is taken now. You pay after we weigh your items."}
                      </p>
                    </div>

                    {!isRescheduleFlow && (
                      <div className={cx("rounded-[20px] border-[1.5px] border-jdc-line bg-white px-6 py-[22px] [box-shadow:0_10px_30px_rgba(27,34,48,0.05)] max-[980px]:mt-0 max-[980px]:min-w-0 max-[980px]:max-w-full max-[720px]:p-5", "max-[980px]:order-1")}>
                        <p className="mx-0 mb-3 mt-0 text-[14px] font-bold text-jdc-navy">How would you like to pay?</p>
                        <div className="grid grid-cols-[1fr_1fr] gap-3 max-[720px]:gap-2.5">
                          <button
                            type="button"
                            className={cx("relative flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-[1.5px] border-jdc-line px-3.5 py-2.5 text-left [transition:border-color_0.2s,box-shadow_0.2s] hover:border-[#C4D3EA] max-[720px]:flex-row max-[720px]:items-center max-[720px]:gap-[9px] max-[720px]:px-3 max-[720px]:py-2.5", paymentType === "card" && "border-jdc-blue [box-shadow:0_0_0_2px_rgba(2,120,254,0.15)]", cardSaved && "border-[#1A7F43] hover:border-[#1A7F43]")}
                            data-pay="card"
                            aria-pressed={paymentType === "card" ? "true" : "false"}
                            onClick={() => setPaymentType("card")}
                          >
                            <span className={cx("flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-jdc-paper text-[#8A93A6] [transition:background_0.2s,color_0.2s] [&_svg]:h-[18px] [&_svg]:w-[18px] max-[720px]:h-8 max-[720px]:w-8", paymentType === "card" && "bg-jdc-blue-tint text-jdc-blue")}>
                              <ProtoIcon name="card" size={20} />
                            </span>
                            <span className="min-w-0 flex-1 max-[720px]:w-full max-[720px]:pr-0 [&>b]:block [&>b]:text-[15px] [&>b]:text-jdc-navy max-[720px]:[&>b]:text-[14.5px]">
                              <b>Card</b>
                              <small className={cx("mt-0.5 hidden text-[13px] leading-[1.4] text-jdc-muted max-[720px]:text-[12px] max-[720px]:leading-[1.35]", cardSaved && "block font-semibold text-[#1A7F43]")}>
                                {cardSaved ? "Card details saved" : "Tap to add your card details"}
                              </small>
                            </span>
                            <span className="!hidden items-center text-jdc-muted" aria-hidden="true">
                              <ProtoIcon name="chevDown" size={14} />
                            </span>
                            <span className={cx("flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[50%] border-[1.5px] border-jdc-line text-white [transition:background_0.2s,border-color_0.2s] max-[720px]:static max-[720px]:h-5 max-[720px]:w-5 [&_svg]:opacity-0 [&_svg]:transition-opacity [&_svg]:duration-200", paymentType === "card" && "border-jdc-blue bg-jdc-blue [&_svg]:opacity-100")}>
                              <ProtoIcon name="tick" size={16} />
                            </span>
                          </button>
                          <button
                            type="button"
                            className={cx("relative flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-[1.5px] border-jdc-line px-3.5 py-2.5 text-left [transition:border-color_0.2s,box-shadow_0.2s] hover:border-[#C4D3EA] max-[720px]:flex-row max-[720px]:items-center max-[720px]:gap-[9px] max-[720px]:px-3 max-[720px]:py-2.5", paymentType === "cash" && "border-jdc-blue [box-shadow:0_0_0_2px_rgba(2,120,254,0.15)]")}
                            data-pay="cash"
                            aria-pressed={paymentType === "cash" ? "true" : "false"}
                            onClick={() => setPaymentType("cash")}
                          >
                            <span className={cx("flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-jdc-paper text-[#8A93A6] [transition:background_0.2s,color_0.2s] [&_svg]:h-[18px] [&_svg]:w-[18px] max-[720px]:h-8 max-[720px]:w-8", paymentType === "cash" && "bg-jdc-blue-tint text-jdc-blue")}>
                              <ProtoIcon name="cash" size={20} />
                            </span>
                            <span className="min-w-0 flex-1 max-[720px]:w-full max-[720px]:pr-0 [&>b]:block [&>b]:text-[15px] [&>b]:text-jdc-navy max-[720px]:[&>b]:text-[14.5px]">
                              <b>Cash</b>
                              <small className="mt-0.5 hidden text-[13px] leading-[1.4] text-jdc-muted max-[720px]:text-[12px] max-[720px]:leading-[1.35]">Pay on collection &mdash; nothing now</small>
                            </span>
                            <span className={cx("flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[50%] border-[1.5px] border-jdc-line text-white [transition:background_0.2s,border-color_0.2s] max-[720px]:static max-[720px]:h-5 max-[720px]:w-5 [&_svg]:opacity-0 [&_svg]:transition-opacity [&_svg]:duration-200", paymentType === "cash" && "border-jdc-blue bg-jdc-blue [&_svg]:opacity-100")}>
                              <ProtoIcon name="tick" size={16} />
                            </span>
                          </button>
                        </div>
                        <button
                          type="button"
                          className={cx("mx-0 mb-0 mt-3.5 cursor-pointer border-0 bg-none p-0 text-[13.5px] font-bold text-jdc-navy underline underline-offset-[3px]", !(paymentType === "card" && cardSaved) && "hidden")}
                          id="coCardEdit"
                          hidden={!(paymentType === "card" && cardSaved)}
                          onClick={() => openCard(false)}
                        >
                          Edit card details
                        </button>
                      </div>
                    )}

                    <div className={cx("rounded-[20px] border-[1.5px] border-jdc-line bg-white px-6 py-[22px] [box-shadow:0_10px_30px_rgba(27,34,48,0.05)] max-[980px]:mt-0 max-[980px]:min-w-0 max-[980px]:max-w-full max-[720px]:p-5", !isRescheduleFlow && "mt-[18px] max-[980px]:mt-0", "max-[980px]:order-4")}>
                      <div className="-mx-6 -mt-[22px] mb-4 rounded-t-[20px] bg-[#F3F4F6] px-6 py-3.5 text-[15px] font-bold text-jdc-navy max-[720px]:-mx-5 max-[720px]:-mt-5 max-[720px]:mb-3.5 max-[720px]:px-5 max-[720px]:py-3">How much do I pay?</div>
                      <ul className="m-0 flex list-none flex-col gap-3.5 p-0 [&_svg]:mt-0.5 [&_svg]:flex-none [&_svg]:text-[#8A93A6] [&>li]:flex [&>li]:items-center [&>li]:gap-3 [&>li]:text-[14.5px] [&>li]:leading-[1.5] [&>li]:text-jdc-text">
                        <li>
                          <span className="mt-px flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-jdc-paper text-[#8A93A6]">
                            <ProtoIcon name="seal" size={18} />
                          </span>
                          <span>You&rsquo;ll pay nothing when placing the order.</span>
                        </li>
                        <li>
                          <span className="mt-px flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-jdc-paper text-[#8A93A6]">
                            <ProtoIcon name="receipt" size={18} />
                          </span>
                          <span>Our local cleaning partner checks your bags and issues an itemised online receipt.</span>
                        </li>
                        <li>
                          <span className="mt-px flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-jdc-paper text-[#8A93A6]">
                            <ProtoIcon name="wallet" size={18} />
                          </span>
                          <span>
                            You pay the order total after we clean your items. Service fee {currencySymbol}
                            {money(addressData?.data?.zoneSeviceCharge)}, minimum order {currencySymbol}
                            {money(addressData?.data?.zoneUpfrontAmount)}.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className={cx("rounded-[20px] border-[1.5px] border-jdc-line bg-white px-6 py-[22px] [box-shadow:0_10px_30px_rgba(27,34,48,0.05)] max-[980px]:mt-0 max-[980px]:min-w-0 max-[980px]:max-w-full max-[720px]:p-5", "mt-[18px] max-[980px]:mt-0", "flex flex-col gap-4", "max-[980px]:order-5")}>
                      <div className="flex items-center gap-[13px] [&_b]:block [&_b]:font-display [&_b]:text-[15px] [&_b]:text-jdc-navy [&_small]:mt-0.5 [&_small]:block [&_small]:text-[13px] [&_small]:leading-[1.4] [&_small]:text-jdc-muted">
                        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-jdc-paper text-[#8A93A6]">
                          <ProtoIcon name="lock" size={18} />
                        </span>
                        <span>
                          <b>Secure checkout</b>
                          <small>Your details are protected end to end.</small>
                        </span>
                      </div>
                      <div className="flex items-center gap-[13px] [&_b]:block [&_b]:font-display [&_b]:text-[15px] [&_b]:text-jdc-navy [&_small]:mt-0.5 [&_small]:block [&_small]:text-[13px] [&_small]:leading-[1.4] [&_small]:text-jdc-muted">
                        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-jdc-paper text-[#8A93A6]">
                          <ProtoIcon name="scales" size={18} />
                        </span>
                        <span>
                          <b>No charge until weighed</b>
                          <small>You only pay once items are checked.</small>
                        </span>
                      </div>
                      <div className="flex items-center gap-[13px] [&_b]:block [&_b]:font-display [&_b]:text-[15px] [&_b]:text-jdc-navy [&_small]:mt-0.5 [&_small]:block [&_small]:text-[13px] [&_small]:leading-[1.4] [&_small]:text-jdc-muted">
                        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-jdc-paper text-[#8A93A6]">
                          <ProtoIcon name="truck" size={18} />
                        </span>
                        <span>
                          <b>Free collection &amp; delivery</b>
                          <small>To and from your door, across London.</small>
                        </span>
                      </div>
                    </div>
                  </div>

                  <aside ref={asideRef} className={cx(asideFits && "sticky top-[108px]", "mt-11 flex flex-col gap-[18px] max-[980px]:static max-[980px]:contents max-[980px]:mt-0 max-[980px]:min-w-0 max-[980px]:max-w-full max-[980px]:[&>*]:w-full max-[980px]:[&>*]:max-w-full max-[980px]:[&>*]:self-stretch")}>
                    <div className={cx(ui.SUM, "px-6 pb-6 pt-[26px] max-[980px]:order-2 max-[720px]:p-5")}>
                      <h3 className="mx-0 mb-1 mt-0 text-left font-display text-[20px] tracking-[-0.01em] text-jdc-navy">Order summary</h3>
                      <div className="border-b border-jdc-line py-5">
                        <p className="mx-0 mb-3 mt-0 flex items-baseline gap-2 text-[14.5px] font-bold text-jdc-navy [&>span]:text-[12.5px] [&>span]:font-medium [&>span]:text-jdc-muted">How often?</p>
                        <div className="m-0 grid grid-cols-[1fr_1fr] gap-2.5">
                          {[
                            ["Just once", "Just once"],
                            ["Weekly", "Weekly"],
                            ["Every Two Weeks", "Every 2 weeks"],
                            ["Every Four Weeks", "Every 4 weeks"],
                          ].map(([value, text]) => {
                            const on = (orderData?.frequency || "Just once") === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                className={cx("flex h-[46px] min-w-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border border-jdc-line bg-white px-2 py-0 text-[14.5px] font-semibold text-jdc-text [transition:background_0.2s,color_0.2s,border-color_0.2s] hover:!border-[#C5CEDD]", on && "!border-jdc-blue bg-jdc-blue-tint text-jdc-blue [box-shadow:inset_0_0_0_1px_var(--jdc-blue)] hover:!border-jdc-blue")}
                                aria-pressed={on ? "true" : "false"}
                                onClick={() => dispatch(setFrequency(value))}
                              >
                                {text}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-b border-jdc-line py-5">
                        <p className="mx-0 mb-3 mt-0 flex items-baseline gap-2 text-[14.5px] font-bold text-jdc-navy [&>span]:text-[12.5px] [&>span]:font-medium [&>span]:text-jdc-muted">
                          Driver tip <span>optional</span>
                        </p>
                        <div className="m-0 grid grid-cols-[repeat(5,minmax(0,1fr))] gap-2" id="coTips">
                          {TIP_PRESETS.map((amount) => {
                            const on = !tipIsOther && Number(orderData?.driverTip || 0) === amount;
                            return (
                              <button
                                key={amount}
                                type="button"
                                className={cx("flex h-[46px] min-w-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border border-jdc-line bg-white px-2 py-0 text-[14.5px] font-semibold text-jdc-text [transition:background_0.2s,color_0.2s,border-color_0.2s] hover:!border-[#C5CEDD]", "text-[14px]", on && "!border-jdc-blue bg-jdc-blue-tint text-jdc-blue [box-shadow:inset_0_0_0_1px_var(--jdc-blue)] hover:!border-jdc-blue")}
                                aria-pressed={on ? "true" : "false"}
                                onClick={() => {
                                  setTipOtherActive(false);
                                  setTipOtherOpen(false);
                                  dispatch(setDriverTip(amount));
                                }}
                              >
                                {amount === 0 ? "None" : `${currencySymbol}${amount}`}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            className={cx("flex h-[46px] min-w-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border border-jdc-line bg-white px-2 py-0 text-[14.5px] font-semibold text-jdc-text [transition:background_0.2s,color_0.2s,border-color_0.2s] hover:!border-[#C5CEDD]", "text-[14px]", tipIsOther && "!border-jdc-blue bg-jdc-blue-tint text-jdc-blue [box-shadow:inset_0_0_0_1px_var(--jdc-blue)] hover:!border-jdc-blue")}
                            id="coTipEdit"
                            aria-label="Custom tip"
                            aria-pressed={tipIsOther ? "true" : "false"}
                            onClick={() => {
                              setTipOtherActive(true);
                              setTipOtherOpen(true);
                              const v = Math.max(0, parseFloat(tipInput) || 0);
                              dispatch(setDriverTip(v));
                              setTimeout(() => document.getElementById("coTipInput")?.focus(), 30);
                            }}
                          >
                            {tipIsOther && !tipOtherOpen && Number(orderData?.driverTip) > 0
                              ? `${currencySymbol}${Number(orderData.driverTip) % 1 ? Number(orderData.driverTip).toFixed(2) : Number(orderData.driverTip)}`
                              : "Other"}
                          </button>
                        </div>
                        <div className={cx("relative mt-2.5", !(tipOtherOpen) && "hidden")} id="coTipOther" hidden={!tipOtherOpen}>
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-jdc-navy">{currencySymbol}</span>
                          <input
                            className="h-[46px] w-full rounded-xl border border-jdc-line bg-white py-0 pl-[30px] pr-3.5 text-[16px] text-jdc-text focus:border-jdc-blue focus:[box-shadow:0_0_0_3px_rgba(2,120,254,0.14)] focus:[outline:none]"
                            id="coTipInput"
                            inputMode="decimal"
                            placeholder="Enter tip amount"
                            aria-label="Custom tip amount"
                            value={tipInput}
                            onChange={(e) => {
                              const v = e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*)\./g, "$1")
                                .slice(0, 6);
                              setTipInput(v);
                              dispatch(setDriverTip(Math.max(0, parseFloat(v) || 0)));
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter") return;
                              e.preventDefault();
                              const v = Math.max(0, parseFloat(tipInput) || 0);
                              dispatch(setDriverTip(v));
                              setTipOtherOpen(false);
                              if (!v) setTipOtherActive(false);
                              e.currentTarget.blur();
                              addToast({
                                title: v ? `Tip of ${currencySymbol}${v.toFixed(2)} added` : "No tip added",
                                color: "success",
                              });
                            }}
                          />
                        </div>
                        <p className="mx-0 mb-0 mt-2.5 text-[13px] leading-[1.45] text-jdc-muted">The full tip goes to your driver.</p>
                      </div>

                      <div className="border-b border-jdc-line py-5">
                        <p className="mx-0 mb-3 mt-0 flex items-baseline gap-2 text-[14.5px] font-bold text-jdc-navy [&>span]:text-[12.5px] [&>span]:font-medium [&>span]:text-jdc-muted">Promo code</p>
                        <form
                          className="m-0 flex gap-2.5"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleApplyCoupon();
                          }}
                        >
                          <input
                            className="h-[46px] w-full appearance-none rounded-xl border border-jdc-line bg-white px-4 py-0 text-[15px] text-jdc-text [transition:border-color_0.2s,box-shadow_0.2s] focus:border-jdc-blue focus:[box-shadow:0_0_0_4px_rgba(2,120,254,0.14)] focus:[outline:none]"
                            placeholder="Enter code"
                            aria-label="Promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                          />
                          <button className={cx(ui.BTN, "h-[46px] flex-none rounded-xl border border-solid border-jdc-line bg-white px-[22px] text-[14.5px] text-jdc-navy hover:border-[#C5CEDD] hover:bg-jdc-paper")} type="submit" disabled={isApplyingCoupon}>
                            {isApplyingCoupon ? "Applying…" : "Apply"}
                          </button>
                        </form>
                        {appliedCoupon?.code ? (
                          <p className="mx-0 mb-0 mt-2.5 text-[13px] leading-[1.45] text-jdc-muted" role="status">
                            {appliedCoupon?.offerLabel ? <b>{appliedCoupon.offerLabel}. </b> : null}
                            {appliedCoupon.minOrderDeferred || couponDiscount <= 0
                              ? `Coupon ${appliedCoupon.code} reserved. It applies on the final laundry invoice${
                                  appliedCoupon.minOrderAmount
                                    ? ` (min ${currencySymbol}${Number(appliedCoupon.minOrderAmount).toFixed(2)})`
                                    : ""
                                }. Pay now is unchanged.`
                              : `Coupon ${appliedCoupon.code}: estimated invoice discount -${currencySymbol}${couponDiscount.toFixed(2)}. Pay now is unchanged.`}
                          </p>
                        ) : null}
                        {creditBalance > 0 ? (
                          <p className="mx-0 mb-0 mt-2.5 text-[13px] leading-[1.45] text-jdc-muted">
                            <b>You have {currencySymbol}{creditBalance.toFixed(2)} credit.</b> Used automatically on your
                            invoice. Pay now stays the same.
                          </p>
                        ) : null}
                        {promotionOffers.length > 0 ? (
                          <p className="mx-0 mb-0 mt-2.5 text-[13px] leading-[1.45] text-jdc-muted">
                            <b>Offers on this order: </b>
                            {promotionOffers
                              .map((offer) => [offer.name, offer.label].filter(Boolean).join(": "))
                              .join(" · ")}
                            . Applied automatically when the shop finalises your invoice.
                          </p>
                        ) : null}
                      </div>

                      <div className={cx("border-b border-jdc-line py-5", "border-b-0 pb-1")}>
                        <div className="flex flex-col gap-3 border-0 p-0">
                          <div className="flex justify-between gap-4 p-0 text-[14.5px] text-jdc-muted [&>span:last-child]:font-medium [&>span:last-child]:text-jdc-text">
                            <span>Minimum order</span>
                            <span>
                              {currencySymbol}
                              {money(addressData?.data?.zoneUpfrontAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 p-0 text-[14.5px] text-jdc-muted [&>span:last-child]:font-medium [&>span:last-child]:text-jdc-text">
                            <span>Service fee</span>
                            <span>
                              {currencySymbol}
                              {money(addressData?.data?.zoneSeviceCharge)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 p-0 text-[14.5px] text-jdc-muted [&>span:last-child]:font-medium [&>span:last-child]:text-jdc-text">
                            <span>Driver tip</span>
                            <span id="coTipVal">
                              {currencySymbol}
                              {driverTip.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 p-0 text-[14.5px] text-jdc-muted [&>span:last-child]:font-medium [&>span:last-child]:text-jdc-text">
                            <span>Collection &amp; delivery</span>
                            <span className="font-bold text-[#1A7F43]">Free</span>
                          </div>
                          {appliedCoupon?.code ? (
                            <div className="flex justify-between gap-4 p-0 text-[14.5px] text-jdc-muted [&>span:last-child]:font-medium [&>span:last-child]:text-jdc-text">
                              <span>{couponDiscount > 0 ? "Invoice discount (est.)" : "Promo reserved"}</span>
                              <span className="font-bold text-[#1A7F43]">
                                {couponDiscount > 0 ? `-${currencySymbol}${couponDiscount.toFixed(2)}` : "At invoice"}
                              </span>
                            </div>
                          ) : null}
                          {paymentType === "cash" ? (
                            <div className="flex justify-between gap-4 p-0 text-[14.5px] text-jdc-muted [&>span:last-child]:font-medium [&>span:last-child]:text-jdc-text">
                              <span>Pay on collection</span>
                              <span>
                                {currencySymbol}
                                {cashEstimateDue.toFixed(2)}
                              </span>
                            </div>
                          ) : null}
                          <div className="mx-0 mb-0 mt-1.5 flex items-baseline justify-between gap-4 rounded-none border-t border-jdc-line bg-none px-0 pb-0 pt-4 text-[16px] font-bold text-jdc-navy [&>b]:font-display [&>b]:text-[24px] [&>b]:tracking-[-0.01em] [&>b]:text-jdc-navy [&_small]:ml-1 [&_small]:text-[12.5px] [&_small]:font-medium [&_small]:text-jdc-muted">
                            <span>
                              Pay now {paymentType === "cash" ? null : <small>incl. tax</small>}
                            </span>
                            <b id="coTotal">{totalText}</b>
                          </div>
                        </div>
                        <a
                          className="mx-0 mb-0 mt-3.5 inline-block text-[13.5px] font-semibold text-jdc-navy underline"
                          href="#charges"
                          onClick={(e) => {
                            e.preventDefault();
                            setChargesOpen(true);
                            lockScroll(true);
                          }}
                        >
                          How do charges work?
                        </a>
                      </div>
                      {!isRescheduleFlow && (
                        <button
                          type="button"
                          className={cx(ui.BTN, ui.BTN_BLOCK, "mt-5 h-14 w-full rounded-xl text-[16px]")}
                          id="coPlace"
                          disabled={orderBusy}
                          onClick={placeOrder}
                        >
                          {orderBusy ? "Placing order…" : "Place order"}
                          <ProtoIcon name="arrow" size={18} />
                        </button>
                      )}
                      <p className={cx(ui.REQ_NOTE, "mx-0 mb-0 mt-3.5 text-[13px]")}>
                        <ProtoIcon name="shield" size={16} />
                        <span>You pay nothing now &mdash; the total is confirmed after your items are checked and weighed.</span>
                      </p>
                    </div>

                    <div className={cx(ui.SUM, "max-[980px]:order-3 max-[720px]:p-5")}>
                      <div className={ui.SUM_HEAD}>
                        <ProtoIcon name="truck" size={18} />
                        <b>Pickup</b>
                        <a
                          className={cx(ui.SUM_EDIT, "ml-auto")}
                          href="/place-order"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push("/place-order");
                          }}
                        >
                          Edit
                        </a>
                      </div>
                      <p className={ui.SUM_LEAD}>Scheduled for</p>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Collection</p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="calendar" size={16} />
                          <span>{formatDate(orderData?.collectionData?.collectionDate) || "Not set"}</span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="clock" size={16} />
                          <span>
                            {orderData?.collectionData?.collectionTimeFrom
                              ? `${to24Hour(orderData?.collectionData?.collectionTimeFrom)} – ${to24Hour(
                                  orderData?.collectionData?.collectionTimeTo
                                )}`
                              : "—"}
                          </span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="door" size={16} />
                          <span>{orderData?.collectionData?.driverInstructionOptions || "—"}</span>
                        </p>
                      </div>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Delivery</p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="calendar" size={16} />
                          <span>{formatDate(orderData?.deliveryData?.deliveryDate) || "Not set"}</span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="clock" size={16} />
                          <span>
                            {orderData?.deliveryData?.deliveryTimeFrom
                              ? `${to24Hour(orderData?.deliveryData?.deliveryTimeFrom)} – ${to24Hour(
                                  orderData?.deliveryData?.deliveryTimeTo
                                )}`
                              : "—"}
                          </span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="door" size={16} />
                          <span>{orderData?.deliveryData?.driverInstructionOptions1 || "—"}</span>
                        </p>
                      </div>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Address</p>
                        <p className={cx(ui.SUM_ROW, ui.SUM_ROW_BETWEEN)}>
                          <span className={ui.SUM_ADDR}>
                            <ProtoIcon name="pin" size={16} />
                            <span>{orderData?.collectionData?.streetAddress || "Not set"}</span>
                          </span>
                          <a
                            className={ui.SUM_EDIT}
                            href="/place-order"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push("/place-order");
                            }}
                          >
                            Modify
                          </a>
                        </p>
                      </div>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Driver instructions</p>
                        <p className={cx(ui.SUM_ROW, ui.SUM_ROW_BETWEEN)}>
                          <span className={ui.SUM_ADDR}>
                            <ProtoIcon name="note" size={16} />
                            <span className={orderData?.driverInstruction ? "" : ui.SUM_MUTED}>
                              {orderData?.driverInstruction || "None"}
                            </span>
                          </span>
                          <a
                            className={ui.SUM_EDIT}
                            href="/place-order"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push("/place-order");
                            }}
                          >
                            {orderData?.driverInstruction ? "Edit" : "Add"}
                          </a>
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <section className={ui.FAQ_SECTION}>
              <div className={ui.WRAP}>
                <div className={cx(ui.PG_HEAD, ui.PG_HEAD_CENTER, "mb-[26px] max-[720px]:mb-[26px]")}>
                  <h2 className={ui.H2}>
                    Wants to <em>know more?</em>
                  </h2>
                </div>
                <div className={ui.FAQ_CARD}>
                  <div>
                    <div className={ui.FAQ_LIST}>
                      {checkoutFaq.map((f) => (
                        <details key={f.q} className={ui.FAQ_DETAILS}>
                          <summary className={ui.FAQ_SUMMARY}>
                            {f.q}
                            <i aria-hidden="true" className={ui.FAQ_ICON}>
                              <ProtoIcon name="chevDown" size={14} />
                            </i>
                          </summary>
                          <p className={ui.FAQ_ANSWER}>{f.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {!isRescheduleFlow && (
              <ServiceBar
                count={1}
                targetId="coPlace"
                fallbackId="coPlace"
                rootId="jdcCheckoutRoot"
                barId="coBar"
                label={
                  <span className={cx(ui.BAR_TXT, ui.BAR_TXT_TOTAL)}>
                    <small>Pay now</small>
                    <strong id="coBarTotal">{totalText}</strong>
                  </span>
                }
                goText="Place order"
                innerClassName="max-[720px]:px-10"
                isDisabled={orderBusy}
                onContinue={placeOrder}
              />
            )}

            {/* Card details (Stripe) — prototype #payModal shell. Kept mounted so the card stays entered. */}
            {!isRescheduleFlow && paymentType === "card" && modal?.page === "stripe" ? (
              <div className={cx(cx(ui.MODAL, "!items-center !p-5"), !(payOpen) && "hidden")} id="payModal" hidden={!payOpen}>
                <div className={ui.MODAL_OVERLAY} onClick={closeCard} />
                <div className={cx(ui.MODAL_PANEL, "m-auto !max-h-[calc(100vh-40px)] !max-w-[440px] !rounded-[22px]")} role="dialog" aria-modal="true" aria-labelledby="payModalTitle">
                  <div className={ui.MODAL_HEAD}>
                    <b id="payModalTitle">Payment method</b>
                    <button type="button" className={ui.MODAL_X} onClick={closeCard}>
                      Cancel
                    </button>
                  </div>
                  <div className={cx(ui.MODAL_BODY, "gap-[18px]")}>
                    <StripeCheckout
                      paymentMethod={modal?.paymentMethod}
                      setModal={setModal}
                      modal={modal}
                      booking={handleCreateBooking}
                      totalAmount={payableTotal}
                      onOpen={() => {}}
                      customerId={customerId}
                      beforePay={handleBeforePay}
                      stripeSubmitRef={stripeSubmitRef}
                      hideSubmit
                      onCompleteChange={setCardComplete}
                      onProcessingChange={setStripeProcessing}
                    />
                    <p className="mx-0 mb-0 mt-0.5 flex items-start gap-2 text-[13px] leading-[1.5] text-jdc-muted [&>svg]:mt-px [&>svg]:flex-none [&>svg]:text-[#8A93A6]">
                      <ProtoIcon name="lock" size={15} />
                      <span>Payments are processed securely by Stripe. Nothing is charged until your items are checked.</span>
                    </p>
                  </div>
                  <div className={ui.MODAL_FOOT}>
                    <button
                      type="button"
                      className={cx(ui.BTN, ui.BTN_BLOCK)}
                      id="payModalSave"
                      disabled={!cardComplete || stripeProcessing}
                      onClick={() => {
                        setCardSaved(true);
                        setPaymentType("card");
                        if (payForPlace) {
                          setPayForPlace(false);
                          submitCard();
                        } else {
                          closeCard();
                          addToast({ title: "Card saved", color: "success" });
                        }
                      }}
                    >
                      {stripeProcessing ? "Placing order…" : payForPlace ? "Pay & place order" : "Save card"}
                      <ProtoIcon name="arrow" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={cx(cx(ui.MODAL, "!items-center !p-5"), !(cashOpen) && "hidden")} id="cashConfirm" hidden={!cashOpen}>
              <div
                className={ui.MODAL_OVERLAY}
                onClick={() => {
                  setCashOpen(false);
                  lockScroll(false);
                }}
              />
              <div className={cx(ui.MODAL_PANEL, "m-auto !max-h-[calc(100vh-40px)] !max-w-[440px] !rounded-[22px]", "!max-w-[400px]")} role="dialog" aria-modal="true" aria-labelledby="cashTitle">
                <div className="px-7 pb-7 pt-8 text-center [&_h3]:mx-0 [&_h3]:mb-2 [&_h3]:mt-0 [&_h3]:font-display [&_h3]:text-[22px] [&_h3]:tracking-[-0.01em] [&_h3]:text-jdc-navy [&_p]:m-0 [&_p]:text-[15px] [&_p]:leading-[1.55] [&_p]:text-jdc-muted [&_p_b]:text-jdc-navy">
                  <span className={cx("mx-auto mb-[18px] mt-0 flex h-16 w-16 items-center justify-center rounded-[50%]", "bg-jdc-blue-tint text-jdc-blue")}>
                    <ProtoIcon name="cashMsg" size={26} />
                  </span>
                  <h3 id="cashTitle">Confirm your order</h3>
                  <p>
                    You&rsquo;ll pay{" "}
                    <b id="cashAmt">
                      {currencySymbol}
                      {cashEstimateDue.toFixed(2)}
                    </b>{" "}
                    in cash when we collect &mdash; nothing is charged now.
                  </p>
                  <div className="mt-[22px] flex gap-3">
                    <button
                      type="button"
                      className={cx(ui.BTN, ui.BTN_GHOST, "mt-0 h-[52px] w-auto min-w-0 flex-1 justify-center px-4", "min-w-[104px] flex-[0_0_auto]")}
                      onClick={() => {
                        setCashOpen(false);
                        lockScroll(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={cx(ui.BTN, ui.BTN_BLOCK, "mt-0 h-[52px] w-auto min-w-0 flex-1 justify-center px-4")}
                      id="cashConfirmBtn"
                      disabled={isCashBooking}
                      onClick={() => {
                        setCashOpen(false);
                        lockScroll(false);
                        handleCashBooking();
                      }}
                    >
                      {isCashBooking ? "Booking…" : "Confirm order"}
                      <ProtoIcon name="arrow" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={cx(cx(ui.MODAL, "!items-center !p-5"), !(orderDone) && "hidden")} id="orderDone" hidden={!orderDone}>
              <div className={ui.MODAL_OVERLAY} />
              <div className={cx(ui.MODAL_PANEL, "m-auto !max-h-[calc(100vh-40px)] !max-w-[440px] !rounded-[22px]", "!max-w-[400px]")} role="dialog" aria-modal="true" aria-labelledby="doneTitle">
                <div className="px-7 pb-7 pt-8 text-center [&_h3]:mx-0 [&_h3]:mb-2 [&_h3]:mt-0 [&_h3]:font-display [&_h3]:text-[22px] [&_h3]:tracking-[-0.01em] [&_h3]:text-jdc-navy [&_p]:m-0 [&_p]:text-[15px] [&_p]:leading-[1.55] [&_p]:text-jdc-muted [&_p_b]:text-jdc-navy">
                  <span className={cx("mx-auto mb-[18px] mt-0 flex h-16 w-16 items-center justify-center rounded-[50%]", "bg-[#E7F6EE] text-[#1A7F43]")}>
                    <ProtoIcon name="check" size={30} />
                  </span>
                  <h3 id="doneTitle">Order placed successfully</h3>
                  <p>Thanks! We&rsquo;ll confirm your pickup by text. Nothing is charged until your items are checked and weighed.</p>
                  <p className="!mt-3 !text-[13.5px]">Taking you to your order&hellip;</p>
                  <button
                    type="button"
                    className={cx(ui.BTN, ui.BTN_BLOCK, "mt-[22px] h-[52px] w-full justify-center")}
                    id="orderDoneBtn"
                    onClick={goToOrder}
                  >
                    View my order
                  </button>
                </div>
              </div>
            </div>

            <div className={cx(cx(ui.MODAL, "!items-center !p-5"), !(chargesOpen) && "hidden")} id="chargesInfo" hidden={!chargesOpen}>
              <div
                className={ui.MODAL_OVERLAY}
                onClick={() => {
                  setChargesOpen(false);
                  lockScroll(false);
                }}
              />
              <div className={cx(ui.MODAL_PANEL, "m-auto !max-h-[calc(100vh-40px)] !max-w-[440px] !rounded-[22px]")} role="dialog" aria-modal="true" aria-labelledby="chargesTitle">
                <div className={ui.MODAL_HEAD}>
                  <b id="chargesTitle">How do charges work?</b>
                  <button
                    type="button"
                    className={ui.MODAL_X}
                    onClick={() => {
                      setChargesOpen(false);
                      lockScroll(false);
                    }}
                  >
                    Close
                  </button>
                </div>
                <div className={cx(ui.MODAL_BODY, "gap-[18px]")}>
                  <p className="m-0 text-[12.5px] leading-[1.5] text-jdc-muted">
                    Minimum order {currencySymbol}
                    {money(addressData?.data?.zoneUpfrontAmount)} and service fee {currencySymbol}
                    {money(addressData?.data?.zoneSeviceCharge)}. Your final total is confirmed on an itemised receipt after
                    your items are checked and weighed.
                  </p>
                  {policyContent?.hasAnyPolicy ? (
                    <>
                      <p className="m-0 text-[12.5px] leading-[1.5] text-jdc-muted">
                        {policyContent.cancellationLine1} {policyContent.cancellationLine2}
                      </p>
                      <p className="m-0 text-[12.5px] leading-[1.5] text-jdc-muted">
                        {policyContent.rescheduleLine1} {policyContent.rescheduleLine2}
                      </p>
                      <p className="m-0 text-[12.5px] leading-[1.5] text-jdc-muted">
                        {policyContent.noShowLine}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>

      {/* =======================Modal======================== */}

      <BagsItemsWarningModal
        isOpen={isBagsWarningOpen}
        onOpenChange={onBagsWarningOpenChange}
        onClose={onBagsWarningClose}
        missingServices={missingQuantityServices}
        onGoBack={handleBagsWarningGoBack}
        onProceedAnyway={handleBagsWarningProceed}
      />

    </>
  );
}
