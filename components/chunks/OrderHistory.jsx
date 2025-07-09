"use client";
import React, { useState } from "react";
import { GoArrowUp, GoClock } from "react-icons/go";
import { IoBagCheck, IoLocation } from "react-icons/io5";
import { ButtonYouth70018, PurpleButton } from "../Buttons";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  useBookingDetailByIdQuery,
  useGetAllOrdersQuery,
} from "@/app/store/services/api";
import { formatDate } from "../../utilities/ConversionFunction";
import ReusableModal from "../Modal";
import { useDisclosure } from "@heroui/react";

export default function OrderHistory() {
  const { data, isLoading } = useGetAllOrdersQuery();
  const [order, setOrder] = useState("");
  const [modalScroll, setModalScroll] = useState(false);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [manageOrder, setManageOrder] = useState({
    manage: false,
    modType: "track",
    orderId: "",
  });
  const { data: bookingDtails, isLoading: bookingDetailsLoading } =
    useBookingDetailByIdQuery(manageOrder?.orderId, {
      skip: !manageOrder?.orderId,
    });

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  return (
    <section className="w-full mt-16 sm:px-10">
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
    </section>
  );
}
