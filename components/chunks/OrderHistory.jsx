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
import { formatDate, formatTimeToAmPm } from "../../utilities/ConversionFunction";
import ReusableModal from "../Modal";
import { useDisclosure, Spinner, addToast } from "@heroui/react";
import SelectHero from "../SelectHero";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setOrderData } from "@/app/store/slices/cartItemSlice";
import { BASE_URL } from "../../utilities/URL";

export default function OrderHistory() {
  const router = useRouter();
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

  const { data: bookingDtails, isLoading: bookingDetailsLoading } =
    useBookingDetailByIdQuery(manageOrder?.orderId, {
      skip: !manageOrder?.orderId,
    });

  // Handle smooth transition when order details are loaded
  React.useEffect(() => {
    if (bookingDtails?.data && !bookingDetailsLoading) {
      // Reset animation state first
      setShowOrderDetails(false);
      setIsOrderItemsExpanded(true);
      // Small delay to trigger animation
      setTimeout(() => {
        setShowOrderDetails(true);
      }, 50);
    } else if (!manageOrder?.orderId) {
      setShowOrderDetails(false);
    }
  }, [bookingDtails, bookingDetailsLoading, manageOrder?.orderId]);

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

  // Check if order can be cancelled based on cancellation policy
  const canCancelOrder = (order, config) => {
    if (!order) return { canCancel: true, reason: null };
    if (!config) return { canCancel: true, reason: null };

    // Check order status - if processed, cannot cancel
    const orderStatus = order?.bookingStatus?.title?.toLowerCase() || "";
    if (orderStatus.includes("processed") || orderStatus.includes("completed") || orderStatus.includes("delivered")) {
      return { canCancel: false, reason: 'Order already processed or completed' };
    }

    // Check if unprocessed cancellation is allowed
    if (orderStatus.includes("picked") || orderStatus.includes("unprocessed")) {
      if (!config.allowCancelUnprocessed) {
        return { canCancel: false, reason: 'Unprocessed orders cannot be cancelled' };
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

    // Check cancellation eligibility
    const cancellationConfig =
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

    try {
      const result = await cancelBooking({
        bookingId: manageOrder.orderId,
        reasonId: selectedReason.id,
        reasonText: selectedReason.text,
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

  const formatItemAmount = (value) => {
    const numericValue = Number.parseFloat(value);
    if (!Number.isFinite(numericValue)) return null;
    return `$${numericValue.toFixed(2)}`;
  };

  // Memoize active bookings - always compute, regardless of loading state
  const activeBookings = React.useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return null;

    const active = data.data.filter((order) => {
      const status = order?.bookingStatus?.title?.toLowerCase() || "";

      // Include orders with active statuses (created, order created, pending, etc.)
      // Exclude cancelled, completed, delivered, processed, etc.
      if (
        status.includes("cancel") ||
        status.includes("cancelled") ||
        status.includes("completed") ||
        status.includes("delivered") ||
        status.includes("processed") ||
        status.includes("finished") ||
        status.includes("done")
      ) {
        return false;
      }

      // Include all other statuses (created, order created, pending, in progress, etc.)
      return true;
    }).sort((a, b) => {
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

    const past = data.data.filter((order) => {
      const status = order?.bookingStatus?.title?.toLowerCase() || "";

      // Include orders with past/final statuses
      if (
        status.includes("cancel") ||
        status.includes("cancelled") ||
        status.includes("completed") ||
        status.includes("delivered") ||
        status.includes("processed") ||
        status.includes("finished") ||
        status.includes("done")
      ) {
        return true;
      }

      // Exclude active statuses (created, order created, pending, etc.)
      return false;
    }).sort((a, b) => {
      const dateA = a.createdAt || a.created_at || a.orderDate || a.bookingDate;
      const dateB = b.createdAt || b.created_at || b.orderDate || b.bookingDate;
      if (dateA && dateB) return new Date(dateB) - new Date(dateA);
      if (a.id && b.id) return parseInt(b.id) - parseInt(a.id);
      if (a.collectionDate && b.collectionDate) return new Date(b.collectionDate) - new Date(a.collectionDate);
      return 0;
    });

    return past.length === 0 ? null : past;
  }, [data?.data]);

  // Render order details content (reusable for both modal and side panel)
  const renderOrderDetailsContent = () => {
    if (!bookingDtails?.data) return null;
    const selectedServices = Array.isArray(
      bookingDtails?.data?.customerSelectedServices
    )
      ? bookingDtails.data.customerSelectedServices
      : [];
    const subTotalValue = Number.parseFloat(bookingDtails?.data?.subTotal);
    const serviceFeeValue = Number.parseFloat(
      bookingDtails?.data?.billingDetail?.serviceCharge ??
        bookingDtails?.data?.zone?.serviceCharge
    );
    const upfrontAmountValue = Number.parseFloat(
      bookingDtails?.data?.billingDetail?.upfrontAmount
    );
    const tipValue = Number.parseFloat(bookingDtails?.data?.tips?.[0]?.amount);
    const orderAmountValue = Number.parseFloat(bookingDtails?.data?.orderAmount);

    const displaySubTotal = Number.isFinite(subTotalValue) ? subTotalValue : 0;
    const displayServiceFee = Number.isFinite(serviceFeeValue) ? serviceFeeValue : 0;
    const displayUpfrontAmount = Number.isFinite(upfrontAmountValue)
      ? upfrontAmountValue
      : 0;
    const displayTip = Number.isFinite(tipValue) ? tipValue : 0;
    const displayTotal =
      Number.isFinite(orderAmountValue) && orderAmountValue > 0
        ? orderAmountValue
        : displaySubTotal;

    const groupedSelectedServices = selectedServices.reduce((acc, item) => {
      const hasCategory = Boolean(item?.category?.name);
      const hasSubCategory = Boolean(item?.subCategory?.name);
      const parsedQty = Number(item?.items);
      const parsedPrice = Number.parseFloat(
        item?.categoryprice ?? item?.subCategory?.price
      );
      const hasQty = Number.isFinite(parsedQty) && parsedQty > 0;
      const hasPrice = Number.isFinite(parsedPrice);
      const hasMeaningfulItemData =
        hasCategory || hasSubCategory || hasQty || hasPrice;

      // Skip service rows that don't contain actual item details.
      if (!hasMeaningfulItemData) {
        return acc;
      }

      const serviceName = item?.service?.name || "Service";
      if (!acc[serviceName]) {
        acc[serviceName] = [];
      }
      acc[serviceName].push(item);
      return acc;
    }, {});
    const displayedItemsCount = Object.values(groupedSelectedServices).reduce(
      (sum, serviceItems) => sum + serviceItems.length,
      0
    );

    return (
      <>
        <h6 className="font-youth font-bold text-2xl sm:text-3xl md:text-[32px]">
          Order ID: {bookingDtails?.data?.orderTrackId}
        </h6>

        <div className="flex justify-between items-center font-sf pt-3 pb-6">
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
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoTimeOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {formatTimeToAmPm(bookingDtails?.data?.collectionTimeFrom)} - {formatTimeToAmPm(bookingDtails?.data?.collectionTimeTo)}
              </p>
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
            <div className="flex gap-2 items-center">
              <div className="flex items-center justify-center">
                <IoTimeOutline size="16" />
              </div>
              <p className="text-sm font-medium">
                {formatTimeToAmPm(bookingDtails?.data?.deliveryTimeFrom)} - {formatTimeToAmPm(bookingDtails?.data?.deliveryTimeTo)}
              </p>
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

          {/* Cancellation policy attached to this booking */}
          {bookingDtails?.data?.cancellationPolicy && (
            <div className="font-sf space-y-3 border-t pt-4">
              <p className="font-youth font-bold">Cancellation Policy (Attached)</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-theme-psGray">Policy: </span>
                  <span className="font-medium">
                    {bookingDtails.data.cancellationPolicy.name || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-theme-psGray">Description: </span>
                  <span className="font-medium">
                    {bookingDtails.data.cancellationPolicy.description || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-theme-psGray">Free cancellation window: </span>
                  <span className="font-medium">
                    {formatMinutesWindow(
                      bookingDtails.data.cancellationPolicy
                        .freeCancellationWindowMinutes
                    )}
                  </span>
                </p>
                <p>
                  <span className="text-theme-psGray">Late cancellation charge: </span>
                  <span className="font-medium">
                    {formatChargeWithFallback(
                      bookingDtails.data.cancellationPolicy.prePickupChargeAmount,
                      bookingDtails.data.cancellationPolicy.prePickupChargeCurrency,
                      bookingDtails.data.cancellationPolicy.prePickupChargePercentage
                    )}
                  </span>
                </p>
                <p>
                  <span className="text-theme-psGray">First cancellation free: </span>
                  <span className="font-medium">
                    {bookingDtails.data.cancellationPolicy.firstCancellationFree
                      ? "Yes"
                      : "No"}
                  </span>
                </p>
                <p>
                  <span className="text-theme-psGray">Unprocessed cancellation: </span>
                  <span className="font-medium">
                    {bookingDtails.data.cancellationPolicy.allowCancelUnprocessed
                      ? "Allowed"
                      : "Not allowed"}
                  </span>
                </p>
                {bookingDtails.data.cancellationPolicy.allowCancelUnprocessed && (
                  <p>
                    <span className="text-theme-psGray">Unprocessed charge: </span>
                    <span className="font-medium">
                      {formatChargeWithFallback(
                        bookingDtails.data.cancellationPolicy
                          .unprocessedChargeAmount,
                        bookingDtails.data.cancellationPolicy
                          .unprocessedChargeCurrency,
                        bookingDtails.data.cancellationPolicy
                          .unprocessedChargePercentage
                      )}
                      {Number(bookingDtails.data.cancellationPolicy.unprocessedAfterPickupMinutes) >
                      0
                        ? ` after ${bookingDtails.data.cancellationPolicy.unprocessedAfterPickupMinutes} minute(s) from pickup`
                        : ""}
                    </span>
                  </p>
                )}
                <p>
                  <span className="text-theme-psGray">Courtesy rules: </span>
                  <span className="font-medium">
                    {bookingDtails.data.cancellationPolicy.courtesyCount || 0} time(s) in{" "}
                    {bookingDtails.data.cancellationPolicy.courtesyWindowDays || 0} day(s), cap{" "}
                    {formatChargeWithFallback(
                      bookingDtails.data.cancellationPolicy.courtesyCapAmount,
                      bookingDtails.data.cancellationPolicy.prePickupChargeCurrency,
                      null
                    )}
                  </span>
                </p>
                <p>
                  <span className="text-theme-psGray">Customer leniency: </span>
                  <span className="font-medium">
                    {bookingDtails.data.cancellationPolicy.customerLeniencyEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </p>
              </div>
            </div>
          )}
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
                {displayedItemsCount} items
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
                ? "max-h-[1200px] opacity-100 mt-2"
                : "max-h-0 opacity-0 mt-0"
            }`}
          >
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

                          return (
                            <div
                              key={`${item?.serviceId || "service"}-${item?.categoryId || "cat"}-${item?.subCategoryId || "sub"}-${index}`}
                              className="flex items-start justify-between gap-3 border-t border-gray-200 pt-2 first:border-t-0 first:pt-0"
                            >
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
                                {item?.date && (
                                  <p className="text-xs text-theme-psGray">
                                    Added: {formatDate(item.date)}
                                    {item?.time
                                      ? `, ${formatTimeToAmPm(item.time)}`
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
                                <p className="text-sm font-semibold">
                                  {formatItemAmount(lineTotal) ||
                                    formatItemAmount(unitPrice) ||
                                    "N/A"}
                                </p>
                              </div>
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
          <div className="space-y-1 font-sf border-b pb-3">
            <div className="flex justify-between items-center ">
              <h4 className="font-semibold">Subtotal</h4>
              <p className="font-semibold">
                ${displaySubTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <h4 className="text-sm text-theme-psGray">Service fee</h4>
              <p className="text-sm text-theme-psGray">+${displayServiceFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <h4 className="text-sm text-theme-psGray">Upfront amount</h4>
              <p className="text-sm text-theme-psGray">-${displayUpfrontAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <h4 className="text-sm text-theme-psGray">Tip</h4>
              <p className="text-sm text-theme-psGray">+${displayTip.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center pt-1">
              <h4 className="font-semibold">Total</h4>
              <p className="font-semibold">${displayTotal.toFixed(2)}</p>
            </div>
          </div>
          {(bookingDtails?.data?.paymentMethodId || bookingDtails?.data?.paymentId || bookingDtails?.data?.bookingPaymentId) && (
            <div className="space-y-1 font-sf border-b pb-3">
              <h4 className="font-semibold text-2xl">Payment</h4>
              <div className="flex justify-between items-center">
                <div>
                  <h6>
                    {bookingDtails?.data?.paymentMethodId?.startsWith("pm_")
                      ? "Card on file"
                      : bookingDtails?.data?.paymentMethodId || "Payment Method"}
                  </h6>
                  {(bookingDtails?.data?.paymentId || bookingDtails?.data?.bookingPaymentId) && (
                    <p className="text-sm text-theme-psGray">
                      Payment ID: {bookingDtails?.data?.paymentId || bookingDtails?.data?.bookingPaymentId}
                    </p>
                  )}
                  {bookingDtails?.data?.createdAt && (
                    <p className="text-sm text-theme-psGray">
                      {formatDate(bookingDtails.data.createdAt)}
                    </p>
                  )}
                </div>
                <p className="font-semibold">${displayTotal.toFixed(2)}</p>
              </div>
              <div className="py-2">
                <PurpleButton text="Send receipt to email" />
              </div>
            </div>
          )}
          {/* Proof of Collection Section */}
          {getProofOfCollection().length > 0 && (
            <div className="space-y-1 font-sf pb-3 border-b">
              <h4 className="font-semibold text-2xl">Proof of Collection</h4>
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
                        {proof.note && (
                          <p className="text-xs text-theme-psGray text-center line-clamp-2">
                            {proof.note}
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
                        {proof.note && (
                          <p className="text-xs text-theme-psGray text-center line-clamp-2">
                            {proof.note}
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

    // Map booking data to order data structure
    const orderData = {
      collectionData: {
        collectionDate: booking.collectionDate || "",
        collectionTimeFrom: booking.collectionTimeFrom || "",
        collectionTimeTo: booking.collectionTimeTo || "",
        driverInstructionOptions: booking.driverInstructionOptions || "",
        streetAddress: booking.pickUpAddress?.streetAddress || "",
        district: booking.pickUpAddress?.district || "",
        city: booking.pickUpAddress?.city || "",
        province: booking.pickUpAddress?.province || "",
        country: booking.pickUpAddress?.country || "",
        postalCode: booking.pickUpAddress?.postalCode || "",
        lat: booking.pickUpAddress?.lat || null,
        lng: booking.pickUpAddress?.lng || null,
        title: booking.pickUpAddress?.title || "Home",
        hotelName: booking.pickUpAddress?.hotelName || null,
        apartmentNumber: booking.pickUpAddress?.apartmentNumber || null,
        floor: booking.pickUpAddress?.floor || null,
        addressType: "pickUp",
        save: false,
      },
      deliveryData: {
        deliveryDate: booking.deliveryDate || "",
        deliveryTimeFrom: booking.deliveryTimeFrom || "",
        deliveryTimeTo: booking.deliveryTimeTo || "",
        driverInstructionOptions1: booking.driverInstructionOptions1 || "",
        streetAddress: booking.dropOffAddress?.streetAddress || "",
        district: booking.dropOffAddress?.district || "",
        city: booking.dropOffAddress?.city || "",
        province: booking.dropOffAddress?.province || "",
        country: booking.dropOffAddress?.country || "",
        postalCode: booking.dropOffAddress?.postalCode || "",
        lat: booking.dropOffAddress?.lat || null,
        lng: booking.dropOffAddress?.lng || null,
        title: booking.dropOffAddress?.title || "Home",
        hotelName: booking.dropOffAddress?.hotelName || null,
        apartmentNumber: booking.dropOffAddress?.apartmentNumber || null,
        floor: booking.dropOffAddress?.floor || null,
        addressType: "dropOff",
      },
      driverInstruction: booking.driverInstruction || "",
      frequency: booking.frequency || "Just once",
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

      <div className="w-full flex flex-col md:flex-row gap-5">
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
              {/* Active Bookings Section */}
              {activeBookings && (
                <>
                  <h3 className="font-youth font-bold text-xl sm:text-2xl mb-4">Active Bookings</h3>
                  {activeBookings.map((order) => {
                    return (
                      <div
                        key={order.id}
                        onClick={() => {
                          setManageOrder({ ...manageOrder, orderId: order?.id });
                          // Open modal on mobile screens
                          if (typeof window !== "undefined" && window.innerWidth < 768) {
                            onOrderDetailsModalOpen();
                          }
                        }}
                        className="w-full xl:max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-4 sm:px-5 py-3 space-y-2 cursor-pointer"
                      >
                        <h6 className="font-youth font-bold text-base sm:text-lg">
                          Order ID: {order?.orderTrackId}
                        </h6>

                        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                          <button className={`rounded-full shrink-0 font-youth font-bold text-xs sm:text-sm px-3 py-2 sm:p-3 ${getStatusColorClasses(order?.bookingStatus?.title)}`}>
                            {order?.bookingStatus?.title}
                          </button>
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
                            {formatTimeToAmPm(order?.collectionTimeFrom)} - {formatTimeToAmPm(order?.collectionTimeTo)}
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
                            {formatTimeToAmPm(order?.deliveryTimeFrom)} - {formatTimeToAmPm(order?.deliveryTimeTo)}
                          </p>
                        </div>

                        <p className="font-sf text-base text-theme-psGray">
                          {order?.driverInstruction}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Past Bookings Section */}
              {pastBookings && (
                <>
                  <h3 className="font-youth font-bold text-xl sm:text-2xl mb-4 mt-6 sm:mt-8">Past Bookings</h3>
                  {pastBookings.map((order) => {
                    return (
                      <div
                        key={order.id}
                        onClick={() => {
                          setManageOrder({ ...manageOrder, orderId: order?.id });
                          // Open modal on mobile screens
                          if (typeof window !== "undefined" && window.innerWidth < 768) {
                            onOrderDetailsModalOpen();
                          }
                        }}
                        className="w-full xl:max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-4 sm:px-5 py-3 space-y-2 cursor-pointer"
                      >
                        <h6 className="font-youth font-bold text-base sm:text-lg">
                          Order ID: {order?.orderTrackId}
                        </h6>

                        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                          <button className={`rounded-full shrink-0 font-youth font-bold text-xs sm:text-sm px-3 py-2 sm:p-3 ${getStatusColorClasses(order?.bookingStatus?.title)}`}>
                            {order?.bookingStatus?.title}
                          </button>
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
                            {formatTimeToAmPm(order?.collectionTimeFrom)} - {formatTimeToAmPm(order?.collectionTimeTo)}
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
                            {formatTimeToAmPm(order?.deliveryTimeFrom)} - {formatTimeToAmPm(order?.deliveryTimeTo)}
                          </p>
                        </div>

                        <p className="font-sf text-base text-theme-psGray">
                          {order?.driverInstruction}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Desktop/Tablet Side Panel - Hidden on mobile */}
        {bookingDtails && !bookingDetailsLoading ? (
          <div
            className={`hidden md:block w-full max-w-[600px] h-max px-4 sm:px-6 py-4 shadow-theme-shadow-light rounded-[20px] transition-all duration-500 ease-in-out ${showOrderDetails
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-4'
              }`}
          >
            {renderOrderDetailsContent()}
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Mobile Order Details Modal - Bottom Sheet */}
      <ReusableModal
        isDismissable={true}
        isOpen={isOrderDetailsModalOpen}
        onOpenChange={(open) => {
          onOrderDetailsModalOpenChange(open);
          if (!open) {
            setManageOrder({ ...manageOrder, orderId: "" });
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
          {renderOrderDetailsContent()}
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

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-sf text-sm text-yellow-800">
                <strong>Note:</strong> Cancellation charges may apply based on
                your order status and cancellation policy.
              </p>
            </div>

            {/* Active Cancellation Policy */}
            {cancellationPolicySummary && (
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
            )}
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
