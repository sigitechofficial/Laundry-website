"use client";
import React, { useEffect, useRef, useState } from "react";
import InputHeroUi from "../../../components/InputHeroUi";
import {
  ButtonYouth70018,
} from "../../../components/Buttons";
import { PiArrowRight } from "react-icons/pi";
import SelectHero from "../../../components/SelectHero";
import { FaPlus } from "react-icons/fa6";
import ReusableModal from "../../../components/Modal";
import { Spinner, useDisclosure } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { TbLocation } from "react-icons/tb";
import { Autocomplete } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { generateCollectionSlots } from "../../../utilities/generateSlots";
import { useDispatch, useSelector } from "react-redux";
import { setOrderData, setPage } from "../store/slices/cartItemSlice";
import { useGetAllAddressQuery } from "../store/services/api";
import Link from "next/link";
import Header from "../../../components/Header";
import HomeClientWrapper from "../../../utilities/Test";
import GoogleMapsProvider from "../../../utilities/GoogeMapsProvider";
import { MiniLoader } from "../../../components/Loader";

const collection = [
  { key: "Collect from me in person", label: "Collect from me in person" },
  { key: "Collect from the reception", label: "Collect from the reception" },
];
const delivery = [
  { key: "Deliver to me in person", label: "Deliver to me in person" },
  { key: "Deliver from the reception", label: "Deliver from the reception" },
];

export default function orderRegistration() {
  const router = useRouter();
  const orderData = useSelector((state) => state.cart.orderData);
  const state = history.state?.customData?.step || null;
  const dispatch = useDispatch();
  const { data } = useGetAllAddressQuery();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const autocompleteRef = useRef(null);
  const [step, setStep] = useState(state ?? "get-started");
  const [modal, setModal] = useState({
    modType: "",
  });
  const [modalScroll, setModalScroll] = useState(false);

  const slots = generateCollectionSlots({
    daysCount: 4,
    slotDurationInHours: 1,
    lastHour: 19, // 7 PM
    startAfterHours: 1, // default: 1 hour ahead (for collection)
  });

  const slotsDelivery = generateCollectionSlots({
    daysCount: 4,
    slotDurationInHours: 1,
    lastHour: 19, // 7 PM
    startAfterHours: 24, // default: 1 hour ahead (for collection)
  });

  const [driverInstruction, setDriverInstruction] = useState("");
  const [collectionData, setCollectionData] = useState({
    collectionDate: "",
    collectionTimeTo: "",
    collectionTimeFrom: "",
    driverInstructionOptions: "",
    availableTimeSlots: slots?.[0]?.timeSlots || [],
    title: "Home", // 'Home', 'Office', 'Hotel', or 'Other'
    hotelName: null,
    apartmentNumber: null,
    floor: null,
    streetAddress: "",
    district: "",
    city: "",
    province: "",
    country: "",
    postalCode: "",
    lat: null,
    lng: null,
    radius: 10,
    addressType: "pickUp",
    save: false,
  });
  console.log("🚀 ~ orderRegistration ~ collectionData:", collectionData);

  const [deliveryData, setDeliveryData] = useState({
    deliveryDate: "",
    deliveryTimeTo: "",
    deliveryTimeFrom: "",
    driverInstructionOptions1: "",
    availableTimeSlots: slotsDelivery?.[0]?.timeSlots || [],
    title: "Home", // 'Home', 'Office', 'Hotel', or 'Other'
    hotelName: null,
    apartmentNumber: null,
    floor: null,
    streetAddress: "",
    district: "",
    city: "",
    province: "",
    country: "",
    postalCode: "",
    lat: null,
    lng: null,
    radius: 10,
    addressType: "dropOff",
  });

  const handlePlaceChanged = (type) => {
    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      // info_toaster("Please search an address");
      return;
    }

    if (type === "delivery-location") {
      setDeliveryData({
        ...deliveryData,
        hotelName: null,
        apartmentNumber: null,
        floor: null,
        streetAddress: place?.formatted_address,
        district:
          place?.address_components?.find(
            (c) =>
              c.types.includes("sublocality") ||
              c.types.includes("neighborhood")
          )?.long_name || "",
        city:
          place?.address_components?.find(
            (c) =>
              c.types.includes("locality") ||
              c.types.includes("administrative_area_level_2")
          )?.long_name || "",
        province:
          place?.address_components?.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "",
        country:
          place?.address_components?.find((c) => c.types.includes("country"))
            ?.long_name || "",
        postalCode:
          place?.address_components?.find((c) =>
            c.types.includes("postal_code")
          )?.long_name || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    } else {
      setCollectionData({
        ...collectionData,
        hotelName: null,
        apartmentNumber: null,
        floor: null,
        streetAddress: place?.formatted_address,
        district:
          place?.address_components?.find(
            (c) =>
              c.types.includes("sublocality") ||
              c.types.includes("neighborhood")
          )?.long_name || "",
        city:
          place?.address_components?.find(
            (c) =>
              c.types.includes("locality") ||
              c.types.includes("administrative_area_level_2")
          )?.long_name || "",
        province:
          place?.address_components?.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "",
        country:
          place?.address_components?.find((c) => c.types.includes("country"))
            ?.long_name || "",
        postalCode:
          place?.address_components?.find((c) =>
            c.types.includes("postal_code")
          )?.long_name || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const handleUseCurrentLocation = (add) => {
    if (add?.id) {
      setCollectionData((prev) => ({
        ...prev,
        id: add?.id,
        streetAddress: add.streetAddress,
        district: add?.district,
        title: add?.title,
        addressType: add?.addressType,
        province: add?.province,
        hotelName: null,
        apartmentNumber: null,
        floor: null,
        city: "",
        country: "",
        postalCode: "",
        lat: null,
        lng: null,
      }));
      setModal({ ...modal, modType: "" });
      onClose();
    } else {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results[0]) {
                const place = results[0];
                setCollectionData((prev) => ({
                  ...prev,
                  hotelName: null,
                  apartmentNumber: null,
                  floor: null,
                  streetAddress: place.formatted_address,
                  district:
                    place.address_components?.find(
                      (c) =>
                        c.types.includes("sublocality") ||
                        c.types.includes("neighborhood")
                    )?.long_name || "",
                  city:
                    place.address_components?.find(
                      (c) =>
                        c.types.includes("locality") ||
                        c.types.includes("administrative_area_level_2")
                    )?.long_name || "",
                  province:
                    place.address_components?.find((c) =>
                      c.types.includes("administrative_area_level_1")
                    )?.long_name || "",
                  country:
                    place.address_components?.find((c) =>
                      c.types.includes("country")
                    )?.long_name || "",
                  postalCode:
                    place.address_components?.find((c) =>
                      c.types.includes("postal_code")
                    )?.long_name || "",
                  lat,
                  lng,
                }));

                setModal({ ...modal, modType: "" });
                onClose();
              } else {
                console.log("Unable to retrieve address.");
              }
            });
          } catch (err) {
            console.log("Geocoding failed.");
          }
        },
        () => {
          console.log("Permission denied or location unavailable.");
        }
      );
    }
  };

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  useEffect(() => {
    if (orderData) {
      if (orderData.collectionData) {
        setCollectionData(orderData.collectionData);
      }
      if (orderData.deliveryData) {
        setDeliveryData(orderData.deliveryData);
      }
      if (orderData.driverInstruction) {
        setDriverInstruction(orderData.driverInstruction);
      }
    }
  }, [orderData]);

  return (
    <HomeClientWrapper>
       <GoogleMapsProvider>
      <div className="w-full grid lg:grid-cols-2">
        <div className="h-[300px] max-sm:hidden sm:h-[600px] lg:h-screen w-full bg-sign-in bg-cover bg-center bg-no-repeat relative">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover object-center lg:hidden"
            src="/images/signInVideo.mp4"
          ></video>

          <div className="w-full max-w-[565px] mx-auto my-auto absolute bottom-5 left-1/2 -translate-x-1/2 lg:hidden">
            <div className="mx-auto w-max pb-1 sm:pb-4">
              <p className="font-sf sm:text-xl font-medium text-theme-blue">
                Welcome to
              </p>
              <h4 className="font-youth font-bold text-2xl sm:text-[40px] leading-8 text-theme-blue">
                Just Dry Cleaners
              </h4>
            </div>
            <Link onClick={() => dispatch(setPage(true))} href="/">
              <img
                className="mx-auto w-12 sm:w-auto"
                src="/images/logo.png"
                alt="logo"
              />
            </Link>
          </div>

          <div className="w-full h-14 flex justify-center items-center absolute z-20 -bottom-14 left-0 px-8 bg-theme-gray lg:hidden">
            <p className="max-w-[565px] font-sf text-xs sm:text-base">
              Create an account and start enjoying cleaner clothes with zero
              effort!
            </p>
          </div>
        </div>

        <div className="max-xl:fixed max-xl:z-50 w-full sm:hidden">
          <Header type="" />
        </div>

        <div className="w-full flex justify-center items-center">
          {step === "new-order" ? (
            <div className="w-full h-screen flex justify-center lg:items-center overflow-auto px-8 pad-y">
              <div className="w-full max-w-[565px] mx-auto ">
                <img
                  className="mx-auto max-lg:hidden"
                  src="/images/logo.png"
                  alt="logo"
                />

                <div className="mx-auto w-max pt-3 max-lg:hidden">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <div className="flex justify-center pt-12 2xl:pt-20 text-theme-blue">
                  <div
                    onClick={() => setStep("get-started")}
                    className="size-[320px] 2xl:size-[480px] rounded-full shrink-0 bg-theme-gray border-4 border-theme-blue flex flex-col justify-center items-center cursor-pointer"
                  >
                    <p className="font-sf font-semibold text-xl 2xl:text-3xl text-center">
                      New Order
                    </p>
                    <h4 className="font-sf font-semibold text-3xl 2xl:text-[40px] text-center">
                      Do my Laundry
                    </h4>

                    <div className="">
                      <PiArrowRight className="text-5xl 2xl:text-7xl text-theme-blue" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : step === "get-started" ? (
            <div className="w-full h-screen flex justify-center 2xl:items-center overflow-auto px-5 sm:px-8 py-20 ">
              <div className="w-full max-w-[565px] mx-auto">
                <Link onClick={() => dispatch(setPage(true))} href="/">
                  <img
                    className="mx-auto cursor-pointer max-lg:hidden"
                    src="/images/logo.png"
                    alt="logo"
                  />
                </Link>

                <div className="mx-auto w-max pt-3 max-lg:hidden">
                  <p className="font-sf text-xl font-medium text-theme-blue">
                    Welcome to
                  </p>
                  <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                    Just Dry Cleaners
                  </h4>
                </div>

                <div className="space-y-5 pt-10 font-sf">
                  <h4 className="font-youth font-bold text-[32px] text-center">
                    Let’s get Started
                  </h4>
                  <div
                    onClick={() => {
                      setModal({ ...modal, modType: "address" });
                      onOpen();
                    }}
                  >
                    <InputHeroUi
                      type="text"
                      label="Address"
                      value={collectionData?.streetAddress}
                    />
                  </div>

                  <div
                    onClick={() => {
                      setModal({ ...modal, modType: "collection-date" });
                      onOpen();
                    }}
                  >
                    <InputHeroUi
                      type="text"
                      label="Collection"
                      value={collectionData?.collectionDate}
                      endContent={
                        <span className="whitespace-nowrap">
                          {collectionData?.collectionTimeFrom
                            ? `${
                                collectionData?.collectionTimeFrom?.split(
                                  " "
                                )[0]
                              } - ${
                                collectionData?.collectionTimeTo?.split(" ")[0]
                              }`
                            : ""}
                        </span>
                      }
                    />
                  </div>
                  <SelectHero
                    label="Select collection method"
                    list={collection}
                    value={collectionData?.driverInstructionOptions}
                    onChange={(e) =>
                      setCollectionData({
                        ...collectionData,
                        driverInstructionOptions: e.target.value,
                      })
                    }
                  />

                  <div
                    onClick={() => {
                      setModal({ ...modal, modType: "delivery-date" });
                      onOpen();
                    }}
                  >
                    <InputHeroUi
                      type="text"
                      label="Delivery"
                      value={deliveryData?.deliveryDate}
                      endContent={
                        <span className="whitespace-nowrap">
                          {deliveryData?.deliveryTimeFrom
                            ? `${
                                deliveryData?.deliveryTimeFrom?.split(" ")[0]
                              } - ${
                                deliveryData?.deliveryTimeTo?.split(" ")[0]
                              }`
                            : ""}
                        </span>
                      }
                    />
                  </div>
                  <SelectHero
                    label="Select delivery method"
                    list={delivery}
                    value={deliveryData?.driverInstructionOptions1 }
                    onChange={(e) =>
                      setDeliveryData({
                        ...deliveryData,
                        driverInstructionOptions1: e.target.value,
                      })
                    }
                  />

                  <div
                    onClick={() => {
                      setModal({ ...modal, modType: "driver" });
                      onOpen();
                    }}
                    className="h-[60px] px-4 text-white bg-theme-blue rounded-lg font-sf flex justify-between items-center cursor-pointer"
                  >
                    <div className="">
                      <h6>Driver instruction</h6>
                      <p className="line-clamp-1">
                        {driverInstruction
                          ? driverInstruction
                          : "Instructions for the driver"}
                      </p>
                    </div>

                    <FaPlus className="text-2xl text-white" />
                  </div>
                  <div className="pt-6 pb-10">
                    <ButtonYouth70018
                      text="Continue"
                      isDisabled={
                        collectionData?.collectionDate &&
                        collectionData?.collectionTimeTo &&
                        deliveryData?.deliveryDate &&
                        deliveryData?.deliveryTimeTo &&
                        collectionData?.streetAddress &&
                        collectionData?.driverInstructionOptions &&
                        deliveryData?.driverInstructionOptions1
                          ? false
                          : true
                      }
                      onClick={() => {
                        const orderData = {
                          collectionData,
                          deliveryData,
                          driverInstruction: driverInstruction,
                        };

                        dispatch(setOrderData(orderData));

                        setStep("");
                        onClose();
                        router.push("/checkout/order");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // <Spinner
            //   classNames={{ label: "text-foreground mt-4" }}
            //   size="lg"
            //   label="Loading..."
            //   variant="wave"
            // />

            <MiniLoader/>
          )}
        </div>
      </div>

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        modalScroll={modalScroll}
        showHeader={true}
        headerTitle={
          modal?.modType === "address"
            ? "Enter Your Location"
            : modal?.modType === "collection-date"
            ? "Collection"
            : modal?.modType === "delivery-date"
            ? "Delivery"
            : "Driver instruction"
        }
        onBack={false}
        onClose={false}
        showFooter={true}
        footerContent={
          modal?.modType === "collection-date" ? (
            <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
              <ButtonYouth70018
                isDisabled={
                  collectionData?.collectionDate &&
                  collectionData?.collectionTimeTo
                    ? false
                    : true
                }
                text="continue"
                onClick={() => {
                  setModal({ ...modal, modType: "" });
                  onClose();
                }}
              />
            </div>
          ) : modal?.modType === "delivery-date" ? (
            <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
              <ButtonYouth70018
                isDisabled={
                  deliveryData?.deliveryDate && deliveryData?.deliveryTimeTo
                    ? false
                    : true
                }
                text="continue"
                onClick={() => {
                  setModal({ ...modal, modType: "" });
                  onClose();
                }}
              />
            </div>
          ) : (
            ""
          )
        }
        footerButtonText="Confirm Delete"
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class max-h-[90vh] overflow-auto"
      >
        {modal?.modType === "address" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Enter Your Location
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                {collectionData?.streetAddress ? "Done" : "Cancel"}
              </p>
            </div>

            <div className="w-full px-6 py-8">
              <div className="relative border-2 border-theme-gray-2/25 rounded-lg w-full h-14">
                <div className="absolute top-1/2 -translate-y-1/2 left-3">
                  <IoSearchOutline className="text-2xl text-theme-gray-2" />
                </div>

                <Autocomplete
                  onLoad={(autocomplete) =>
                    (autocompleteRef.current = autocomplete)
                  }
                  onPlaceChanged={handlePlaceChanged}
                  className="w-full h-full"
                >
                  <input
                    className="w-full h-full pl-14 pr-2 outline-none bg-transparent"
                    type="text"
                    placeholder="Search location"
                  />
                </Autocomplete>
              </div>

              <div className="flex items-center gap-5 pt-4">
                <div className="size-10 rounded-full shrink-0 bg-theme-gray flex justify-center items-center cursor-pointer">
                  <TbLocation size={20} />
                </div>

                <div
                  onClick={handleUseCurrentLocation}
                  className="font-sf cursor-pointer"
                >
                  <h6 className="text-base font-medium">
                    Use my current location
                  </h6>
                  <p className="text-sm text-theme-psGray">
                    Fomino will use your location
                  </p>
                </div>
              </div>

              {data?.data &&
                data?.data?.map((add) => {
                  return (
                    <div className="flex items-center gap-5 pt-4">
                      <div className="size-10 rounded-full shrink-0 bg-theme-gray flex justify-center items-center cursor-pointer">
                        <TbLocation size={20} />
                      </div>

                      <div
                        onClick={() => handleUseCurrentLocation(add)}
                        className="font-sf cursor-pointer"
                      >
                        <h6 className="text-base font-medium">
                          {add?.district}
                        </h6>
                        <p className="text-sm text-theme-psGray line-clamp-1">
                          {add?.streetAddress + " " + add?.province}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : modal?.modType === "collection-date" ? (
          <div
            onScroll={handleModalScroll}
            className="max-h-[95vh] overflow-y-auto modal-scroll"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Collection
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6">
              <div className="space-y-5">
                <h6 className="font-sf text-xl font-medium">April 2025</h6>

                <div className="flex gap-5 items-center font-sf">
                  {slots?.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-center"
                      >
                        <div
                          onClick={() => {
                            setCollectionData({
                              ...collectionData,
                              collectionDate: item?.date,
                              availableTimeSlots: item?.timeSlots,
                            });
                          }}
                          className={`text-2xl font-semibold size-14 rounded-full shrink-0 flex items-center justify-center ${
                            collectionData?.collectionDate === item?.date
                              ? "bg-theme-blue text-white"
                              : "bg-theme-gray"
                          }`}
                        >
                          {item?.displayDate}
                        </div>
                        <p className="text-sm">{item?.dayLabel}</p>
                      </div>
                    );
                  })}

                  {/* <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      16
                    </div>
                    <p className="text-sm">Fri</p>
                  </div> */}
                </div>

                <p className="font-sf text-xl font-medium">Time slots</p>
              </div>

              <div className="space-y-4 pt-3 pb-8">
                {collectionData?.availableTimeSlots?.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCollectionData({
                          ...collectionData,
                          collectionTimeFrom: item?.start,
                          collectionTimeTo: item?.end,
                        });
                      }}
                      className={`w-full h-14 px-5 flex justify-between items-center  rounded-full shrink-0 font-sf font-semibold text-2xl ${
                        collectionData?.collectionTimeFrom === item?.start
                          ? "bg-theme-blue text-white"
                          : "bg-theme-gray"
                      }`}
                    >
                      <div className="flex items-center">
                        {item?.start?.split(" ")[0]}{" "}
                        <span className="text-xs">
                          {item?.start?.split(" ")[1]}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {item?.end?.split(" ")[0]}{" "}
                        <span className="text-xs">
                          {item?.end?.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : modal?.modType === "collection-location" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Enter Your Location
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-8">
              <div className="relative border-2 border-theme-gray-2/25 rounded-lg w-full h-14">
                <div className="absolute top-1/2 -translate-y-1/2 left-3">
                  <IoSearchOutline className="text-2xl text-theme-gray-2" />
                </div>

                <Autocomplete
                  onLoad={(autocomplete) =>
                    (autocompleteRef.current = autocomplete)
                  }
                  onPlaceChanged={() =>
                    handlePlaceChanged("collection-location")
                  }
                  className="w-full h-full"
                >
                  <input
                    className="w-full h-full pl-14 pr-2 outline-none bg-transparent"
                    type="text"
                    placeholder="Search location"
                  />
                </Autocomplete>
              </div>

              <div className="flex items-center gap-5 pt-4">
                <div className="size-10 rounded-full shrink-0 bg-theme-gray flex justify-center items-center cursor-pointer">
                  <TbLocation size={20} />
                </div>

                <div
                  onClick={handleUseCurrentLocation}
                  className="font-sf cursor-pointer"
                >
                  <h6 className="text-base font-medium">
                    Use my current location
                  </h6>
                  <p className="text-sm text-theme-psGray">
                    Fomino will use your location
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : modal?.modType === "delivery-date" ? (
          <div
            onScroll={handleModalScroll}
            className="max-h-[95vh] overflow-y-auto modal-scroll"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Delivery
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6">
              <div className="space-y-5">
                <h6 className="font-sf text-xl font-medium">April 2025</h6>

                <div className="flex gap-5 items-center font-sf">
                  <div className="flex gap-5 items-center font-sf">
                    {slotsDelivery?.map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            onClick={() => {
                              setDeliveryData({
                                ...deliveryData,
                                deliveryDate: item?.date,
                                availableTimeSlots: item?.timeSlots,
                              });
                            }}
                            className={`text-2xl font-semibold size-14 rounded-full shrink-0 flex items-center justify-center ${
                              deliveryData?.deliveryDate === item?.date
                                ? "bg-theme-blue text-white"
                                : "bg-theme-gray"
                            }`}
                          >
                            {item?.displayDate}
                          </div>
                          <p className="text-sm">{item?.dayLabel}</p>
                        </div>
                      );
                    })}

                    {/* <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      16
                    </div>
                    <p className="text-sm">Fri</p>
                  </div> */}
                  </div>
                </div>

                <p className="font-sf text-xl font-medium">Time slots</p>
              </div>

              <div className="space-y-4 pt-3">
                {deliveryData?.availableTimeSlots?.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setDeliveryData({
                          ...deliveryData,
                          deliveryTimeFrom: item?.start,
                          deliveryTimeTo: item?.end,
                        });
                      }}
                      className={`w-full h-14 px-5 flex justify-between items-center  rounded-full shrink-0 font-sf font-semibold text-2xl ${
                        deliveryData?.deliveryTimeFrom === item?.start
                          ? "bg-theme-blue text-white"
                          : "bg-theme-gray"
                      }`}
                    >
                      <div className="flex items-center">
                        {item?.start?.split(" ")[0]}{" "}
                        <span className="text-xs">
                          {item?.start?.split(" ")[1]}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {item?.end?.split(" ")[0]}{" "}
                        <span className="text-xs">
                          {item?.end?.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : modal?.modType === "delivery-location" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Enter Your Location
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-8">
              <div className="relative border-2 border-theme-gray-2/25 rounded-lg w-full h-14">
                <div className="absolute top-1/2 -translate-y-1/2 left-3">
                  <IoSearchOutline className="text-2xl text-theme-gray-2" />
                </div>

                <Autocomplete
                  onLoad={(autocomplete) =>
                    (autocompleteRef.current = autocomplete)
                  }
                  onPlaceChanged={() => handlePlaceChanged("delivery-location")}
                  className="w-full h-full"
                >
                  <input
                    className="w-full h-full pl-14 pr-2 outline-none bg-transparent"
                    type="text"
                    placeholder="Search location"
                  />
                </Autocomplete>
              </div>

              <div className="flex items-center gap-5 pt-4">
                <div className="size-10 rounded-full shrink-0 bg-theme-gray flex justify-center items-center cursor-pointer">
                  <TbLocation size={20} />
                </div>

                <div
                  onClick={handleUseCurrentLocation}
                  className="font-sf cursor-pointer"
                >
                  <h6 className="text-base font-medium">
                    Use my current location
                  </h6>
                  <p className="text-sm text-theme-psGray">
                    Fomino will use your location
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : modal?.modType === "driver" ? (
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
                  value={driverInstruction}
                  onChange={(e) => {
                    setDriverInstruction(e.target.value);
                  }}
                />
              </div>

              <div className="flex items-center gap-5 pt-5">
                <ButtonYouth70018
                  text="continue"
                  onClick={() => {
                    setModal({ ...modal, modType: "" });
                    onClose();
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </ReusableModal>
      </GoogleMapsProvider>
    </HomeClientWrapper>
  );
}
