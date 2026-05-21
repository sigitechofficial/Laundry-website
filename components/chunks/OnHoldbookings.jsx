"use client";
import {
  useGetOnHoldBookingByIdQuery,
  useGetOnHoldBookingsQuery,
  useGetOnHoldCustomerShowQuery,
  useUpdateOnHoldBookingMutation,
} from "@/app/store/services/api";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Loader, { MiniLoader } from "../Loader";
import ReusableModal from "../Modal";
import { useDisclosure, addToast } from "@heroui/react";
import { clearCartData, setPage } from "@/app/store/slices/cartItemSlice";
import { BASE_URL } from "../../utilities/URL";

export default function OnHoldbookings() {
  const router = useRouter();
  const dispatch = useDispatch();
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

  const { data: onHoldOptionData } = useGetOnHoldCustomerShowQuery(
    manageOrder?.orderId,
    { skip: !manageOrder?.orderId || !isOpen }
  );

  const holdOptionLabels = onHoldOptionData?.data ?? {};
  const confirmLabel =
    holdOptionLabels?.conformationText?.trim() || "Yes, I accept and proceed";
  const declineLabel =
    holdOptionLabels?.notConfirmText?.trim() || "No, I want a recheck";
  const otherLabel = holdOptionLabels?.otherText?.trim() || "Other";

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
        responseChoice:
          typeof itm?.customerResponse === "boolean"
            ? itm.customerResponse
              ? "yes"
              : "no"
            : null,
        note: "",
        otherText: "",
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

  const setResponseChoice = (id, choice) =>
    setResponsesById((s) => ({
      ...s,
      [id]: { ...s[id], responseChoice: choice },
    }));

  const setNote = (id, val) =>
    setResponsesById((s) => ({
      ...s,
      [id]: { ...s[id], note: val },
    }));

  const setOtherText = (id, val) =>
    setResponsesById((s) => ({
      ...s,
      [id]: { ...s[id], otherText: val },
    }));

  const buildResponsesPayload = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const responses = Object.entries(responsesById)
      .filter(([, v]) => v.selected && v.responseChoice)
      .map(([onHoldId, v]) => {
        const entry = {
          onHoldId: Number(onHoldId),
          customerResponse: v.responseChoice === "yes",
        };
        const noteText =
          v.responseChoice === "other"
            ? v.otherText?.trim()
            : v.responseChoice === "no"
              ? v.note?.trim()
              : "";
        if (noteText) entry.note = noteText;
        return entry;
      });

    return {
      timeZone,
      responses,
      payloadObject: {
        bookingId: Number(manageOrder.orderId),
        timeZone,
        responses,
      },
    };
  };

  async function submitOnHoldResponses(payloadObject) {
    const payloadArray = [payloadObject];
    try {
      await updateOnHoldBooking(payloadObject).unwrap();
      return true;
    } catch (e) {
      const serverMsg =
        e?.data?.message || e?.data?.error || e?.error || e?.message || "";
      const looksLikeArrayRequired =
        typeof serverMsg === "string" &&
        serverMsg.toLowerCase().includes("responses must be an array");

      if (looksLikeArrayRequired) {
        try {
          await updateOnHoldBooking(payloadArray).unwrap();
          return true;
        } catch (e2) {
          console.error("Update failed (array payload):", e2);
          throw e2;
        }
      }
      throw e;
    }
  }

  async function handleFooterContinue() {
    if (!manageOrder?.orderId) return;

    const selectedEntries = Object.entries(responsesById).filter(([, v]) => v.selected);
    if (!selectedEntries.length) return;

    const { payloadObject, responses } = buildResponsesPayload();
    if (!responses.length) return;

    const allYes = selectedEntries.every(([, v]) => v.responseChoice === "yes");
    const shouldCreateNewOrder = allYes;

    try {
      await submitOnHoldResponses(payloadObject);
      await Promise.all([refetchList(), refetchById()]);

      if (shouldCreateNewOrder) {
        dispatch(clearCartData());
        dispatch(setPage(true));
        onClose();
        router.push("/place-order");
        return;
      }

      addToast({
        title: "Response submitted",
        description: "Your on-hold response was sent successfully.",
        color: "success",
      });
      onClose();
    } catch (e) {
      addToast({
        title: "Could not submit response",
        description:
          e?.data?.message || e?.data?.error || e?.message || "Please try again.",
        color: "danger",
      });
    }
  }

  const selectedEntries = Object.entries(responsesById).filter(([, v]) => v.selected);
  const anySelectedWithoutResponse = selectedEntries.some(([, v]) => !v.responseChoice);
  const allSelectedAreYes =
    selectedEntries.length > 0 &&
    selectedEntries.every(([, v]) => v.responseChoice === "yes");
  const continueLabel = allSelectedAreYes ? "Create new order" : "Submit";
  const disableContinue =
    updateBookingLoading || !selectedEntries.length || anySelectedWithoutResponse;

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
              onClick={handleFooterContinue}
              disabled={disableContinue}
            >
              {updateBookingLoading
                ? allSelectedAreYes
                  ? "Loading..."
                  : "Submitting..."
                : continueLabel}
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
                    responseChoice: null,
                    note: "",
                    otherText: "",
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

                        {holdOptionLabels?.title ? (
                          <p className="font-semibold text-base text-black pt-1">
                            {holdOptionLabels.title}
                          </p>
                        ) : null}

                        <div className="space-y-3 pt-2">
                          <label className="flex gap-2 items-start cursor-pointer">
                            <input
                              type="radio"
                              name={`resp-${itm.id}`}
                              disabled={!state.selected}
                              checked={state.responseChoice === "yes"}
                              onChange={() => setResponseChoice(itm.id, "yes")}
                              className="mt-1 shrink-0"
                            />
                            <span className="text-base leading-snug">{confirmLabel}</span>
                          </label>

                          <label className="flex gap-2 items-start cursor-pointer">
                            <input
                              type="radio"
                              name={`resp-${itm.id}`}
                              disabled={!state.selected}
                              checked={state.responseChoice === "no"}
                              onChange={() => setResponseChoice(itm.id, "no")}
                              className="mt-1 shrink-0"
                            />
                            <span className="text-base leading-snug">{declineLabel}</span>
                          </label>

                          {state.selected && state.responseChoice === "no" && (
                            <div className="pl-6 space-y-1.5">
                              <p className="text-sm font-medium text-theme-psGray">
                                Tell us what you&apos;d like rechecked (optional)
                              </p>
                              <textarea
                                className="w-full h-24 bg-theme-gray rounded-lg p-3 text-sm text-theme-gray-2 resize-none outline-none focus:ring-1 focus:ring-theme-blue"
                                placeholder="Describe the issue or what needs another look"
                                value={state.note}
                                onChange={(e) => setNote(itm.id, e.target.value)}
                              />
                            </div>
                          )}

                          <label className="flex gap-2 items-start cursor-pointer">
                            <input
                              type="radio"
                              name={`resp-${itm.id}`}
                              disabled={!state.selected}
                              checked={state.responseChoice === "other"}
                              onChange={() => setResponseChoice(itm.id, "other")}
                              className="mt-1 shrink-0"
                            />
                            <span className="text-base leading-snug">{otherLabel}</span>
                          </label>

                          {state.selected && state.responseChoice === "other" && (
                            <div className="pl-6 space-y-1.5">
                              <p className="text-sm font-medium text-theme-psGray">
                                Please specify (optional)
                              </p>
                              <input
                                type="text"
                                className="w-full h-11 bg-theme-gray rounded-lg px-3 text-sm text-black outline-none focus:ring-1 focus:ring-theme-blue"
                                placeholder="Type your response here..."
                                value={state.otherText}
                                onChange={(e) => setOtherText(itm.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
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
