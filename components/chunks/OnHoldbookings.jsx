"use client";
import {
  useGetOnHoldBookingByIdQuery,
  useGetOnHoldBookingsQuery,
  useUpdateOnHoldBookingMutation,
} from "@/app/store/services/api";
import React, { useEffect, useMemo, useState } from "react";
import Loader, { MiniLoader } from "../Loader";
import ReusableModal from "../Modal";
import { useDisclosure } from "@heroui/react";
import { BASE_URL } from "../../utilities/URL";

export default function OnHoldbookings() {
  const { data, isLoading, refetch: refetchList } = useGetOnHoldBookingsQuery();

  const [updateOnHoldBooking, { isLoading: updateBookingLoading }] =
    useUpdateOnHoldBookingMutation();

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll, setModalScroll] = useState(false);

  const [manageOrder, setManageOrder] = useState({
    modType: "hold",
    orderId: "",
  });

  const [responsesById, setResponsesById] = useState({});

  const {
    data: onHoldBookingById,
    isLoading: OnHoldBookingLoading,
    refetch: refetchById,
  } = useGetOnHoldBookingByIdQuery(manageOrder?.orderId, {
    skip: !manageOrder?.orderId,
  });

  const holdItems = useMemo(
    () => onHoldBookingById?.data?.onHoldBookings || [],
    [onHoldBookingById]
  );

  useEffect(() => {
    if (!isOpen || !holdItems?.length) return;
    const next = {};
    for (const itm of holdItems) {
      next[itm.id] = {
        selected: false,
        customerResponse:
          typeof itm?.customerResponse === "boolean"
            ? itm.customerResponse
            : null,
        note: "",
      };
    }
    setResponsesById(next);
  }, [holdItems, isOpen]);

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => (prev !== isScrolled ? isScrolled : prev));
  }

  const toggleSelected = (id) =>
    setResponsesById((s) => ({
      ...s,
      [id]: { ...s[id], selected: !s[id]?.selected },
    }));

  const setResponse = (id, val) =>
    setResponsesById((s) => ({
      ...s,
      [id]: { ...s[id], customerResponse: val },
    }));

  const setNote = (id, val) =>
    setResponsesById((s) => ({
      ...s,
      [id]: { ...s[id], note: val },
    }));

  async function handleSubmitUpdate() {
    if (!manageOrder?.orderId) return;

    const responses = Object.entries(responsesById)
      .filter(([, v]) => v.selected && typeof v.customerResponse === "boolean")
      .map(([onHoldId, v]) => ({
        onHoldId: Number(onHoldId),
        customerResponse: v.customerResponse === true,
      }));

    if (!responses.length) return;

    const payloadObject = {
      bookingId: Number(manageOrder.orderId),
      responses,
    };

    const payloadArray = [payloadObject];

    try {
      await updateOnHoldBooking(payloadObject).unwrap();
      await Promise.all([refetchList(), refetchById()]);
      onClose();
    } catch (e) {
      const serverMsg =
        e?.data?.message || e?.data?.error || e?.error || e?.message || "";
      const looksLikeArrayRequired =
        typeof serverMsg === "string" &&
        serverMsg.toLowerCase().includes("responses must be an array");

      if (looksLikeArrayRequired) {
        try {
          await updateOnHoldBooking(payloadArray).unwrap();
          await Promise.all([refetchList(), refetchById()]);
          onClose();
          return;
        } catch (e2) {
          console.error("Update failed (array payload):", e2);
        }
      } else {
        console.error("Update failed (object payload):", e);
      }
    }
  }

  const selectedIds = Object.entries(responsesById).filter(
    ([, v]) => v.selected
  );
  const anySelectedWithoutResponse = selectedIds.some(
    ([, v]) => typeof v.customerResponse !== "boolean"
  );
  const disableContinue =
    updateBookingLoading || !selectedIds.length || anySelectedWithoutResponse;

  return isLoading ? (
    <Loader />
  ) : (
    <section className="w-full mt-16 sm:px-6 lg:px-10">
      <h2 className="font-youth font-medium text-[40px] mb-4">
        On Hold Bookings
      </h2>

      <div className="w-full max-w-[912px] font-sf space-y-5 border rounded-2xl overflow-hidden shadow-theme-shadow pt-4">
        {data?.data?.onHoldBookings?.map((item, idx) => (
          <div
            key={item?.id ?? idx}
            onClick={() => {
              setManageOrder((prev) => ({ ...prev, orderId: item?.id }));
              onOpen();
            }}
            className="flex justify-between items-center border-b pb-4 px-4 cursor-pointer"
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
        ))}
      </div>

      {/* ======================= Modal ======================== */}
      <ReusableModal
        isDismissable={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        showHeader={true}
        headerTitle="Hold Items"
        modalScroll={modalScroll}
        onBack={false}
        onClose={false}
        showFooter={true}
        footerContent={
          <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
            <button
              className={`w-full rounded-2xl h-12 font-youth text-lg ${
                disableContinue
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
              onClick={handleSubmitUpdate}
              disabled={disableContinue}
            >
              {updateBookingLoading ? "Updating..." : "Continue"}
            </button>
          </div>
        }
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class max-h-[90vh] overflow-auto"
      >
        {manageOrder?.modType === "hold" && !OnHoldBookingLoading ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto font-sf"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Order ID: {manageOrder?.orderId || "-"}
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-4 font-sf flex justify-between items-center">
              <p className="font-sf font-semibold cursor-pointer">Order Status</p>
              <span className="bg-theme-skyBlue rounded-full shrink-0 text-[#0391C4] font-youth font-bold text-sm px-3 py-1.5">
                On-Hold
              </span>
            </div>

            {holdItems?.length ? (
              <div className="w-full px-6 space-y-4 pb-6">
                {holdItems.map((itm) => {
                  const state = responsesById[itm.id] || {
                    selected: false,
                    customerResponse: null,
                    note: "",
                  };
                  return (
                    <div
                      key={itm.id}
                      className="w-full border rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-4"
                    >
                      <div className="md:col-span-5 flex items-center gap-3">
                        <input
                          id={`sel-${itm.id}`}
                          type="checkbox"
                          checked={!!state.selected}
                          onChange={() => toggleSelected(itm.id)}
                        />
                        <label className="font-semibold">
                          Select this item to update
                        </label>
                      </div>

                      {/* Image */}
                      <div className="md:col-span-2">
                        <div className="h-36 rounded-lg overflow-hidden bg-gray-200 border">
                          <img
                            className="w-full h-full object-cover"
                            src={BASE_URL + itm?.onHoldImg}
                            alt="on-hold item"
                          />
                        </div>
                      </div>

                      {/* Details & Inputs */}
                      <div className="md:col-span-3 space-y-2">
                        <p className="text-theme-psGray">
                          {itm?.description ||
                            "We have encountered an issue with one or more of the items in your order."}
                        </p>

                        {(itm?.service?.name || itm?.subCategory?.name) && (
                          <div className="text-sm text-theme-psGray">
                            {itm?.service?.name && (
                              <span>Service: {itm.service.name}</span>
                            )}
                            {itm?.subCategory?.name && (
                              <span className="ml-3">
                                Item: {itm.subCategory.name}
                                {itm?.subCategory?.price
                                  ? ` (${itm.subCategory.price})`
                                  : ""}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="space-y-2 pt-2">
                          <label className="flex gap-2 items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`resp-${itm.id}`}
                              disabled={!state.selected}
                              checked={state.customerResponse === true}
                              onChange={() => setResponse(itm.id, true)}
                            />
                            <span>Yes, I accept and proceed</span>
                          </label>
                          <label className="flex gap-2 items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`resp-${itm.id}`}
                              disabled={!state.selected}
                              checked={state.customerResponse === false}
                              onChange={() => setResponse(itm.id, false)}
                            />
                            <span>No, I want a recheck</span>
                          </label>
                        </div>
                        <textarea
                          className="w-full h-24 bg-theme-gray rounded-lg p-3 text-base text-theme-gray-2 resize-none outline-none mt-2"
                          placeholder="Add a note (optional)"
                          disabled={!state.selected}
                          value={state.note}
                          onChange={(e) => setNote(itm.id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center h-80">
                <MiniLoader />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-80">
            <MiniLoader />
          </div>
        )}
      </ReusableModal>
    </section>
  );
}
