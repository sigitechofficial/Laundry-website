"use client";
import React, { useMemo, useState } from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { ButtonYouth70018, PurpleButton } from "../../../../components/Buttons";
import {
  IoBagCheck,
  IoCheckmarkSharp,
  IoLocation,
  IoShirt,
} from "react-icons/io5";
import {
  useCreateBookingMutation,
  useGetChargesQuery,
  useGetServicesQuery,
} from "@/app/store/services/api";
import { addToast, useDisclosure } from "@heroui/react";
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
  const [createBooking] = useCreateBookingMutation();
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
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll, setModalScroll] = useState(false);
  const [modal, setModal] = useState({
    modType: "wash",
    page: "payment",
  });

  const handleModalScroll = (e) => {};

  const handleCreateBooking = async (payData) => {
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
      preferencesArray: preferencesData
        ?.filter((item) => item?.preferencesArray && Array.isArray(item.preferencesArray))
        ?.flatMap((item) => item.preferencesArray) || [],
      services: preferencesData
        ?.filter((item) => item?.serviceId)
        ?.map((item) => ({ serviceId: item.serviceId })),
      totalItems: 5,
      paymentIntentId: payData?.paymentIntentId,
      paymentMethodId: payData?.paymentMethodId,
      stripeCustomerId: localStorage.getItem("stripeCustomerId"),
    };

    const response = await createBooking(bookingData).unwrap();
    if (response?.status === "1") {
      // Clear all cart data (address, preferences, etc.)
      dispatch(clearCartData());
      
      addToast({
        title: "Create Booking",
        description: response?.message,
        color: "success",
      });

      router.replace("/");
    } else {
      addToast({
        title: "Create Booking",
        description: response?.error,
        color: "danger",
      });
    }
  };

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
              {/* PAYMENT */}
              {modal?.page === "payment" ? (
                <div className="w-full px-4 py-4 shadow-theme-shadow-light rounded-[20px] h-max">
                  <h4 className="font-youth font-bold text-2xl text-center py-4">
                    Payment Methods
                  </h4>

                  <div className="space-y-3 pt-3">
                    <div
                      onClick={() =>
                        setModal({ ...modal, paymentMethod: "twink" })
                      }
                      className="flex items-center justify-between px-2 h-[64px] rounded-lg border-2 border-theme-gray cursor-pointer"
                    >
                      <div
                        onClick={() =>
                          setModal({ ...modal, paymentMethod: "twink" })
                        }
                        className="flex items-center gap-3"
                      >
                        <img src="/images/payment/twink.png" alt="twink" />
                        <p className="font-sf text-xl font-normal">Twint</p>
                      </div>
                      {modal?.paymentMethod === "twink" ? (
                        <IoCheckmarkSharp color="green" size={25} />
                      ) : (
                        ""
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setModal({ ...modal, paymentMethod: "paypal" })
                      }
                      className="flex items-center justify-between px-2 h-[64px] rounded-lg border-2 border-theme-gray cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img src="/images/payment/paypal.png" alt="paypal" />
                        <p className="font-sf text-xl font-normal">Paypal</p>
                      </div>
                      {modal?.paymentMethod === "paypal" ? (
                        <IoCheckmarkSharp color="green" size={25} />
                      ) : (
                        ""
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setModal({ ...modal, paymentMethod: "card" })
                      }
                      className="flex items-center justify-between px-2 h-[64px] rounded-lg border-2 border-theme-gray cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img src="/images/payment/cards.png" alt="cards" />
                        <p className="font-sf text-xl font-normal">Cards</p>
                      </div>
                      {modal?.paymentMethod === "card" ? (
                        <IoCheckmarkSharp color="green" size={25} />
                      ) : (
                        ""
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setModal({ ...modal, paymentMethod: "apple pay" })
                      }
                      className="flex items-center justify-between px-2 h-[64px] rounded-lg border-2 border-theme-gray cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/payment/applepay.png"
                          alt="apple pay"
                        />
                        <p className="font-sf text-xl font-normal">Apple Pay</p>
                      </div>
                      {modal?.paymentMethod === "apple pay" ? (
                        <IoCheckmarkSharp color="green" size={25} />
                      ) : (
                        ""
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setModal({ ...modal, paymentMethod: "google pay" })
                      }
                      className="flex items-center justify-between px-2 h-[64px] rounded-lg border-2 border-theme-gray cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img src="/images/payment/gpay.png" alt="google pay" />
                        <p className="font-sf text-xl font-normal">
                          Google Pay
                        </p>
                      </div>
                      {modal?.paymentMethod === "google pay" ? (
                        <IoCheckmarkSharp color="green" size={25} />
                      ) : (
                        ""
                      )}
                    </div>

                    <p className="font-sf text-theme-psGray">
                      A service fee will be charged.
                    </p>

                    <div className="pt-3">
                      <ButtonYouth70018
                        text="Complete Order"
                        onClick={() => setModal({ ...modal, page: "stripe" })}
                      />
                    </div>
                  </div>
                </div>
              ) : modal?.page === "stripe" ? (
                <div className="w-full">
                  <StripeCheckout
                    paymentMethod={modal?.paymentMethod}
                    setModal={setModal}
                    modal={modal}
                    booking={handleCreateBooking}
                    totalAmount={totalAmount}
                    onOpen={onOpen}
                    customerId={customerId}
                  />
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
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${
                        orderData?.frequency === "Just once"
                          ? "bg-theme-blue text-white"
                          : ""
                      }`}
                    >
                      Just once
                    </div>
                    <div
                      onClick={() => dispatch(setFrequency("Weekly"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${
                        orderData?.frequency === "Weekly"
                          ? "bg-theme-blue text-white"
                          : ""
                      }`}
                    >
                      Weekly
                    </div>
                    <div
                      onClick={() => dispatch(setFrequency("Every Two Weeks"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${
                        orderData?.frequency === "Every Two Weeks"
                          ? "bg-theme-blue text-white"
                          : ""
                      }`}
                    >
                      Every Two Weeks
                    </div>
                    <div
                      onClick={() => dispatch(setFrequency("Every Four Weeks"))}
                      className={`rounded-lg border-2 border-theme-gray px-4 h-[56px] flex justify-center items-center cursor-pointer ${
                        orderData?.frequency === "Every Four Weeks"
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
                      $0
                    </div>
                    <div
                      className={
                        orderData?.driverTip === 1
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(1))}
                    >
                      $1
                    </div>
                    <div
                      className={
                        orderData?.driverTip === 2
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(2))}
                    >
                      $2
                    </div>
                    <div
                      className={
                        orderData?.driverTip === 5
                          ? "bg-theme-blue text-white"
                          : ""
                      }
                      onClick={() => dispatch(setDriverTip(5))}
                    >
                      $5
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
                        ${totalAmount?.toFixed(2)}
                      </h4>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Minimum order charge</h4>
                      <p className="">
                        $
                        {parseFloat(
                          addressData?.data?.zoneUpfrontAmount
                        )?.toFixed(2) ?? "0.00"}
                      </p>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Service fee</h4>
                      <p className="">
                        $
                        {parseFloat(
                          addressData?.data?.zoneSeviceCharge
                        )?.toFixed(2) ?? "0.00"}
                      </p>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Driver Tip</h4>
                      <p className="">
                        ${parseFloat(orderData?.driverTip)?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between font-sf">
                      <h4 className="">Collection & delivery</h4>
                      <p className="">Free</p>
                    </div>
                  </div>
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
                            history.replaceState(
                              { customData: { step: "get-started" } },
                              ""
                            );
                            router.push("/order-registration");
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
                    className={`flex justify-center items-center cursor-pointer ${
                      true === "hung"
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
              value={orderData?.driverTip || ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                dispatch(setDriverTip(isNaN(value) ? 0 : value));
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
