"use client";
import { useGetOnHoldBookingsQuery } from "@/app/store/services/api";
import React, { useState } from "react";
import Loader, { MiniLoader } from "../Loader";
import ReusableModal from "../Modal";
import { useDisclosure } from "@heroui/react";

export default function OnHoldbookings() {
  const { data, isLoading } = useGetOnHoldBookingsQuery();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll, setModalScroll] = useState(false);
  const [manageOrder, setManageOrder] = useState({
    modType: "hold",
    orderId: "",
  });

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  return isLoading ? (
    <Loader />
  ) : (
    <section className="w-full mt-16 sm:px-6 lg:px-10">
      <h2 className="font-youth font-medium text-[40px] mb-4">
        On Hold Bookings
      </h2>

      <div className="w-full max-w-[912px] font-sf space-y-5 border rounded-2xl overflow-hidden shadow-theme-shadow pt-4">
        {data?.data?.onHoldBookings?.map((item, idx) => {
          return (
            <div
              onClick={onOpen}
              className="flex justify-between items-center border-b pb-4 px-4"
            >
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-full shrink-0 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="/images/sample.jpg"
                    alt="image"
                  />
                </div>

                <div>
                  <h4 className="font-youth font-bold text-xl">
                    Tracking Id: {item?.orderTrackId}
                  </h4>
                  <p className="font-sf text-base text-theme-psGray">
                    {item?.OnHoldConfirmations?.[0]?.description ||
                      "We have encountered an issue with one or more of the items in your order."}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pb-2">
                <p className="text-base text-theme-psGray font-sf">10:30 AM</p>
                <p className="size-4 rounded-full bg-theme-blue-2 ml-auto"></p>
              </div>
            </div>
          );
        })}
      </div>
      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        showHeader={true}
        headerTitle="Hold Items"
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
        {manageOrder?.modType === "hold" ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Order ID:9898
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
                hgjhgjhh
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
        ) : (
          <MiniLoader />
        )}
      </ReusableModal>
    </section>
  );
}
