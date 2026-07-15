"use client";
import React, { useState } from "react";
import { GoArrowUp, GoClock } from "react-icons/go";
import { IoBagCheck, IoLocation, IoClose, IoCalendarOutline, IoTimeOutline, IoInformationCircleOutline, IoLocationOutline } from "react-icons/io5";
import { PurpleButton } from "../Buttons";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  useBookingDetailByIdQuery,
  useGetAllOrdersQuery,
  useGetCustomerActivePoliciesQuery,
  useGetAllReasonsQuery,
  useCancelBookingMutation,
} from "@/app/store/services/api";
import { formatDate } from "../../utilities/ConversionFunction";
import ReusableModal from "../Modal";
import { useDisclosure, Spinner, addToast } from "@heroui/react";
import SelectHero from "../SelectHero";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setOrderData } from "@/app/store/slices/cartItemSlice";
import { BASE_URL } from "../../utilities/URL";
import { resolveBookingSchedule } from "../../utilities/bookingScheduleDisplay";
import BookingSlotTimes from "../BookingSlotTimes";
import {
  isActiveBookingStatus,
  isPastBookingStatus,
} from "../../utilities/bookingOrderTabs";
import BookingPolicySummary, {
  CancellationSummaryCard,
} from "../BookingPolicySummary";

/** Mirrors backend cancelBookingService status gates. */
const MAX_CANCELLABLE_STATUS_ID = 9;
const BOOKING_STATUS_INVOICE_GENERATED = 10;
const BOOKING_STATUS_PROCESSING = 11;
const BOOKING_STATUS_DELIVERED = 16;
const BOOKING_STATUS_COMPLETED = 17;
const BOOKING_STATUS_CANCELLED = 19;
const UNPROCESSED_BOOKING_STATUS_IDS = new Set([4, 5, 6, 7, 8, 9]);

function resolveBookingStatusId(order) {
  const raw = order?.bookingStatusId ?? order?.bookingStatus?.id;
  const statusId = Number(raw);
  return Number.isFinite(statusId) ? statusId : null;
}

export default function OrderHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data, isLoading, refetch: refetchOrders } = useGetAllOrdersQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );
  const [order, setOrder] = useState("");
  const [modalScroll, setModalScroll] = useState(false);
  const [panelScroll, setPanelScroll] = useState(false);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    isOpen: isCancelModalOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
    onOpenChange: onCancelModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isOrderDetailsModalOpen,
    onOpen: onOrderDetailsModalOpen,
    onClose: onOrderDetailsModalClose,
    onOpenChange: onOrderDetailsModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isManageOrderModalOpen,
    onOpen: onManageOrderModalOpen,
    onClose: onManageOrderModalClose,
    onOpenChange: onManageOrderModalOpenChange,
  } = useDisclosure();
  const [manageOrder, setManageOrder] = useState({
    manage: false,
    modType: "track",
    orderId: "",
  });
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationCharge, setCancellationCharge] = useState(null);
  const [isCheckingCancellation, setIsCheckingCancellation] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showManageDetails, setShowManageDetails] = useState(false);
  const [shouldRenderManageDetails, setShouldRenderManageDetails] = useState(false);
  const [isOrderItemsExpanded, setIsOrderItemsExpanded] = useState(true);
  const [bookingTab, setBookingTab] = useState("active");
  const clientTimeZone = React.useMemo(
    () => Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC",
    []
  );

  const {
    data: bookingDtails,
    isLoading: bookingDetailsLoading,
    isFetching: bookingDetailsFetching,
    isError: bookingDetailsError,
  } = useBookingDetailByIdQuery(
    manageOrder?.orderId
      ? { bookingId: manageOrder.orderId, timeZone: clientTimeZone }
      : undefined,
    {
      skip: !manageOrder?.orderId,
    }
  );

  const isBookingDetailsLoading = bookingDetailsLoading || bookingDetailsFetching;

  const handleSelectBooking = (order) => {
    const orderId = order?.id;
    if (!orderId) return;

    setManageOrder({
      manage: false,
      modType: "track",
      orderId,
    });

    const isMobileViewport =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (isMobileViewport) {
      onOrderDetailsModalOpen();
    }
  };

  // Deep-link support: /profile?tab=order-history&bookingId=123 auto-opens
  // that order (used when redirected here from a "failed attempt" notice).
  const autoOpenedBookingIdRef = React.useRef(null);
  React.useEffect(() => {
    const bookingIdParam = searchParams?.get("bookingId");
    if (!bookingIdParam) return;
    if (autoOpenedBookingIdRef.current === bookingIdParam) return;

    autoOpenedBookingIdRef.current = bookingIdParam;
    handleSelectBooking({ id: Number(bookingIdParam) });
  }, [searchParams]);

  const renderOrderDetailsPanel = ({ panelLayout = false } = {}) => {
    if (isBookingDetailsLoading) {
      return (
        <div className="w-full flex items-center justify-center py-16">
          <Spinner
            size="lg"
            label="Loading order details..."
            classNames={{
              label: "text-foreground mt-4 font-youth font-semibold text-theme-blue",
            }}
            variant="wave"
          />
        </div>
      );
    }

    if (bookingDetailsError || !bookingDtails?.data) {
      return (
        <p className="font-sf text-theme-psGray text-center py-16">
          Unable to load order details. Please try again.
        </p>
      );
    }

    return renderOrderDetailsContent({ panelLayout });
  };

  // Handle smooth transition when order details are loaded
  React.useEffect(() => {
    if (manageOrder?.orderId && isBookingDetailsLoading) {
      setShowOrderDetails(true);
    } else if (bookingDtails?.data && !isBookingDetailsLoading) {
      setShowOrderDetails(false);
      setIsOrderItemsExpanded(true);
      setTimeout(() => {
        setShowOrderDetails(true);
      }, 50);
    } else if (!manageOrder?.orderId) {
      setShowOrderDetails(false);
    }
  }, [bookingDtails, isBookingDetailsLoading, manageOrder?.orderId]);

  // Handle smooth transition for manage order details section
  React.useEffect(() => {
    if (manageOrder?.manage) {
      // Render the element first
      setShouldRenderManageDetails(true);
      // Small delay to trigger opening animation
      setTimeout(() => {
        setShowManageDetails(true);
      }, 10);
    } else {
      // Start closing animation first
      setShowManageDetails(false);
      // Remove from DOM after animation completes (500ms)
      setTimeout(() => {
        setShouldRenderManageDetails(false);
      }, 500);
    }
  }, [manageOrder?.manage]);

  // Fetch active customer policies as soon as Order History tab/page is loaded.
  const { data: activePoliciesData } = useGetCustomerActivePoliciesQuery();
  const { data: reasonsData, isLoading: isLoadingReasons } = useGetAllReasonsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  // Transform API reasons to match SelectHero format
  const cancellationReasons = React.useMemo(() => {
    if (!reasonsData?.data || !Array.isArray(reasonsData.data)) {
      return [];
    }
    return reasonsData.data.map((reason) => {
      // Convert cancelReason to a key format (lowercase with underscores)
      const key = reason.cancelReason
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      return {
        key: key,
        label: reason.cancelReason,
        id: String(reason.id),
        text: reason.cancelReason,
      };
    });
  }, [reasonsData]);

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  function handlePanelScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setPanelScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  React.useEffect(() => {
    setPanelScroll(false);
  }, [manageOrder?.orderId]);

  const formatCardBrand = (brand) => {
    if (!brand) return "Card";
    const normalized = String(brand).trim();
    if (!normalized) return "Card";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  };

  const getCardPaymentLabel = (cardDetails, paymentMethodId) => {
    if (cardDetails?.last4) {
      return `${formatCardBrand(cardDetails.brand)} ending in ${cardDetails.last4}`;
    }
    if (paymentMethodId?.startsWith("pm_")) return "Card on file";
    return paymentMethodId || "Payment Method";
  };

  const getCardPaymentSubtext = (cardDetails) => {
    if (!cardDetails) return null;
    const parts = [];
    if (cardDetails.cardholderName) {
      parts.push(cardDetails.cardholderName);
    }
    if (cardDetails.expMonth && cardDetails.expYear) {
      const month = String(cardDetails.expMonth).padStart(2, "0");
      const year = String(cardDetails.expYear).slice(-2);
      parts.push(`Expires ${month}/${year}`);
    }
    if (cardDetails.funding) {
      parts.push(
        String(cardDetails.funding).charAt(0).toUpperCase() +
          String(cardDetails.funding).slice(1).toLowerCase()
      );
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  // Check if an order is cancelled
  const isOrderCancelled = (order) => {
    if (!order) return false;
    const status = order?.bookingStatus?.title?.toLowerCase() || "";
    return status.includes("cancel") || status.includes("cancelled");
  };

  // Get status badge color classes based on status
  const getStatusColorClasses = (statusTitle) => {
    if (!statusTitle) return "bg-theme-skyBlue text-[#0391C4]"; // Default blue

    const status = statusTitle.toLowerCase();

    // Cancelled status - red
    if (status.includes("cancel") || status.includes("cancelled")) {
      return "bg-red-100 text-red-600";
    }

    // On Hold statuses - yellow/warning
    if (status.includes("on hold") || status.includes("waiting for") || status.includes("onhold")) {
      return "bg-yellow-100 text-yellow-700";
    }

    // Default - blue (for normal statuses like created, confirmed, processing, etc.)
    return "bg-theme-skyBlue text-[#0391C4]";
  };

  // Check if order can be cancelled based on cancellation policy (status IDs match backend).
  const canCancelOrder = (order, config) => {
    if (!order) return { canCancel: true, reason: null };

    const statusId = resolveBookingStatusId(order);

    if (statusId === BOOKING_STATUS_CANCELLED) {
      return { canCancel: false, reason: "This order has already been cancelled" };
    }

    if (statusId === BOOKING_STATUS_PROCESSING) {
      return {
        canCancel: false,
        reason: "Items are currently being processed at the facility",
      };
    }

    if (
      statusId === BOOKING_STATUS_DELIVERED ||
      statusId === BOOKING_STATUS_COMPLETED
    ) {
      return { canCancel: false, reason: "Cannot cancel completed bookings" };
    }

    if (statusId === BOOKING_STATUS_INVOICE_GENERATED) {
      return {
        canCancel: false,
        reason: "Invoice has already been generated for this order",
      };
    }

    if (statusId != null && statusId > MAX_CANCELLABLE_STATUS_ID) {
      return { canCancel: false, reason: "Cannot cancel booking at this stage" };
    }

    if (statusId != null && UNPROCESSED_BOOKING_STATUS_IDS.has(statusId)) {
      if (config && config.allowCancelUnprocessed === false) {
        return {
          canCancel: false,
          reason: "Unprocessed orders cannot be cancelled according to the policy",
        };
      }
    }

    return { canCancel: true, reason: null };
  };

  // Handle cancel button click - check eligibility first
  const handleCancelClick = async () => {
    if (!bookingDtails?.data) {
      addToast({
        title: "Error",
        description: "Order details not available",
        color: "danger",
      });
      return;
    }

    setIsCheckingCancellation(true);

    const cancellationSummary = bookingDtails.data?.cancellationSummary;
    if (cancellationSummary?.canCancel === false) {
      addToast({
        title: "Cannot Cancel Order",
        description:
          cancellationSummary.cancelBlockedReason ||
          "This order cannot be cancelled",
        color: "warning",
      });
      setIsCheckingCancellation(false);
      return;
    }

    // Prefer snapshotted booking policy; fall back to zone active policy.
    const cancellationConfig =
      cancellationSummary?.policy ||
      bookingDtails.data?.cancellationPolicy ||
      activePoliciesData?.data?.activeCancellationPolicy?.cancellationConfig;
    const eligibility = canCancelOrder(bookingDtails.data, cancellationConfig);

    if (!eligibility.canCancel) {
      addToast({
        title: "Cannot Cancel Order",
        description: eligibility.reason || "This order cannot be cancelled",
        color: "warning",
      });
      setIsCheckingCancellation(false);
      return;
    }

    setIsCheckingCancellation(false);
    onCancelModalOpen();
  };

  // Handle confirm cancellation
  const handleConfirmCancellation = async () => {
    if (!cancellationReason || !manageOrder?.orderId) {
      addToast({
        title: "Error",
        description: "Please select a cancellation reason",
        color: "danger",
      });
      return;
    }

    // Find the selected reason object
    const selectedReason = cancellationReasons.find(
      (reason) => reason.key === cancellationReason
    );

    if (!selectedReason) {
      addToast({
        title: "Error",
        description: "Invalid cancellation reason",
        color: "danger",
      });
      return;
    }

    const clientTimeZone =
      Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
    const serviceTimeZone =
      bookingDtails?.data?.zone?.timeZone ||
      bookingDtails?.data?.zone?.timezone ||
      bookingDtails?.data?.zone?.tz ||
      null;

    try {
      const result = await cancelBooking({
        bookingId: manageOrder.orderId,
        reasonId: selectedReason.id,
        reasonText: selectedReason.text,
        timeZone: serviceTimeZone || clientTimeZone,
      }).unwrap();

      if (result?.status === "1" || result?.success) {
        addToast({
          title: "Order Cancelled",
          description: result?.message || "Your order has been cancelled successfully",
          color: "success",
        });

        // Close modal and reset state
        onCancelModalClose();
        setCancellationReason("");
        setCancellationCharge(null);

        // Refetch orders to update the list
        refetchOrders();

        // Reset manage order state
        setManageOrder({
          manage: false,
          modType: "track",
          orderId: "",
        });
      } else {
        addToast({
          title: "Cancellation Failed",
          description: result?.message || result?.error || "Failed to cancel order. Please try again.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      addToast({
        title: "Cancellation Failed",
        description: error?.data?.message || error?.data?.error || "Failed to cancel order. Please try again.",
        color: "danger",
      });
    }
  };

  // Helper function to get proof of collection (pickUp)
  const getProofOfCollection = () => {
    if (!bookingDtails?.data?.proofOfDeliveries || !Array.isArray(bookingDtails.data.proofOfDeliveries)) {
      return [];
    }
    return bookingDtails.data.proofOfDeliveries.filter(
      (proof) => proof.deliveryType === "pickUp"
    );
  };

  // Helper function to get proof of delivery (dropOff)
  const getProofOfDelivery = () => {
    if (!bookingDtails?.data?.proofOfDeliveries || !Array.isArray(bookingDtails.data.proofOfDeliveries)) {
      return [];
    }
    return bookingDtails.data.proofOfDeliveries.filter(
      (proof) => proof.deliveryType === "dropOff"
    );
  };

  const getProofSectionNote = (deliveryType) => {
    const fromApi =
      deliveryType === "pickUp"
        ? bookingDtails?.data?.pickupProofNote
        : bookingDtails?.data?.deliveryProofNote;
    if (fromApi && String(fromApi).trim()) {
      return String(fromApi).trim();
    }
    const proofs =
      deliveryType === "pickUp" ? getProofOfCollection() : getProofOfDelivery();
    const match = proofs.find(
      (proof) => proof?.note && String(proof.note).trim() !== ""
    );
    return match ? String(match.note).trim() : null;
  };

  // Helper function to get image URL from proof object
  const getImageUrl = (imgUpload) => {
    if (!imgUpload) return null;

    if (typeof imgUpload === 'string') {
      return imgUpload.startsWith('http') ? imgUpload : BASE_URL + imgUpload;
    }

    return null;
  };

  const formatMinutesWindow = (minutes) => {
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) return "No free window";
    if (value % 60 === 0) {
      const hours = value / 60;
      return `${hours} hour${hours === 1 ? "" : "s"}`;
    }
    return `${value} minute${value === 1 ? "" : "s"}`;
  };

  const formatChargeWithFallback = (amount, currency, percentage) => {
    const numericAmount = Number.parseFloat(amount);
    if (Number.isFinite(numericAmount)) {
      return `${currency || ""} ${numericAmount.toFixed(2)}`.trim();
    }
    const numericPercentage = Number.parseFloat(percentage);
    if (Number.isFinite(numericPercentage) && numericPercentage > 0) {
      return `${numericPercentage}% of order value`;
    }
    return "N/A";
  };

  const formatTo24Hour = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return "";
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return timeStr;
    const [, h, m] = match;
    return `${String(Number(h)).padStart(2, "0")}:${m}`;
  };

  const formatItemAmount = (value, currencySymbol = "$") => {
    const numericValue = Number.parseFloat(value);
    if (!Number.isFinite(numericValue)) return null;
    return `${currencySymbol}${numericValue.toFixed(2)}`;
  };

  // Memoize active bookings - always compute, regardless of loading state
  const activeBookings = React.useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return null;

    const active = data.data.filter((order) =>
      isActiveBookingStatus(order?.bookingStatus?.title)
    ).sort((a, b) => {
      const dateA = a.createdAt || a.created_at || a.orderDate || a.bookingDate;
      const dateB = b.createdAt || b.created_at || b.orderDate || b.bookingDate;
      if (dateA && dateB) return new Date(dateB) - new Date(dateA);
      if (a.id && b.id) return parseInt(b.id) - parseInt(a.id);
      if (a.collectionDate && b.collectionDate) return new Date(b.collectionDate) - new Date(a.collectionDate);
      return 0;
    });

    return active.length === 0 ? null : active;
  }, [data?.data]);

  // Memoize past bookings - always compute, regardless of loading state
  const pastBookings = React.useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return null;

    const past = data.data.filter((order) =>
      isPastBookingStatus(order?.bookingStatus?.title)
    ).sort((a, b) => {
      const dateA = a.createdAt || a.created_at || a.orderDate || a.bookingDate;
      const dateB = b.createdAt || b.created_at || b.orderDate || b.bookingDate;
      if (dateA && dateB) return new Date(dateB) - new Date(dateA);
      if (a.id && b.id) return parseInt(b.id) - parseInt(a.id);
      if (a.collectionDate && b.collectionDate) return new Date(b.collectionDate) - new Date(a.collectionDate);
      return 0;
    });

    return past.length === 0 ? null : past;
  }, [data?.data]);

  const activeList = activeBookings ?? [];
  const pastList = pastBookings ?? [];
  const visibleBookings = bookingTab === "active" ? activeList : pastList;

  const renderBookingCard = (order) => (
    <div
      key={order.id}
      role="button"
      tabIndex={0}
      onClick={() => handleSelectBooking(order)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelectBooking(order);
        }
      }}
      className="w-full xl:max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-4 sm:px-5 py-3 space-y-2 cursor-pointer"
    >
      <h6 className="font-youth font-bold text-base sm:text-lg">
        Order ID: {order?.orderTrackId}
      </h6>

      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <span
          className={`rounded-full shrink-0 font-youth font-bold text-xs sm:text-sm px-3 py-2 sm:p-3 ${getStatusColorClasses(order?.bookingStatus?.title)}`}
        >
          {order?.bookingStatus?.title}
        </span>
      </div>

      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-3">
        <div className="flex gap-2 items-center py-2">
          <GoArrowUp size={20} className="sm:w-[25px] sm:h-[25px]" />
          <div>
            <p className="font-sf text-sm sm:text-lg text-theme-psGray leading-tight">
              Pick up
            </p>
            <p className="font-sf text-base sm:text-xl">
              {formatDate(order?.collectionDate)}
            </p>
          </div>
        </div>

        <p className="font-youth font-bold text-sm sm:text-base flex items-center gap-2">
          <GoClock size={18} className="sm:w-5 sm:h-5" />
          {formatTo24Hour(order?.collectionTimeFrom)} -{" "}
          {formatTo24Hour(order?.collectionTimeTo)}
        </p>
      </div>

      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex gap-2 items-center py-2">
          <GoArrowUp size={20} className="sm:w-[25px] sm:h-[25px]" />
          <div>
            <p className="font-sf text-sm sm:text-lg text-theme-psGray leading-tight">
              Drop off
            </p>
            <p className="font-sf text-base sm:text-xl">
              {formatDate(order?.deliveryDate)}
            </p>
          </div>
        </div>

        <p className="font-youth font-bold text-sm sm:text-base flex items-center gap-2">
          <GoClock size={18} className="sm:w-5 sm:h-5" />
          {formatTo24Hour(order?.deliveryTimeFrom)} -{" "}
          {formatTo24Hour(order?.deliveryTimeTo)}
        </p>
      </div>

      <p className="font-sf text-base text-theme-psGray">
        {order?.driverInstruction}
      </p>
    </div>
  );

  // Render order details content (reusable for both modal and side panel)
  const renderOrderDetailsContent = ({ panelLayout = false } = {}) => {
    if (!bookingDtails?.data) return null;
    const schedule = resolveBookingSchedule(bookingDtails.data);
    const selectedServices = Array.isArray(
      bookingDtails?.data?.customerSelectedServices
    )
      ? bookingDtails.data.customerSelectedServices
      : [];
    const bookingCurrencySymbol =
      bookingDtails?.data?.paymentSummary?.currencySymbol ||
      bookingDtails?.data?.zone?.currencyUnitZ?.symbol ||
      "$";
    const paymentSummary = bookingDtails?.data?.paymentSummary;
    const hasPaymentSummary = Boolean(paymentSummary?.orderSummary);
    const isCashBooking =
      paymentSummary?.paymentType === "cash" ||
      bookingDtails?.data?.paymentType === "cash";
    const minimumAdjustment = hasPaymentSummary
      ? Number(paymentSummary.minimumAdjustment) ||
        Number(paymentSummary.orderSummary?.minimumAdjustment) ||
        0
      : 0;

    const tipValue = Number.parseFloat(bookingDtails?.data?.tips?.[0]?.amount);
    const discountValue = Number.parseFloat(
      bookingDtails?.data?.billingDetail?.discount
    );

    const servicesSubtotal = (() => {
      if (hasPaymentSummary) {
        return Number(paymentSummary.laundrySubtotal) || 0;
      }
      const fromApi = Number.parseFloat(bookingDtails?.data?.servicesSubtotal);
      if (Number.isFinite(fromApi) && fromApi >= 0) {
        return fromApi;
      }
      const fromBilling = Number.parseFloat(
        bookingDtails?.data?.billingDetail?.categoryCharge
      );
      if (Number.isFinite(fromBilling) && fromBilling >= 0) {
        return fromBilling;
      }
      return 0;
    })();

    const formatBillingLine = (amount, { signed = false } = {}) => {
      const numeric = Number(amount);
      if (!Number.isFinite(numeric)) return `${bookingCurrencySymbol}0.00`;
      const base = `${bookingCurrencySymbol}${Math.abs(numeric).toFixed(2)}`;
      if (!signed) return base;
      if (numeric > 0) return `+${base}`;
      if (numeric < 0) return `-${base}`;
      return base;
    };

    const legacyServiceFeeValue = Number.parseFloat(
      bookingDtails?.data?.billingDetail?.serviceCharge ??
        bookingDtails?.data?.zone?.serviceCharge
    );
    const legacyUpfrontAmountValue = Number.parseFloat(
      bookingDtails?.data?.billingDetail?.upfrontAmount
    );
    const legacyOrderAmountValue = Number.parseFloat(
      bookingDtails?.data?.orderAmount
    );
    const legacyBillingTotalValue = Number.parseFloat(
      bookingDtails?.data?.billingDetail?.total
    );

    const displayServiceFee = hasPaymentSummary
      ? Number(paymentSummary.orderSummary.serviceFee) || 0
      : Number.isFinite(legacyServiceFeeValue)
      ? legacyServiceFeeValue
      : 0;
    const displayTip = hasPaymentSummary
      ? Number(paymentSummary.orderSummary.driverTip) || 0
      : Number.isFinite(tipValue)
      ? tipValue
      : 0;
    const displayDiscount = hasPaymentSummary
      ? Number(paymentSummary.orderSummary.discount) || 0
      : Number.isFinite(discountValue)
      ? discountValue
      : 0;
    const displayTotalOrderAmount = hasPaymentSummary
      ? Number(paymentSummary.orderSummary.totalOrderAmount) || 0
      : servicesSubtotal + displayServiceFee + displayTip;
    const displayPaidAtBooking = hasPaymentSummary
      ? paymentSummary.paidAtBooking
      : {
          minimumOrderPayment: Number.isFinite(legacyUpfrontAmountValue)
            ? legacyUpfrontAmountValue
            : 0,
          serviceFee: displayServiceFee,
          driverTip: displayTip,
          totalPaid:
            (Number.isFinite(legacyUpfrontAmountValue)
              ? legacyUpfrontAmountValue
              : 0) + displayServiceFee + displayTip,
        };
    const displayAmountDueNow = hasPaymentSummary
      ? Number(paymentSummary.amountDueNow) || 0
      : Number.isFinite(legacyBillingTotalValue) && legacyBillingTotalValue > 0
      ? legacyBillingTotalValue
      : Number.isFinite(legacyOrderAmountValue) && legacyOrderAmountValue > 0
      ? legacyOrderAmountValue
      : 0;

    const showInvoiceBreakdown =
      hasPaymentSummary &&
      (servicesSubtotal > 0 ||
        bookingDtails?.data?.invoiceStatus === "finalized" ||
        bookingDtails?.data?.invoiceStatus === "draft");
    const paymentStatus =
      bookingDtails?.data?.billingDetail?.paymentStatus || "Pending";
    const isFullyPaid =
      paymentSummary?.paymentState === "fully_paid" || paymentStatus === "Paid";
    const isOutstanding = !isFullyPaid && displayAmountDueNow > 0;
    const displayPaidLater = paymentSummary?.paidLater;
    const paidLaterAmount = Number(displayPaidLater?.totalPaid) || 0;
    const cashTotalPaid = Number(displayPaidAtBooking?.totalPaid) || 0;
    const showCashPaymentMethodOnly =
      isCashBooking && cashTotalPaid <= 0;
    const paymentStateLabel = paymentSummary?.paymentStateLabel || "";
    const balancePaymentMethod = paymentSummary?.balancePaymentMethod;
    const cashRemaining = paymentSummary?.cashRemaining;
    const balanceCollectionLabel = paymentSummary?.balanceCollectionLabel;

    const cardDetails = bookingDtails?.data?.cardDetails;
    const cardPaymentLabel = getCardPaymentLabel(
      cardDetails,
      bookingDtails?.data?.paymentMethodId
    );
    const cardPaymentSubtext = getCardPaymentSubtext(cardDetails);

    const groupedSelectedServices = selectedServices.reduce((acc, item) => {
      const serviceName = item?.service?.name || "Service";
      if (!acc[serviceName]) {
        acc[serviceName] = [];
      }
      acc[serviceName].push(item);
      return acc;
    }, {});

    const totalBagsCount = (() => {
      const fromTotal = Number(bookingDtails?.data?.totalBags);
      if (Number.isFinite(fromTotal) && fromTotal > 0) return fromTotal;
      const fromPickup = Number(bookingDtails?.data?.noOfBags);
      if (Number.isFinite(fromPickup) && fromPickup > 0) return fromPickup;
      return null;
    })();

    return (
      <>
        {!panelLayout ? (
          <h6 className="font-youth font-bold text-2xl sm:text-3xl md:text-[32px]">
            Order ID: {bookingDtails?.data?.orderTrackId}
          </h6>
        ) : null}

        <div className={`flex justify-between items-center font-sf ${panelLayout ? "pt-1 pb-6" : "pt-3 pb-6"}`}>
          <button
            title={bookingDtails?.data?.bookingStatus?.description}
            className={`rounded-full shrink-0 font-youth font-bold text-sm p-3 ${getStatusColorClasses(bookingDtails?.data?.bookingStatus?.title)}`}
          >
            {bookingDtails?.data?.bookingStatus?.title}
          </button>

          {!isOrderCancelled(bookingDtails?.data) && (
            <p
              onClick={onOpen}
              className="underline underline-offset-4 text-theme-psGray cursor-pointer"
            >
              Track your order
            </p>
          )}
        </div>

        {schedule?.operational ? (
          <div className="rounded-xl bg-[#F5F5F5] px-4 py-3 text-sm font-sf space-y-1 mb-2">
            {schedule.zone?.name ? (
              <p>
                <span className="text-theme-psGray">Service zone: </span>
                <span className="font-medium">{schedule.zone.name}</span>
              </p>
            ) : null}
            {schedule.operational?.displayLabel ? (
              <p>
                <span className="text-theme-psGray">Booking times in: </span>
                <span className="font-medium">
                  {schedule.operational.displayLabel}
                </span>
              </p>
            ) : null}
            {schedule.customerLocal?.ianaTimeZone ? (
              <p>
                <span className="text-theme-psGray">Your timezone: </span>
                <span className="font-medium">
                  {schedule.customerLocal.ianaTimeZone}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="font-sf space-y-3">
            <p className="font-youth font-bold">Collection</p>
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoCalendarOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {formatDate(bookingDtails?.data?.collectionDate)}
              </p>
            </div>
            <div className="flex gap-2 items-start">
              <div className="flex items-center justify-center mt-0.5">
                <IoTimeOutline size="16" />
              </div>
              <BookingSlotTimes
                timeFrom={bookingDtails?.data?.collectionTimeFrom}
                timeTo={bookingDtails?.data?.collectionTimeTo}
                slot={schedule?.collection}
                operationalShortLabel={schedule?.operational?.shortLabel}
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoInformationCircleOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {bookingDtails?.data?.driverInstructionOptions}
              </p>
            </div>
          </div>
          <div className="font-sf space-y-3">
            <p className="font-youth font-bold">Delivery</p>
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoCalendarOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {formatDate(bookingDtails?.data?.deliveryDate)}
              </p>
            </div>
            <div className="flex gap-2 items-start">
              <div className="flex items-center justify-center mt-0.5">
                <IoTimeOutline size="16" />
              </div>
              <BookingSlotTimes
                timeFrom={bookingDtails?.data?.deliveryTimeFrom}
                timeTo={bookingDtails?.data?.deliveryTimeTo}
                slot={schedule?.delivery}
                operationalShortLabel={schedule?.operational?.shortLabel}
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoInformationCircleOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {bookingDtails?.data?.driverInstructionOptions1}
              </p>
            </div>
          </div>
          {totalBagsCount != null ? (
            <div className="font-sf space-y-3">
              <p className="font-youth font-bold">Bags</p>
              <div className="flex gap-2 items-center">
                <div className="flex items-center justify-center">
                  <IoBagCheck size="16" />
                </div>
                <p className="text-sm font-medium">
                  Total bags: {totalBagsCount}
                </p>
              </div>
            </div>
          ) : null}
          <div className="font-sf space-y-3">
            <p className="font-youth font-bold">Address</p>
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoLocationOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {bookingDtails?.data?.dropOffAddress?.streetAddress}
              </p>
            </div>
          </div>
          <div className="font-sf space-y-3">
            <p className="font-youth font-bold">Driver Instruction</p>
            <p className="text-sm font-medium font-sf">
              {bookingDtails?.data?.driverInstruction}
            </p>
          </div>
          <div className="font-sf space-y-3">
            <p className="font-youth font-bold">Order frequency</p>
            <p className="text-sm font-medium font-sf">
              {bookingDtails?.data?.frequency}
            </p>
          </div>

          <BookingPolicySummary
            orderStatusContext={bookingDtails?.data?.orderStatusContext}
            cancellationPolicy={bookingDtails?.data?.cancellationPolicy}
            cancellationSummary={bookingDtails?.data?.cancellationSummary}
            noShowPolicy={bookingDtails?.data?.noShowPolicy}
            noShowSummary={bookingDtails?.data?.noShowSummary}
          />

          {!isOrderCancelled(bookingDtails?.data) && (
            <PurpleButton
              text="Manage Order"
              bg="bg-theme-blue"
              color="text-white"
              onClick={onManageOrderModalOpen}
            />
          )}
        </div>

        {/* Order Details Section - Always visible below Manage Order button */}
        <div className="space-y-3 mt-8">
          <button
            type="button"
            onClick={() => setIsOrderItemsExpanded((prev) => !prev)}
            className="w-full flex justify-between items-center border-b py-2"
          >
            <div className="font-sf text-left">
              <h6 className="font-semibold text-xl">Order details</h6>
              <p className="text-theme-psGray">
                {totalBagsCount != null
                  ? `${totalBagsCount} bag${totalBagsCount === 1 ? "" : "s"}`
                  : null}
              </p>
            </div>
            <MdKeyboardArrowRight
              size="25"
              className={`transition-transform duration-200 ${isOrderItemsExpanded ? "rotate-90" : "rotate-0"}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out ${
              isOrderItemsExpanded
                ? "max-h-[min(75vh,680px)] opacity-100 mt-2"
                : "max-h-0 opacity-0 mt-0"
            }`}
          >
            <div className="max-h-[min(75vh,680px)] overflow-y-auto overscroll-y-contain">
              <div className="space-y-2 font-sf border-b pb-3">
              {Object.keys(groupedSelectedServices).length > 0 ? (
                Object.entries(groupedSelectedServices).map(
                  ([serviceName, items], serviceIdx) => (
                    <div
                      key={`${serviceName}-${serviceIdx}`}
                      className="rounded-lg border border-gray-100 bg-[#FBFBFB] px-3 py-2 space-y-2"
                    >
                      <p className="font-semibold text-sm">{serviceName}</p>

                      <div className="space-y-2">
                        {items.map((item, index) => {
                          const categoryName = item?.category?.name || "";
                          const subCategoryName = item?.subCategory?.name || "";
                          const quantity = Number(item?.items);
                          const unitPrice = Number.parseFloat(
                            item?.categoryprice ?? item?.subCategory?.price
                          );
                          const hasQty = Number.isFinite(quantity) && quantity > 0;
                          const hasPrice = Number.isFinite(unitPrice);
                          const lineTotal =
                            hasQty && hasPrice ? unitPrice * quantity : unitPrice;
                          const addOns = Array.isArray(item?.addOns) ? item.addOns : [];

                          return (
                            <div
                              key={`${item?.serviceId || "service"}-${item?.categoryId || "cat"}-${item?.subCategoryId || "sub"}-${index}`}
                              className="space-y-1.5 border-t border-gray-200 pt-2 first:border-t-0 first:pt-0"
                            >
                              <div className="flex items-start justify-between gap-3">
                              <div className="space-y-0.5">
                                {categoryName && (
                                  <p className="text-xs text-theme-psGray">
                                    Category: {categoryName}
                                  </p>
                                )}
                                {subCategoryName && (
                                  <p className="text-xs text-theme-psGray">
                                    Item: {subCategoryName}
                                  </p>
                                )}
                                {!categoryName && !subCategoryName && (
                                  <p className="text-xs text-theme-psGray">
                                    Selected service
                                  </p>
                                )}
                                {item?.date && (
                                  <p className="text-xs text-theme-psGray">
                                    Added: {formatDate(item.date)}
                                    {item?.time
                                      ? `, ${formatTo24Hour(item.time)}`
                                      : ""}
                                  </p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                {hasQty && (
                                  <p className="text-xs text-theme-psGray">
                                    Qty: {quantity}
                                  </p>
                                )}
                                {(formatItemAmount(lineTotal, bookingCurrencySymbol) ||
                                  formatItemAmount(unitPrice, bookingCurrencySymbol)) && (
                                  <p className="text-sm font-semibold">
                                    {formatItemAmount(lineTotal, bookingCurrencySymbol) ||
                                      formatItemAmount(unitPrice, bookingCurrencySymbol)}
                                  </p>
                                )}
                              </div>
                              </div>

                              {addOns.length > 0 && (
                                <div className="ml-2 space-y-1.5 border-l-2 border-theme-blue/20 pl-3">
                                  {addOns.map((addOn, addOnIndex) => {
                                    const addOnName =
                                      addOn?.addOnService?.name || "Add-on";
                                    const addOnQty =
                                      Number.parseInt(addOn?.items, 10) > 0
                                        ? Number.parseInt(addOn.items, 10)
                                        : 1;
                                    const addOnUnitPrice = Number.parseFloat(
                                      addOn?.price ?? addOn?.addOnService?.price
                                    );
                                    const parsedLineTotal = Number.parseFloat(
                                      addOn?.lineTotal
                                    );
                                    const addOnLineTotal = Number.isFinite(
                                      parsedLineTotal
                                    )
                                      ? parsedLineTotal
                                      : Number.isFinite(addOnUnitPrice)
                                        ? addOnUnitPrice * addOnQty
                                        : null;

                                    return (
                                      <div
                                        key={`${addOn?.id || addOn?.addOnServiceId || addOnIndex}`}
                                        className="flex items-start justify-between gap-3"
                                      >
                                        <div className="space-y-0.5">
                                          <p className="text-xs text-theme-psGray">
                                            Add-on: {addOnName}
                                          </p>
                                          {Number.isFinite(addOnQty) && addOnQty > 0 && (
                                            <p className="text-xs text-theme-psGray">
                                              Qty: {addOnQty}
                                            </p>
                                          )}
                                        </div>
                                        {formatItemAmount(
                                          addOnLineTotal,
                                          bookingCurrencySymbol
                                        ) && (
                                          <p className="text-xs font-semibold shrink-0">
                                            {formatItemAmount(
                                              addOnLineTotal,
                                              bookingCurrencySymbol
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-theme-psGray">No item details available.</p>
              )}
              </div>
            </div>
          </div>
          <div className="font-sf space-y-3 pt-4 pb-3">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex justify-between items-center gap-4">
                <p className="text-sm font-semibold">Laundry subtotal</p>
                <p className="text-sm font-semibold shrink-0">
                  {formatBillingLine(servicesSubtotal)}
                </p>
              </div>
            </div>

            {showInvoiceBreakdown ? (
              <div className="rounded-xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 space-y-2">
                <p className="text-xs text-theme-psGray">
                  The minimum order payment is not added again as a separate
                  charge.
                </p>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-theme-psGray">Laundry subtotal</p>
                  <p className="text-sm shrink-0">
                    {formatBillingLine(servicesSubtotal)}
                  </p>
                </div>
                {minimumAdjustment > 0 ? (
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-sm text-theme-psGray">Minimum order adjustment</p>
                    <p className="text-sm shrink-0">
                      {formatBillingLine(minimumAdjustment)}
                    </p>
                  </div>
                ) : null}
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-theme-psGray">Service fee</p>
                  <p className="text-sm shrink-0">
                    {formatBillingLine(displayServiceFee)}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-theme-psGray">Driver tip</p>
                  <p className="text-sm shrink-0">
                    {formatBillingLine(displayTip)}
                  </p>
                </div>
                {displayDiscount > 0 ? (
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-sm text-theme-psGray">Discount</p>
                    <p className="text-sm shrink-0">
                      {formatBillingLine(-displayDiscount, { signed: true })}
                    </p>
                  </div>
                ) : null}
                <div className="flex justify-between items-center gap-4 pt-2 border-t border-gray-200">
                  <p className="text-sm font-semibold">Total order amount</p>
                  <p className="text-sm font-semibold shrink-0">
                    {formatBillingLine(displayTotalOrderAmount)}
                  </p>
                </div>
              </div>
            ) : null}

            {showCashPaymentMethodOnly ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">Payment method</p>
                <p className="text-sm text-amber-800 mt-1">Cash</p>
                {paymentStateLabel ? (
                  <p className="text-xs text-amber-700 mt-1">{paymentStateLabel}</p>
                ) : null}
              </div>
            ) : !isCashBooking ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-2">
                <p className="text-sm font-semibold text-emerald-900">
                  Paid at booking
                </p>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-emerald-800">
                    Minimum order payment
                    <span className="block text-xs text-emerald-700">
                      Applied to laundry subtotal
                    </span>
                  </p>
                  <p className="text-sm shrink-0 text-emerald-900">
                    {formatBillingLine(displayPaidAtBooking.minimumOrderPayment)}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-emerald-800">Service fee</p>
                  <p className="text-sm shrink-0 text-emerald-900">
                    {formatBillingLine(displayPaidAtBooking.serviceFee)}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-emerald-800">Driver tip</p>
                  <p className="text-sm shrink-0 text-emerald-900">
                    {formatBillingLine(displayPaidAtBooking.driverTip)}
                  </p>
                </div>
                <div className="flex justify-between items-center gap-4 pt-2 border-t border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-900">
                    Total paid
                  </p>
                  <p className="text-sm font-semibold shrink-0 text-emerald-900">
                    {formatBillingLine(displayPaidAtBooking.totalPaid)}
                  </p>
                </div>
                {displayPaidAtBooking?.label ? (
                  <p className="text-xs text-emerald-700">{displayPaidAtBooking.label}</p>
                ) : null}
              </div>
            ) : null}

            {paidLaterAmount > 0 ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-2">
                <p className="text-sm font-semibold text-blue-900">Paid later</p>
                {displayPaidLater?.label ? (
                  <p className="text-xs text-blue-800">{displayPaidLater.label}</p>
                ) : null}
                <div className="flex justify-between items-center gap-4 pt-1">
                  <p className="text-sm font-semibold text-blue-900">Total paid</p>
                  <p className="text-sm font-semibold shrink-0 text-blue-900">
                    {formatBillingLine(paidLaterAmount)}
                  </p>
                </div>
              </div>
            ) : null}

            {showInvoiceBreakdown ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-semibold text-sky-900">
                      {isCashBooking ? "Pay cash on delivery" : "Amount due now"}
                    </p>
                    <p className="text-xs text-sky-800 mt-1">
                      {isCashBooking
                        ? `${formatBillingLine(displayTotalOrderAmount)} total due in cash`
                        : balancePaymentMethod === "cash" && isOutstanding
                          ? `${formatBillingLine(displayAmountDueNow)} balance to pay in cash`
                          : `${formatBillingLine(displayTotalOrderAmount)} actual total − ${formatBillingLine(displayPaidAtBooking.totalPaid)} already paid`}
                    </p>
                    {balanceCollectionLabel && isOutstanding ? (
                      <p className="text-xs text-sky-700 mt-1">{balanceCollectionLabel}</p>
                    ) : null}
                    {paymentStateLabel && isOutstanding ? (
                      <p className="text-xs text-sky-700 mt-1">{paymentStateLabel}</p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-sky-900">
                      {formatBillingLine(displayAmountDueNow)}
                    </p>
                    {isOutstanding ? (
                      <span className="inline-block mt-1 rounded-full bg-sky-200 px-2 py-0.5 text-xs font-semibold text-sky-900">
                        {cashRemaining ? "Cash due" : "Outstanding"}
                      </span>
                    ) : (
                      <span className="inline-block mt-1 rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {(bookingDtails?.data?.paymentMethodId ||
            bookingDtails?.data?.paymentId ||
            bookingDtails?.data?.bookingPaymentId ||
            cardDetails ||
            paidLaterAmount > 0) && (
            <div className="space-y-1 font-sf border-b pb-3">
              <h4 className="font-semibold text-2xl">Payment</h4>
              {Number(displayPaidAtBooking?.totalPaid) > 0 ? (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h6>{cardPaymentLabel}</h6>
                    <p className="text-sm text-theme-psGray">
                      {displayPaidAtBooking?.label || "Paid by card"} — upfront
                    </p>
                    {bookingDtails?.data?.createdAt && (
                      <p className="text-sm text-theme-psGray">
                        {formatDate(bookingDtails.data.createdAt)}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">
                    {formatBillingLine(displayPaidAtBooking.totalPaid)}
                  </p>
                </div>
              ) : null}
              {paidLaterAmount > 0 ? (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h6>
                      {displayPaidLater?.method === "cash"
                        ? "Cash"
                        : displayPaidLater?.label || "Balance payment"}
                    </h6>
                    <p className="text-sm text-theme-psGray">
                      {displayPaidLater?.label || "Paid at delivery"}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatBillingLine(paidLaterAmount)}
                  </p>
                </div>
              ) : null}
              {(bookingDtails?.data?.paymentId ||
                bookingDtails?.data?.bookingPaymentId) && (
                <p className="text-sm text-theme-psGray pb-2">
                  Payment ID:{" "}
                  {bookingDtails?.data?.paymentId ||
                    bookingDtails?.data?.bookingPaymentId}
                </p>
              )}
              <div className="py-2">
                <PurpleButton text="Send receipt to email" />
              </div>
            </div>
          )}
          {/* Proof of Collection Section */}
          {getProofOfCollection().length > 0 && (
            <div className="space-y-1 font-sf pb-3 border-b">
              <h4 className="font-semibold text-2xl">Proof of Collection</h4>
              {getProofSectionNote("pickUp") ? (
                <div className="rounded-xl bg-[#F5F5F5] px-4 py-3 mt-2">
                  <p className="text-xs font-semibold text-theme-psGray uppercase tracking-wide">
                    Agent note
                  </p>
                  <p className="text-sm text-black mt-1 whitespace-pre-wrap">
                    {getProofSectionNote("pickUp")}
                  </p>
                </div>
              ) : null}
              <div className="py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                  {getProofOfCollection().map((proof, index) => {
                    const imageUrl = getImageUrl(proof.imgUpload);
                    if (!imageUrl) return null;

                    return (
                      <div key={proof.id || index} className="space-y-2">
                        <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Proof of collection ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        {proof.noOfItems !== undefined && proof.noOfItems !== null && (
                          <p className="text-xs text-theme-psGray text-center">
                            Items: {proof.noOfItems}
                          </p>
                        )}
                        {proof.noOfBags !== undefined && proof.noOfBags !== null && (
                          <p className="text-xs text-theme-psGray text-center">
                            Bags: {proof.noOfBags}
                          </p>
                        )}
                        {proof.createdAt && (
                          <p className="text-xs text-theme-psGray text-center">
                            {formatDate(proof.createdAt)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Proof of Delivery Section */}
          {getProofOfDelivery().length > 0 && (
            <div className="space-y-1 font-sf pb-3 border-b">
              <h4 className="font-semibold text-2xl">Proof of Delivery</h4>
              {getProofSectionNote("dropOff") ? (
                <div className="rounded-xl bg-[#F5F5F5] px-4 py-3 mt-2">
                  <p className="text-xs font-semibold text-theme-psGray uppercase tracking-wide">
                    Agent note
                  </p>
                  <p className="text-sm text-black mt-1 whitespace-pre-wrap">
                    {getProofSectionNote("dropOff")}
                  </p>
                </div>
              ) : null}
              <div className="py-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                  {getProofOfDelivery().map((proof, index) => {
                    const imageUrl = getImageUrl(proof.imgUpload);
                    if (!imageUrl) return null;

                    return (
                      <div key={proof.id || index} className="space-y-2">
                        <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Proof of delivery ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        {proof.noOfItems !== undefined && proof.noOfItems !== null && (
                          <p className="text-xs text-theme-psGray text-center">
                            Items: {proof.noOfItems}
                          </p>
                        )}
                        {proof.noOfBags !== undefined && proof.noOfBags !== null && (
                          <p className="text-xs text-theme-psGray text-center">
                            Bags: {proof.noOfBags}
                          </p>
                        )}
                        {proof.createdAt && (
                          <p className="text-xs text-theme-psGray text-center">
                            {formatDate(proof.createdAt)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // Handle Schedule Again - pre-fill order data from current booking
  const handleScheduleAgain = () => {
    if (!bookingDtails?.data) {
      addToast({
        title: "Error",
        description: "Order details not available",
        color: "danger",
      });
      return;
    }

    const booking = bookingDtails.data;
    const pickupAddress = booking.pickupAddress || booking.pickUpAddress || {};
    const dropOffAddress = booking.dropOffAddress || {};
    const clientTimeZone =
      Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
    const serviceTimeZone =
      booking?.zone?.timeZone ||
      booking?.zone?.timezone ||
      booking?.zone?.tz ||
      null;
    const normalizeDate = (value) => {
      if (!value) return "";
      if (typeof value === "string") {
        return value.includes("T") ? value.split("T")[0] : value;
      }
      return "";
    };
    const rescheduleServices = Array.isArray(booking?.customerSelectedServices)
      ? booking.customerSelectedServices
          .filter((item) => item?.serviceId)
          .map((item) => {
            const categoryCharge =
              Number.parseFloat(item?.categoryprice) ||
              Number.parseFloat(item?.subCategory?.price) ||
              0;
            return {
              serviceId: Number(item.serviceId),
              categoryId: item?.categoryId ? Number(item.categoryId) : null,
              subCategoryId: item?.subCategoryId
                ? Number(item.subCategoryId)
                : null,
              categoryCharge: Number.isFinite(categoryCharge) ? categoryCharge : 0,
            };
          })
      : [];

    // Map booking data to order data structure
    const orderData = {
      rescheduleData: {
        isReschedule: true,
        bookingId: Number(booking?.id),
        reasonText: "My plans changed",
        services: rescheduleServices,
        timeZone: serviceTimeZone || clientTimeZone,
        clientTimeZone,
      },
      collectionData: {
        collectionDate: normalizeDate(booking.collectionDate),
        collectionTimeFrom: booking.collectionTimeFrom || "",
        collectionTimeTo: booking.collectionTimeTo || "",
        driverInstructionOptions: booking.driverInstructionOptions || "",
        streetAddress: pickupAddress.streetAddress || "",
        district: pickupAddress.district || "",
        city: pickupAddress.city || "",
        province: pickupAddress.province || "",
        country: pickupAddress.country || "",
        postalCode: pickupAddress.postalcode || pickupAddress.postalCode || "",
        lat: pickupAddress.lat ?? null,
        lng: pickupAddress.lng ?? null,
        title: pickupAddress.title || "Home",
        hotelName: pickupAddress.hotelName || null,
        apartmentNumber: pickupAddress.apartmentNumber || null,
        floor: pickupAddress.floor || null,
        addressType: "pickUp",
        save: false,
        timeZone: serviceTimeZone || clientTimeZone,
        clientTimeZone,
      },
      deliveryData: {
        deliveryDate: normalizeDate(booking.deliveryDate),
        deliveryTimeFrom: booking.deliveryTimeFrom || "",
        deliveryTimeTo: booking.deliveryTimeTo || "",
        driverInstructionOptions1: booking.driverInstructionOptions1 || "",
        streetAddress: dropOffAddress.streetAddress || "",
        district: dropOffAddress.district || "",
        city: dropOffAddress.city || "",
        province: dropOffAddress.province || "",
        country: dropOffAddress.country || "",
        postalCode: dropOffAddress.postalcode || dropOffAddress.postalCode || "",
        lat: dropOffAddress.lat ?? null,
        lng: dropOffAddress.lng ?? null,
        title: dropOffAddress.title || "Home",
        hotelName: dropOffAddress.hotelName || null,
        apartmentNumber: dropOffAddress.apartmentNumber || null,
        floor: dropOffAddress.floor || null,
        addressType: "dropOff",
      },
      driverInstruction: booking.driverInstruction || "",
      frequency: booking.frequency || "Just once",
      timeZone: serviceTimeZone || clientTimeZone,
      clientTimeZone,
    };

    // Dispatch order data to Redux
    dispatch(setOrderData(orderData));

    // Navigate to place-order page
    router.push("/place-order");
  };

  const cancellationPolicySummary = React.useMemo(() => {
    const activeCancellationPolicy =
      activePoliciesData?.data?.activeCancellationPolicy;
    const cfg = activeCancellationPolicy?.cancellationConfig;
    if (!cfg) return null;

    const formatWindow = (mins) => {
      const value = Number(mins);
      if (!Number.isFinite(value) || value <= 0) return "no free window";
      if (value % 60 === 0) {
        const hrs = value / 60;
        return `${hrs} hour${hrs === 1 ? "" : "s"}`;
      }
      return `${value} minute${value === 1 ? "" : "s"}`;
    };

    const formatAmount = (currency, amount) => {
      const value = Number.parseFloat(amount);
      if (!Number.isFinite(value)) return null;
      return `${currency || ""} ${value.toFixed(2)}`.trim();
    };

    const formatPercent = (value) => {
      const num = Number.parseFloat(value);
      if (!Number.isFinite(num) || num <= 0) return null;
      return `${num}% of order value`;
    };

    const lateFee =
      formatAmount(cfg.prePickupAbsoluteCurrency, cfg.prePickupAbsoluteAmount) ||
      formatPercent(cfg.prePickupPercentage) ||
      "policy-based";
    const unprocessedFee =
      formatAmount(
        cfg.unprocessedAbsoluteCurrency,
        cfg.unprocessedAbsoluteAmount
      ) ||
      formatPercent(cfg.unprocessedOrderValuePercentage) ||
      formatPercent(cfg.unprocessedPercentage) ||
      "policy-based";

    return {
      name: activeCancellationPolicy?.name || "Cancellation Policy",
      freeWindow: formatWindow(cfg.prePickupFreeChargeWindowMinutes),
      lateFee,
      allowUnprocessed: cfg.allowCancelUnprocessed,
      unprocessedFee,
      unprocessedAfterMinutes: Number(cfg.unprocessedAfterPickupMinutes) || 0,
    };
  }, [activePoliciesData]);

  return (
    <section className="w-full md:mt-6 px-4 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-10">
      <h2 className="font-youth font-medium text-2xl sm:text-3xl md:text-[40px] mb-4 pt-4 sm:pt-8 md:pt-4">
        Here's What You've Ordered
      </h2>

      <div className="w-full flex flex-col md:flex-row md:items-start gap-5 min-h-0">
        <div className="w-full font-sf space-y-5">
          {/* Loading Spinner */}
          {isLoading ? (
            <div className="w-full flex items-center justify-center py-20">
              <Spinner
                size="lg"
                label="Loading orders..."
                classNames={{
                  label: "text-foreground mt-4 font-youth font-semibold text-theme-blue",
                }}
                variant="wave"
              />
            </div>
          ) : (
            <>
              <div className="inline-flex w-full sm:w-auto p-1 rounded-full bg-[#F0F2F7] border border-[#E4E8F0] mb-5">
                <button
                  type="button"
                  onClick={() => setBookingTab("active")}
                  className={`flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-full font-youth font-bold text-sm sm:text-base transition-all duration-200 ${
                    bookingTab === "active"
                      ? "bg-theme-blue text-white shadow-sm"
                      : "text-theme-psGray hover:text-gray-900"
                  }`}
                >
                  Active
                  {activeList.length > 0 ? (
                    <span
                      className={`ml-2 text-xs font-sf font-semibold ${
                        bookingTab === "active" ? "text-white/80" : "text-theme-psGray"
                      }`}
                    >
                      ({activeList.length})
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setBookingTab("past")}
                  className={`flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-full font-youth font-bold text-sm sm:text-base transition-all duration-200 ${
                    bookingTab === "past"
                      ? "bg-theme-blue text-white shadow-sm"
                      : "text-theme-psGray hover:text-gray-900"
                  }`}
                >
                  Past
                  {pastList.length > 0 ? (
                    <span
                      className={`ml-2 text-xs font-sf font-semibold ${
                        bookingTab === "past" ? "text-white/80" : "text-theme-psGray"
                      }`}
                    >
                      ({pastList.length})
                    </span>
                  ) : null}
                </button>
              </div>

              {visibleBookings.length > 0 ? (
                <div className="space-y-5">
                  {visibleBookings.map((order) => renderBookingCard(order))}
                </div>
              ) : (
                <div className="w-full xl:max-w-[859px] rounded-2xl border border-dashed border-[#D9DEE8] bg-[#FBFBFB] px-6 py-12 text-center">
                  <p className="font-youth font-bold text-lg text-theme-blue">
                    {bookingTab === "active"
                      ? "No active bookings"
                      : "No past bookings"}
                  </p>
                  <p className="font-sf text-sm text-theme-psGray mt-2">
                    {bookingTab === "active"
                      ? "Your current orders will appear here."
                      : "Completed and cancelled orders will appear here."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop/Tablet Side Panel - Hidden on mobile */}
        {manageOrder?.orderId ? (
          <div
            className={`hidden md:flex md:flex-col w-full max-w-[600px] shrink-0 min-h-0 sticky top-4 self-start h-[calc(100vh-6rem)] overflow-hidden shadow-theme-shadow-light rounded-[20px] transition-all duration-500 ease-in-out ${
              showOrderDetails || isBookingDetailsLoading
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4"
            }`}
          >
            {bookingDtails?.data?.orderTrackId ? (
              <div
                className={`pointer-events-none absolute transition-all duration-300 ease-in-out font-sf ${
                  panelScroll
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
                } top-0 left-0 z-20 bg-white w-full shadow-md rounded-t-[20px]`}
              >
                <div className="flex justify-center items-center w-full h-[58px] px-4">
                  <h2
                    className={`font-youth font-bold sm:text-[22px] text-center transition-all duration-500 ease-in-out ${
                      panelScroll
                        ? "translate-y-0 opacity-100 delay-500"
                        : "-translate-y-4 opacity-0 delay-0"
                    }`}
                  >
                    Order ID: {bookingDtails.data.orderTrackId}
                  </h2>
                </div>
              </div>
            ) : null}

            <div
              onScroll={handlePanelScroll}
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain hideScrollbar modal-scroll px-4 sm:px-6 pt-4 pb-8"
            >
              {bookingDtails?.data?.orderTrackId && !isBookingDetailsLoading ? (
                <div className="h-[58px] shrink-0 flex items-center justify-center relative border-b border-theme-gray-2 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2">
                  <h4 className="font-youth font-bold sm:text-[22px] text-center">
                    Order ID: {bookingDtails.data.orderTrackId}
                  </h4>
                </div>
              ) : null}
              {renderOrderDetailsPanel({ panelLayout: true })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Mobile Order Details Modal - Bottom Sheet */}
      <ReusableModal
        isDismissable={true}
        isOpen={isOrderDetailsModalOpen}
        onOpenChange={(open) => {
          onOrderDetailsModalOpenChange(open);
          if (!open) {
            setManageOrder({ manage: false, modType: "track", orderId: "" });
          }
        }}
        onClose={onOrderDetailsModalClose}
        size="full"
        placement="bottom"
        className="md:hidden"
        classNames={{
          base: "h-[90vh] !my-0 mx-0 rounded-t-3xl rounded-b-none",
        }}
        motionProps={{
          initial: { y: "100%", opacity: 0 },
          animate: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
          },
          exit: {
            y: "100%",
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" },
          },
        }}
      >
        <div className="w-full h-full px-4 sm:px-6 py-4 overflow-y-auto">
          {renderOrderDetailsPanel()}
        </div>
      </ReusableModal>

      {/* =======================Modal======================== */}

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        showHeader={true}
        headerTitle="Service Preferences"
        modalScroll={modalScroll}
        onBack={false}
        onClose={false}
        showFooter={false}
        // footerContent={
        //   <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
        //     <ButtonYouth70018 text="continue" />
        //   </div>
        // }
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class max-h-[90vh] overflow-auto"
      >
        {manageOrder?.modType === "track" ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Order ID: {bookingDtails?.data?.orderTrackId}
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-4 font-sf flex justify-between items-center">
              <p className="font-sf font-semibold cursor-pointer">
                Order Status
              </p>
              <button className={`rounded-full shrink-0 font-youth font-bold text-sm px-3 py-1.5 ${getStatusColorClasses(bookingDtails?.data?.bookingStatus?.title)}`}>
                {bookingDtails?.data?.bookingStatus?.title}
              </button>
            </div>

            <div className="w-full px-6 py-2 font-sf">
              <p className="text-theme-psGray text-sm w-max ml-auto">
                02-13-2025, 12:40
              </p>
              <div className="flex items-center gap-5">
                <div>
                  <img src="/images/statuses/image1.png" alt="status image" />
                </div>

                <div>
                  <h6 className="font-semibold">Order Created</h6>
                  <p className="text-theme-psGray text-sm">
                    Your Order has been created
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full px-6 py-2 font-sf">
              <p className="text-theme-psGray text-sm w-max ml-auto">
                02-13-2025, 12:40
              </p>
              <div className="flex items-center gap-5">
                <div>
                  <img src="/images/statuses/image2.png" alt="status image" />
                </div>

                <div>
                  <h6 className="font-semibold">Order Confirmed</h6>
                  <p className="text-theme-psGray text-sm line-clamp-2">
                    The booking has been confirmed and is ready for co...
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full px-6 py-2 font-sf mb-5">
              <p className="text-theme-psGray text-sm w-max ml-auto">
                02-13-2025, 12:40
              </p>
              <div className="flex items-center gap-5">
                <div>
                  <img src="/images/statuses/image3.png" alt="status image" />
                </div>

                <div>
                  <h6 className="font-semibold">Driver Out for PickUp</h6>
                  <p className="text-theme-psGray text-sm line-clamp-2">
                    Driver accepted the booking and coming for lau...
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : manageOrder?.modType === "iron" ? (
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
              <div className="space-y-2">
                <p className="font-sf text-lg">After ironing:</p>
                <div className="grid grid-cols-2 h-[53px]">
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        ironingAfter: "hung",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${preferences.ironingAfter === "hung"
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
        ) : (
          "dddd"
        )}
      </ReusableModal>

      {/* Cancel Order Confirmation Modal */}
      <ReusableModal
        isDismissable={true}
        isOpen={isCancelModalOpen}
        onOpenChange={onCancelModalOpenChange}
        showHeader={true}
        headerTitle="Cancel Order"
        modalScroll={false}
        onBack={false}
        onClose={false}
        showFooter={true}
        footerContent={
          <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
            <button
              onClick={onCancelModalClose}
              className="w-full rounded-2xl h-12 font-youth text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
            >
              Keep Order
            </button>
            <button
              onClick={handleConfirmCancellation}
              disabled={!cancellationReason || isCancelling}
              className={`w-full rounded-2xl h-12 font-youth text-sm flex items-center justify-center gap-2 ${cancellationReason && !isCancelling
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } transition-colors`}
            >
              {isCancelling ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Cancelling...</span>
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </div>
        }
        onFooterAction={() => false}
        size="md"
        backdrop="blur"
        className="custom-modal-class"
      >
        <div className="w-full px-6 py-6 font-sf">
          <div className="space-y-6">
            {/* Confirmation Message */}
            <div className="text-center">
              <p className="font-sf text-lg text-gray-700 mb-2">
                Are you sure you want to cancel this order?
              </p>
              <p className="font-sf text-sm text-gray-500">
                Order ID: {bookingDtails?.data?.orderTrackId}
              </p>
            </div>

            {/* Cancellation Reason Dropdown */}
            <div>
              {isLoadingReasons ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                  <span className="ml-2 font-sf text-sm text-gray-500">Loading reasons...</span>
                </div>
              ) : cancellationReasons.length === 0 ? (
                <div className="text-center py-4">
                  <p className="font-sf text-sm text-gray-500">No cancellation reasons available</p>
                </div>
              ) : (
                <SelectHero
                  label="Reason for cancellation"
                  list={cancellationReasons}
                  value={cancellationReason ? [cancellationReason] : []}
                  onChange={(e) => {
                    // Extract value from event - HeroUI Select may pass different formats
                    let value = "";
                    if (typeof e === "string") {
                      value = e;
                    } else if (e?.target?.value) {
                      value = e.target.value;
                    } else if (e?.currentTarget?.value) {
                      value = e.currentTarget.value;
                    } else if (e?.detail?.value) {
                      value = e.detail.value;
                    }
                    setCancellationReason(value);
                  }}
                />
              )}
            </div>

            {/* Cancellation fee preview for this order */}
            {bookingDtails?.data?.cancellationSummary ? (
              <CancellationSummaryCard
                cancellationPolicy={bookingDtails.data.cancellationPolicy}
                cancellationSummary={bookingDtails.data.cancellationSummary}
                compact
              />
            ) : cancellationPolicySummary ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <p className="font-sf text-sm font-semibold text-gray-800">
                  Active Cancellation Policy ({cancellationPolicySummary.name})
                </p>
                <p className="font-sf text-xs text-gray-700">
                  Free cancellation window: {cancellationPolicySummary.freeWindow}
                </p>
                <p className="font-sf text-xs text-gray-700">
                  Late cancellation fee: {cancellationPolicySummary.lateFee}
                </p>
                <p className="font-sf text-xs text-gray-700">
                  Unprocessed bookings:{" "}
                  {cancellationPolicySummary.allowUnprocessed ? "Allowed" : "Not allowed"}
                  {cancellationPolicySummary.allowUnprocessed
                    ? ` (fee ${cancellationPolicySummary.unprocessedFee}${
                      cancellationPolicySummary.unprocessedAfterMinutes > 0
                        ? ` after ${cancellationPolicySummary.unprocessedAfterMinutes} minutes from pickup`
                        : ""
                    })`
                    : ""}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </ReusableModal>

      {/* Manage Order Modal */}
      <ReusableModal
        isDismissable={true}
        isOpen={isManageOrderModalOpen}
        onOpenChange={onManageOrderModalOpenChange}
        showHeader={false}
        headerTitle=""
        modalScroll={false}
        onBack={false}
        onClose={false}
        showFooter={false}
        onFooterAction={() => false}
        size="md"
        backdrop="blur"
        className="custom-modal-class"
      >
        <div className="w-full px-6 py-6 font-sf">
          <div className="space-y-4">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={onManageOrderModalClose}
                className="bg-gray-200 hover:bg-gray-300 rounded-full cursor-pointer duration-150 size-10 flex justify-center items-center"
              >
                <IoClose size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h2 className="font-youth font-bold text-2xl mb-2 text-gray-800">
                Manage Order
              </h2>
              <p className="font-sf text-lg text-gray-700 mb-2">
                What would you like to do with this order?
              </p>
              <p className="font-sf text-sm text-gray-500">
                Order ID: {bookingDtails?.data?.orderTrackId}
              </p>
            </div>

            <div className="space-y-3">
              <PurpleButton
                onClick={() => {
                  onManageOrderModalClose();
                  handleScheduleAgain();
                }}
                text="Reschedule"
                bg="bg-theme-blue"
                color="text-white"
              />
              <PurpleButton
                onClick={() => {
                  onManageOrderModalClose();
                  handleCancelClick();
                }}
                text={isCheckingCancellation ? "Checking..." : "Cancel Order"}
                bg="bg-red-500"
                color="text-white"
                disabled={isCheckingCancellation}
              />
            </div>
          </div>
        </div>
      </ReusableModal>
    </section>
  );
}
