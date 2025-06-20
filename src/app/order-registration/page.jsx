"use client";
import React, { useRef, useState } from "react";
import InputHeroUi from "../../../components/InputHeroUi";
import {
  ButtonContinueWith,
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

export default function orderRegistration() {
  const router = useRouter();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const autocompleteRef = useRef(null);
  const [step, setStep] = useState("new-order");
  const [modal, setModal] = useState({
    modType: "",
  });
  const [registrationData, setRegistrationData] = useState({
    address: "",
    lat: "",
    lng: "",
  });
  const [collectionData, setCollectionData] = useState({
    address: "",
    lat: "",
    lng: "",
    method: "",
    date: "",
    timeSlot: "",
  });
  const [deliveryData, setDeliveryData] = useState({
    address: "",
    lat: "",
    lng: "",
    method: "",
    date: "",
    timeSlot: "",
  });

  const handlePlaceChanged = (type) => {
    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      // info_toaster("Please search an address");
      return;
    }

    if (type === "collection-location") {
      setCollectionData({
        ...collectionData,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        streetAddress: place?.formatted_address,
        city: place?.address_components[place?.address_components?.length - 3]
          ?.long_name,
        state:
          place?.address_components[place?.address_components?.length - 2]
            ?.long_name,
        building: place?.name,
      });
    } else if (type === "delivery-location") {
      setDeliveryData({
        ...deliveryData,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        streetAddress: place?.formatted_address,
        city: place?.address_components[place?.address_components?.length - 3]
          ?.long_name,
        state:
          place?.address_components[place?.address_components?.length - 2]
            ?.long_name,
        building: place?.name,
      });
    } else {
      setRegistrationData({
        ...registrationData,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        streetAddress: place?.formatted_address,
        city: place?.address_components[place?.address_components?.length - 3]
          ?.long_name,
        state:
          place?.address_components[place?.address_components?.length - 2]
            ?.long_name,
        building: place?.name,
      });
    }
  };

  const handleUseCurrentLocation = () => {
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
              setRegistrationData({
                address: results[0].formatted_address,
                lat,
                lng,
              });
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
  };

  return (
    <>
      <div className="grid grid-cols-2">
        <div className="h-screen w-full bg-sign-in bg-cover bg-center bg-no-repeat"></div>

        <div className="w-full flex justify-center items-center">
          {step === "new-order" ? (
            <div className="w-full max-w-[565px] mx-auto">
              <img className="mx-auto" src="/images/logo.png" alt="logo" />

              <div className="mx-auto w-max pt-3">
                <p className="font-sf text-xl font-medium text-theme-blue">
                  Welcome to
                </p>
                <h4 className="font-youth font-bold text-[40px] leading-8 text-theme-blue">
                  Just Dry Cleaners
                </h4>
              </div>

              <div className="flex justify-center pt-20 text-theme-blue">
                <div
                  onClick={() => setStep("get-started")}
                  className="w-[480px] h-[480px] rounded-full shrink-0 bg-theme-gray border-4 border-theme-blue flex flex-col justify-center items-center cursor-pointer"
                >
                  <p className="font-sf font-semibold text-3xl text-center">
                    New Order
                  </p>
                  <h4 className="font-sf font-semibold text-[40px] text-center">
                    Do my Laundry
                  </h4>

                  <div className="">
                    <PiArrowRight className="text-3xl sm:text-7xl text-theme-blue" />
                  </div>
                </div>
              </div>
            </div>
          ) : step === "get-started" ? (
            <div className="w-full max-w-[565px] mx-auto">
              <img className="mx-auto" src="/images/logo.png" alt="logo" />

              <div className="mx-auto w-max pt-3">
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
                    value={registrationData?.address}
                  />
                </div>

                <div
                  onClick={() => {
                    setModal({ ...modal, modType: "collection-date" });
                    onOpen();
                  }}
                >
                  <InputHeroUi type="text" label="Collection" />
                </div>
                <SelectHero label="Select collection method" />

                <div
                  onClick={() => {
                    setModal({ ...modal, modType: "delivery-date" });
                    onOpen();
                  }}
                >
                  <InputHeroUi type="text" label="Delivery" />
                </div>
                <SelectHero label="Select delivery method" />

                <div className="h-[60px] px-4 text-white bg-theme-blue rounded-lg font-sf flex justify-between items-center cursor-pointer">
                  <div
                    onClick={() => {
                      setModal({ ...modal, modType: "driver" });
                      onOpen();
                    }}
                    className=""
                  >
                    <h6>Driver instruction</h6>
                    <p>Instructions for the driver</p>
                  </div>

                  <FaPlus className="text-2xl text-white" />
                </div>
                <div className="pt-6">
                  <ButtonYouth70018
                    text="Continue"
                    onClick={() => {
                      setStep("");
                      onClose();
                      router.push("/");
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              size="lg"
              label="Loading..."
              variant="wave"
            />
          )}
        </div>
      </div>

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        showHeader={false}
        headerTitle=""
        onBack={false}
        onClose={false}
        showFooter={false}
        footerButtonText="Confirm Delete"
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class"
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
            </div>
          </div>
        ) : modal?.modType === "collection-date" ? (
          <div className="">
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
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      13
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      14
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      15
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      16
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                </div>

                <p className="font-sf text-xl font-medium">Time slots</p>
              </div>

              <div className="space-y-4 pt-3">
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-blue text-white rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-gray rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-gray rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-gray rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-5">
                <ButtonYouth70018
                  text="continue"
                  onClick={() => {
                    setModal({ ...modal, modType: "collection-location" });
                    onOpen();
                  }}
                />
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
          <div className="">
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
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      13
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      14
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      15
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-semibold size-14 rounded-full shrink-0 bg-theme-blue text-white flex items-center justify-center">
                      16
                    </div>
                    <p className="text-sm">Fri</p>
                  </div>
                </div>

                <p className="font-sf text-xl font-medium">Time slots</p>
              </div>

              <div className="space-y-4 pt-3">
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-blue text-white rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-gray rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-gray rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
                <div className="w-full h-14 px-5 flex justify-between items-center  bg-theme-gray rounded-full shrink-0 font-sf font-semibold text-2xl">
                  <div className="flex items-center">
                    4:30 <span className="text-xs">PM</span>
                  </div>
                  <div className="flex items-center">
                    5:30 <span className="text-xs">PM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-5">
                <ButtonYouth70018
                  text="continue"
                  onClick={() => {
                    setModal({ ...modal, modType: "delivery-location" });
                    onOpen();
                  }}
                />
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
    </>
  );
}
