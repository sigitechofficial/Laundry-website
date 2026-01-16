"use client";
import React, { useState } from "react";
import { GoArrowUp, GoClock } from "react-icons/go";
import { IoBagCheck, IoLocation } from "react-icons/io5";
import {  PurpleButton } from "../Buttons";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  useBookingDetailByIdQuery,
  useGetAllOrdersQuery,
  useGetCancellationPoliciesQuery,
  useCancelBookingMutation,
} from "@/app/store/services/api";
import { formatDate } from "../../utilities/ConversionFunction";
import ReusableModal from "../Modal";
import { useDisclosure, Spinner, addToast } from "@heroui/react";
import SelectHero from "../SelectHero";

// Static cancellation reasons with IDs
const cancellationReasons = [
  { key: "change_of_plans", label: "Change of plans", id: "1", text: "Change of plans" },
  { key: "found_another_service", label: "Found another service", id: "2", text: "Found another service" },
  { key: "no_longer_needed", label: "No longer needed", id: "3", text: "No longer needed" },
  { key: "price_too_high", label: "Price too high", id: "4", text: "Price too high" },
  { key: "scheduling_conflict", label: "Scheduling conflict", id: "5", text: "Scheduling conflict" },
  { key: "other", label: "Other", id: "6", text: "Other" },
];

export default function OrderHistory() {
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
  const [manageOrder, setManageOrder] = useState({
    manage: false,
    modType: "track",
    orderId: "",
  });
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationCharge, setCancellationCharge] = useState(null);
  const [isCheckingCancellation, setIsCheckingCancellation] = useState(false);
  
  const { data: bookingDtails, isLoading: bookingDetailsLoading } =
    useBookingDetailByIdQuery(manageOrder?.orderId, {
      skip: !manageOrder?.orderId,
    });
  
  const { data: cancellationPolicy } = useGetCancellationPoliciesQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

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

  return (
    <section className="w-full mt-16 sm:px-10 h-[calc(100vh-8rem)] overflow-y-auto">
      <h2 className="font-youth font-medium text-[40px] mb-4">
        Here's What You've Ordered
      </h2>

      <div className="w-full flex gap-5">
        <div className="w-full font-sf space-y-5">
          {data?.data?.map((order) => {
            return (
              <div
                onClick={() =>
                  setManageOrder({ ...manageOrder, orderId: order?.id })
                }
                className="w-full max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-5 py-3 space-y-2"
              >
                <h6 className="font-youth font-bold text-lg">
                  Order ID: {order?.orderTrackId}
                </h6>

                <div className="w-full flex justify-between items-center">
                  <button className="bg-theme-skyBlue rounded-full shrink-0 text-[#0391C4] font-youth font-bold text-sm p-3">
                    {order?.bookingStatus?.title}
                  </button>

                  <p className="font-youth font-bold text-base">
                    Est ${order?.orderAmount}
                  </p>
                </div>

                <div className="w-full flex justify-between items-center border-b">
                  <div className="flex gap-2 items-center py-2">
                    <GoArrowUp size={25} />
                    <div>
                      <p className="font-sf text-lg text-theme-psGray leading-tight">
                        Pick up
                      </p>
                      <p className="font-sf text-xl">
                        {formatDate(order?.collectionDate)}
                      </p>
                    </div>
                  </div>

                  <p className="font-youth font-bold text-base flex items-center gap-2">
                    <GoClock size="20" />
                    {order?.collectionTimeFrom} - {order?.collectionTimeTo}
                  </p>
                </div>

                <div className="w-full flex justify-between items-center">
                  <div className="flex gap-2 items-center py-2">
                    <GoArrowUp size={25} />
                    <div>
                      <p className="font-sf text-lg text-theme-psGray leading-tight">
                        Drop off
                      </p>
                      <p className="font-sf text-xl">
                        {formatDate(order?.deliveryDate)}
                      </p>
                    </div>
                  </div>

                  <p className="font-youth font-bold text-base flex items-center gap-2">
                    <GoClock size="20" />
                    {order?.deliveryTimeFrom} - {order?.deliveryTimeTo}
                  </p>
                </div>

                <p className="font-sf text-base text-theme-psGray">
                  {order?.driverInstruction}
                </p>
              </div>
            );
          })}
        </div>

        {bookingDtails ? (
          <div className="w-[600px] h-max px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
            <h6 className="font-youth font-bold text-[32px]">
              Order ID: {bookingDtails?.data?.orderTrackId}
            </h6>

            <div className="flex justify-between items-center font-sf pt-3 pb-6">
              <button
                title={bookingDtails?.data?.bookingStatus?.description}
                className="bg-theme-skyBlue rounded-full shrink-0 text-[#0391C4] font-youth font-bold text-sm p-3"
              >
                {bookingDtails?.data?.bookingStatus?.title}
              </button>

              <p
                onClick={onOpen}
                className="underline underline-offset-4 text-theme-psGray cursor-pointer"
              >
                Track your order
              </p>
            </div>

            <div className="space-y-4">
              <div className="font-sf space-y-3">
                <p className="font-youth font-bold">Collection</p>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoLocation size="20" />
                  </div>

                  <p className="text-sm font-medium">
                    {" "}
                    {formatDate(bookingDtails?.data?.collectionDate)}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoLocation size="20" />
                  </div>

                  <p className="text-sm font-medium">
                    {" "}
                    {bookingDtails?.data?.collectionTimeFrom} -{" "}
                    {bookingDtails?.data?.collectionTimeTo}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoLocation size="20" />
                  </div>

                  <p className="text-sm font-medium">
                    {bookingDtails?.data?.driverInstructionOptions}
                  </p>
                </div>
              </div>
              <div className="font-sf space-y-3">
                <p className="font-youth font-bold">Delivery</p>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoLocation size="20" />
                  </div>

                  <p className="text-sm font-medium">
                    {" "}
                    {formatDate(bookingDtails?.data?.deliveryDate)}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoLocation size="20" />
                  </div>

                  <p className="text-sm font-medium">
                    {" "}
                    {bookingDtails?.data?.deliveryTimeFrom} -{" "}
                    {bookingDtails?.data?.deliveryTimeTo}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoLocation size="20" />
                  </div>

                  <p className="text-sm font-medium">
                    {bookingDtails?.data?.driverInstructionOptions1}
                  </p>
                </div>
              </div>
              <div className="font-sf space-y-3">
                <p className="font-youth font-bold">Address</p>
                <div className="flex gap-4 items-center">
                  <div>
                    <IoBagCheck />
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
              <PurpleButton onClick={onOpen} text="Track Order" />
              <PurpleButton
                text={manageOrder?.manage ? "Close" : "Manage Order"}
                bg="bg-theme-blue"
                color="text-white"
                onClick={() =>
                  setManageOrder({
                    ...manageOrder,
                    manage: !manageOrder?.manage,
                  })
                }
              />
            </div>

            {manageOrder?.manage && (
              <div className="space-y-3 mt-8">
                <div className="flex justify-between items-center border-b py-2">
                  <div className="font-sf">
                    <h6 className="font-semibold text-xl">Order details</h6>
                    <p className="text-theme-psGray">6 items</p>
                  </div>

                  <MdKeyboardArrowRight size="25" />
                </div>

                <div className="space-y-1 font-sf border-b pb-3">
                  <div className="flex justify-between items-center ">
                    <h4 className="font-semibold">Subtotal</h4>
                    <p className="font-semibold">CHF 69.00</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-theme-psGray">
                      Minimum order fee
                    </h4>
                    <p className="text-sm text-theme-psGray">CHF 0.00</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-theme-psGray">Service fee</h4>
                    <p className="text-sm text-theme-psGray">CHF 0.00</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-theme-psGray">
                      Additional fee
                    </h4>
                    <p className="text-sm text-theme-psGray">CHF 0.00</p>
                  </div>
                </div>

                <div className="space-y-1 font-sf border-b pb-3">
                  <h4 className="font-semibold text-2xl">Payment</h4>

                  <div className="flex justify-between items-center">
                    <div>
                      <h6>MasterCard *******2356</h6>
                      <p>07/13/23, 12:25</p>
                    </div>

                    <p>$18</p>
                  </div>
                  <div className="py-2">
                    <PurpleButton text="Send receipt to email" />
                  </div>
                </div>

                <div className="space-y-1 font-sf pb-3 border-b-0">
                  <h4 className="font-semibold text-2xl">
                    Proof of collection
                  </h4>

                  <p className="font-sf text-theme-psGray">
                    Malle Sushi Stockholm
                  </p>
                  <div className="py-3">
                    <div className="grid grid-cols-3 gap-5">
                      <div className="bg-gray-200 h-20"></div>
                      <div className="bg-gray-200 h-20"></div>
                      <div className="bg-gray-200 h-20"></div>
                      <div className="bg-gray-200 h-20"></div>
                      <div className="bg-gray-200 h-20"></div>
                      <div className="bg-gray-200 h-20"></div>
                    </div>
                  </div>
                  <div className="my-2">
                    <PurpleButton text="Contact support" />
                  </div>
                </div>
                <div className="my-2 border-t pt-3">
                  <PurpleButton
                    text={isCheckingCancellation ? "Checking..." : "Cancel Order"}
                    bg="bg-red-500"
                    color="text-white"
                    onClick={handleCancelClick}
                    disabled={isCheckingCancellation}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </div>

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
              <button className="bg-theme-skyBlue rounded-full shrink-0 text-[#0391C4] font-youth font-bold text-sm px-3 py-1.5">
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
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.ironingAfter === "hung"
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
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.ironingAfter === "folded"
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
                      className={`flex justify-center items-center cursor-pointer ${
                        preferences.ironingTemperature === temp
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
              className={`w-full rounded-2xl h-12 font-youth text-sm flex items-center justify-center gap-2 ${
                cancellationReason && !isCancelling
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
    </section>
  );
}
