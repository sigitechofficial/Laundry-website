"use client";
import React, { useState } from "react";
import { GoArrowUp, GoClock } from "react-icons/go";
import { IoBagCheck, IoLocation, IoClose, IoCalendarOutline, IoTimeOutline, IoInformationCircleOutline, IoLocationOutline } from "react-icons/io5";
import { PurpleButton } from "../Buttons";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  useBookingDetailByIdQuery,
  useGetAllOrdersQuery,
  useGetCancellationPoliciesQuery,
  useGetAllReasonsQuery,
  useCancelBookingMutation,
} from "@/app/store/services/api";
import { formatDate } from "../../utilities/ConversionFunction";
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
  const { data, isLoading, refetch: refetchOrders } = useGetAllOrdersQuery();
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

  const { data: bookingDtails, isLoading: bookingDetailsLoading } =
    useBookingDetailByIdQuery(manageOrder?.orderId, {
      skip: !manageOrder?.orderId,
    });

  // Handle smooth transition when order details are loaded
  React.useEffect(() => {
    if (bookingDtails?.data && !bookingDetailsLoading) {
      // Reset animation state first
      setShowOrderDetails(false);
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

  const { data: cancellationPolicy } = useGetCancellationPoliciesQuery();
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
  const canCancelOrder = (order, policy) => {
    if (!order || !policy) return { canCancel: true, reason: null }; // Allow if no policy

    const policyData = policy?.data?.policies?.[0];
    if (!policyData) return { canCancel: true, reason: null };

    const config = policyData?.cancellationConfig;
    if (!config) return { canCancel: true, reason: null };

    // Check policy expiry
    if (policyData.expiry_date) {
      const expiryDate = new Date(policyData.expiry_date);
      if (expiryDate < new Date()) {
        return { canCancel: false, reason: 'Cancellation policy has expired' };
      }
    }

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
    const eligibility = canCancelOrder(bookingDtails.data, cancellationPolicy);

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
                {bookingDtails?.data?.collectionTimeFrom} - {bookingDtails?.data?.collectionTimeTo}
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
                {bookingDtails?.data?.deliveryTimeFrom} - {bookingDtails?.data?.deliveryTimeTo}
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
            <div className="flex justify-between items-center border-b py-2">
              <div className="font-sf">
                <h6 className="font-semibold text-xl">Order details</h6>
                <p className="text-theme-psGray">
                  {bookingDtails?.data?.totalItems || bookingDtails?.data?.customerSelectedServices?.length || 0} items
                </p>
              </div>
              <MdKeyboardArrowRight size="25" />
            </div>
            <div className="space-y-1 font-sf border-b pb-3">
              <div className="flex justify-between items-center ">
                <h4 className="font-semibold">Subtotal</h4>
                <p className="font-semibold">
                  ${bookingDtails?.data?.subTotal || bookingDtails?.data?.orderAmount || "0.00"}
                </p>
              </div>
              {bookingDtails?.data?.zone?.serviceCharge && (
                <div className="flex justify-between items-center">
                  <h4 className="text-sm text-theme-psGray">Service fee</h4>
                  <p className="text-sm text-theme-psGray">${bookingDtails.data.zone.serviceCharge}</p>
                </div>
              )}
            </div>
            {bookingDtails?.data?.paymentMethodId && (
              <div className="space-y-1 font-sf border-b pb-3">
                <h4 className="font-semibold text-2xl">Payment</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <h6>
                      {bookingDtails?.data?.paymentMethodId?.startsWith("pm_") 
                        ? `Card ending in ${bookingDtails.data.paymentMethodId.slice(-4)}`
                        : bookingDtails?.data?.paymentMethodId || "Payment Method"}
                    </h6>
                    {bookingDtails?.data?.createdAt && (
                      <p className="text-sm text-theme-psGray">
                        {formatDate(bookingDtails.data.createdAt)}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">${bookingDtails?.data?.orderAmount || "0.00"}</p>
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
                const isCancelled = isOrderCancelled(order);
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      if (!isCancelled) {
                        setManageOrder({ ...manageOrder, orderId: order?.id });
                        // Open modal on mobile screens
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          onOrderDetailsModalOpen();
                        }
                      }
                    }}
                    className={`w-full xl:max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-4 sm:px-5 py-3 space-y-2 ${isCancelled ? "cursor-default opacity-75" : "cursor-pointer"
                      }`}
                  >
                    <h6 className="font-youth font-bold text-base sm:text-lg">
                      Order ID: {order?.orderTrackId}
                    </h6>

                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <button className={`rounded-full shrink-0 font-youth font-bold text-xs sm:text-sm px-3 py-2 sm:p-3 ${getStatusColorClasses(order?.bookingStatus?.title)}`}>
                        {order?.bookingStatus?.title}
                      </button>

                      <p className="font-youth font-bold text-sm sm:text-base">
                        Est ${order?.orderAmount}
                      </p>
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
                        {order?.collectionTimeFrom} - {order?.collectionTimeTo}
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
                        {order?.deliveryTimeFrom} - {order?.deliveryTimeTo}
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
                const isCancelled = isOrderCancelled(order);
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      if (!isCancelled) {
                        setManageOrder({ ...manageOrder, orderId: order?.id });
                        // Open modal on mobile screens
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          onOrderDetailsModalOpen();
                        }
                      }
                    }}
                    className={`w-full xl:max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-4 sm:px-5 py-3 space-y-2 ${isCancelled ? "cursor-default opacity-75" : "cursor-pointer"
                      }`}
                  >
                    <h6 className="font-youth font-bold text-base sm:text-lg">
                      Order ID: {order?.orderTrackId}
                    </h6>

                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <button className={`rounded-full shrink-0 font-youth font-bold text-xs sm:text-sm px-3 py-2 sm:p-3 ${getStatusColorClasses(order?.bookingStatus?.title)}`}>
                        {order?.bookingStatus?.title}
                      </button>

                      <p className="font-youth font-bold text-sm sm:text-base">
                        Est ${order?.orderAmount}
                      </p>
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
                        {order?.collectionTimeFrom} - {order?.collectionTimeTo}
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
                        {order?.deliveryTimeFrom} - {order?.deliveryTimeTo}
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
