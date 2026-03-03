"use client";
import React, { useState, useEffect } from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { ButtonYouth70018, PurpleButton } from "../../../../components/Buttons";
import { IoBagCheck, IoLocation, IoShirt, IoCalendarOutline, IoTimeOutline, IoInformationCircleOutline, IoLocationOutline, IoBagOutline, IoCheckmarkSharp, IoFlask } from "react-icons/io5";
import { MdThermostat } from "react-icons/md";
import { useGetServicesQuery, useGetServiceWithPreferenceDetailsQuery } from "@/app/store/services/api";
import { useDisclosure } from "@heroui/react";
import ReusableModal from "../../../../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  setDriverInstruction,
  setDriverTip,
  setPage,
  updatePreference,
} from "@/app/store/slices/cartItemSlice";
import { FaTruck } from "react-icons/fa6";
import { formatDate, to24Hour } from "../../../../utilities/ConversionFunction";
import FAQs from "../../../../components/FAQs";
import Footer from "../../../../components/Footer";
import { useRouter } from "next/navigation";
import HomeClientWrapper from "../../../../utilities/Test";
import InputField from "../../../../components/InputHeroUi";
import { MiniLoader } from "../../../../components/Loader";
import { BASE_URL } from "../../../../utilities/URL";

export default function Order() {
  const dispatch = useDispatch();
  const orderData = useSelector((state) => state.cart.orderData);
  const preferencesData = useSelector((state) => state.cart.preferences) || [];
  const router = useRouter();
  const { data, isLoading } = useGetServicesQuery();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll, setModalScroll] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [modal, setModal] = useState({
    modType: "wash",
    step: "",
  });
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Fetch preferences when serviceId is set
  const { data: preferencesResponse, isLoading: isLoadingPreferences } =
    useGetServiceWithPreferenceDetailsQuery(currentServiceId, {
      skip: !currentServiceId,
    });

  const servicePreferencesData = preferencesResponse?.data?.preferencesData;

  // Initialize preferences state based on fetched data
  const [preferences, setPreferences] = useState({});

  // Initialize preferences when service preferences data is loaded
  useEffect(() => {
    if (Array.isArray(servicePreferencesData) && servicePreferencesData.length > 0) {
      const initialPrefs = {};
      servicePreferencesData.forEach((pref) => {
        const prefName = pref.preferenceType?.name?.toLowerCase();
        const prefValues = pref.preferenceType?.preferenceValues || [];
        if (prefName && prefValues.length > 0) {
          // Set first value as default
          initialPrefs[prefName] = {
            preferenceTypeId: pref.preferenceTypeId,
            preferenceTypeName: pref.preferenceType?.name || prefName,
            preferenceValueId: prefValues[0].id,
            value: prefValues[0].value,
          };
        }
      });
      // Add additional instructions field
      initialPrefs.additionalInstructions = "";
      setPreferences(initialPrefs);
    } else if (servicePreferencesData) {
      setPreferences({});
    }
  }, [servicePreferencesData, currentServiceId]);

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  function closePreferenceModal() {
    if (currentServiceId) {
      // Build preferences array with preferenceTypeId and preferenceValueId
      const preferencesArray = [];
      const preferencesDisplay = [];
      Object.keys(preferences).forEach((key) => {
        if (key !== "additionalInstructions" && preferences[key]?.preferenceTypeId) {
          preferencesArray.push({
            preferenceTypeId: preferences[key].preferenceTypeId,
            preferenceValueId: preferences[key].preferenceValueId,
            serviceId: currentServiceId,
          });
          preferencesDisplay.push({
            preferenceTypeName:
              preferences[key].preferenceTypeName || key,
            value: preferences[key].value || "",
          });
        }
      });

      // Get service name from services data
      const serviceName = data?.data?.serviceData?.find(
        (s) => s.id === currentServiceId
      )?.name || "";

      const prefsData = {
        serviceName,
        preferencesArray,
        preferencesDisplay,
        additionalInstructions: preferences.additionalInstructions || "",
      };

      // Dispatch to redux
      dispatch(updatePreference({ serviceId: currentServiceId, data: prefsData }));

      // Reset state
      setPreferences({});
      setCurrentServiceId(null);
    }
    setModal({ ...modal, modType: "" });
    onClose();
  }

  return (
    <>
      <HomeClientWrapper>
        <div className="w-full relative">
          <div className="max-xl:fixed max-xl:z-50 w-full">
            <Header type="order" />
          </div>

          <div className="w-full px-5 sm:px-[45px]">
            <div className="w-full max-w-[1290px] mx-auto pt-32 md:pb-[50px] 2xl:py-[70px]">
              <h4 className="font-bold font-youth text-3xl 2xl:text-6xl">
                Let us know which services you need:
              </h4>

              <div className="flex flex-col lg:flex-row gap-10 2xl:gap-20 pt-10">
                {/* Cards - Hide on mobile when summary is shown */}
                <div className={`w-full space-y-5 ${showMobileSummary ? 'lg:block hidden' : ''}`}>
                  {!isLoading ? (
                    data?.data?.serviceData?.map((item) => {
                      // Construct dynamic image URL from API response
                      const imageUrl = item?.image
                        ? `${BASE_URL}${item.image}`
                        : "/images/pricing/clothes.png"; // Fallback image if no image provided

                      // Determine icon based on service name
                      const getIcon = (serviceName) => {
                        const name = serviceName?.toLowerCase() || "";
                        if (name.includes("iron")) return TbIroning;
                        if (name.includes("dry clean")) return MdOutlineDryCleaning;
                        if (name.includes("press")) return TbIroningSteam;
                        return TbWash;
                      };

                      // Determine background color based on service ID
                      const getBg = (id) => {
                        if (id === 1) return "2";
                        if (id === 2) return "1";
                        if (id === 3) return "4";
                        if (id === 4) return "4";
                        if (id === 5) return "5";
                        return "1";
                      };

                      // Determine right positioning based on service ID
                      const getRight = (id) => {
                        if (id === 1) return "right-0";
                        if (id === 2) return "-right-16";
                        if (id === 3 || id === 4) return "-right-10";
                        if (id === 5) return "-right-6";
                        return "right-0";
                      };

                      // Check if service is selected
                      const isSelected = Array.isArray(preferencesData) &&
                        preferencesData?.some((elem) => elem?.serviceId === item?.id);

                      return (
                        <CategoryCard
                          key={item?.id}
                          onClick={() => {
                            setCurrentServiceId(item?.id);
                            setModal({ ...modal, modType: "servicePreferences" });
                            onOpen();
                          }}
                          bg={getBg(item?.id)}
                          h={item?.name}
                          Icon={getIcon(item?.name)}
                          src={imageUrl}
                          right={getRight(item?.id)}
                          type={isSelected ? "check" : "plus"}
                          serviceId={item?.id}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-xl font-semibold w-max mx-auto">
                      <MiniLoader />
                    </div>
                  )}

                  {/* Mobile Continue Button - Shows summary (only visible when services are shown) */}
                  {!showMobileSummary && (
                    <div className="lg:hidden sticky bottom-4 left-0 right-0 z-50 mt-6 pb-4">
                      <ButtonYouth70018
                        isDisabled={
                          !preferencesData?.length ||
                          !orderData?.collectionData?.streetAddress
                        }
                        text="Continue"
                        onClick={() => {
                          setShowMobileSummary(true);
                        }}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Order Summary - Hidden on mobile by default, shown when Continue is clicked */}
                <div className={`lg:w-[600px] space-y-4 ${showMobileSummary ? 'block' : 'hidden lg:block'}`}>
                  <div className="px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
                    <div className="flex items-center gap-x-3 my-2">
                      <IoBagOutline size={16} />

                      <p className="font-sf font-semibold">Pickup</p>
                    </div>

                    <div className="space-y-4">
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Scheduled for</p>
                        <p className="text-theme-psGray">Collection</p>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center justify-center">
                            <IoCalendarOutline size="16" />
                          </div>
                          <p className="text-sm font-medium">
                            {formatDate(
                              orderData?.collectionData?.collectionDate
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center justify-center">
                            <IoTimeOutline size="16" />
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
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center justify-center">
                            <IoInformationCircleOutline size="16" />
                          </div>
                          <p className="text-sm font-medium">
                            {
                              orderData?.collectionData
                                ?.driverInstructionOptions
                            }
                          </p>
                        </div>
                      </div>
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Delivery</p>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center justify-center">
                            <IoCalendarOutline size="16" />
                          </div>
                          <p className="text-sm font-medium">
                            {formatDate(orderData?.deliveryData?.deliveryDate)}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center justify-center">
                            <IoTimeOutline size="16" />
                          </div>
                          <p className="text-sm font-medium">
                            {to24Hour(
                              orderData?.deliveryData?.deliveryTimeFrom
                            )}{" "}
                            -{" "}
                            {to24Hour(orderData?.deliveryData?.deliveryTimeTo)}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center justify-center">
                            <IoInformationCircleOutline size="16" />
                          </div>
                          <p className="text-sm font-medium">
                            {orderData?.deliveryData?.driverInstructionOptions1}
                          </p>
                        </div>
                      </div>
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Address</p>

                        <div className="flex gap-4 items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <div className="flex items-center justify-center">
                              <IoLocationOutline size="16" />
                            </div>
                            <p className="text-sm font-medium line-clamp-1">
                              {orderData?.collectionData?.streetAddress}
                            </p>
                          </div>

                          <p
                            onClick={() => {
                              router.push("/place-order");
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
                          <div className="flex gap-2 items-center">
                            <div className="flex items-center justify-center">
                              <IoInformationCircleOutline size="16" />
                            </div>
                            <p className="text-sm font-medium">
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
                            className="text-white font-sf font-normal px-3 capitalize py-1 bg-black rounded-full shrink-0 text-sm cursor-pointer"
                          >
                            {orderData?.driverInstruction ? "update" : "add"}
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

                  {/* Mobile Continue Button - Sticky at bottom of summary section */}
                  <div className="lg:hidden sticky bottom-4 left-0 right-0 z-50 mt-6 pb-4">
                    <ButtonYouth70018
                      isDisabled={
                        !preferencesData?.length ||
                        !orderData?.collectionData?.streetAddress
                      }
                      text="Continue"
                      onClick={() => {
                        dispatch(setPage(true));
                        router.push("/checkout/payment");
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* ///////////////service preferences///////////// */}

                  <div className="px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
                    <div className="flex items-center justify-center gap-x-3 my-2">
                      <IoShirt size={20} />

                      <p className="font-sf font-semibold">
                        Services Requested
                      </p>
                    </div>

                    {preferencesData?.length > 0 ? (
                      <div>
                        {preferencesData?.map((item, idx) => (
                          <div
                            key={idx}
                            className="font-sf pt-3 border-b-2 border-theme-gray pb-3"
                          >
                            <p className="text-theme-psGray font-sf">Service</p>
                            <p className="text-sm font-medium capitalize">
                              {item?.serviceName || "Selected"}
                            </p>

                            {Array.isArray(item?.preferencesDisplay) &&
                              item.preferencesDisplay.length > 0 &&
                              item.preferencesDisplay.map((pref, prefIdx) => (
                                <React.Fragment key={`${idx}-${prefIdx}`}>
                                  <p className="text-theme-psGray font-sf">
                                    {pref?.preferenceTypeName || "Preference"}
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {pref?.value || "-"}
                                  </p>
                                </React.Fragment>
                              ))}

                            {item?.additionalInstructions && (
                              <>
                                <p className="text-theme-psGray font-sf">
                                  Instructions
                                </p>
                                <p className="text-sm font-medium capitalize">
                                  {item?.additionalInstructions}
                                </p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="font-sf pt-3">
                        <p className="text-theme-psGray">Service</p>
                        <p className="text-sm font-medium">Not selected</p>
                      </div>
                    )}

                    {/* Continue Button - Desktop Only */}
                    <div className="hidden lg:block py-3">
                      <ButtonYouth70018
                        isDisabled={
                          !preferencesData?.length ||
                          !orderData?.collectionData?.streetAddress
                        }
                        text="Continue"
                        onClick={() => {
                          dispatch(setPage(true));
                          router.push("/checkout/payment");
                        }}
                        className="w-full"
                      />
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
      </HomeClientWrapper>

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={true}
        isOpen={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            // Reset state when modal closes
            setCurrentServiceId(null);
            setPreferences({});
            setModal({ ...modal, modType: "" });
          }
        }}
        showHeader={true}
        headerTitle="Service Preferences"
        modalScroll={modalScroll}
        onBack={false}
        onClose={false}
        showFooter={true}
        footerContent={
          <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
            <ButtonYouth70018
              text="continue"
              onClick={() => {
                closePreferenceModal();
              }}
            />
          </div>
        }
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class max-h-[90vh] overflow-auto"
      >
        {modal?.modType === "servicePreferences" && currentServiceId ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Service Preferences
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            {isLoadingPreferences ? (
              <div className="w-full px-6 py-6 font-sf flex justify-center items-center min-h-[200px]">
                <MiniLoader />
              </div>
            ) : servicePreferencesData && servicePreferencesData.length > 0 ? (
              <div className="w-full px-6 py-6 font-sf">
                <div className="space-y-6">
                  {servicePreferencesData.map((pref) => {
                    const prefName = pref.preferenceType?.name?.toLowerCase();
                    const prefKey = prefName || `pref_${pref.preferenceTypeId}`;
                    const currentPref = preferences[prefKey];
                    const values = pref.preferenceType?.preferenceValues || [];
                    const getGridClass = (count) => {
                      if (count <= 2) return "grid-cols-2";
                      if (count <= 4) return "grid-cols-4";
                      return "grid-cols-2";
                    };
                    const PreferenceIcon = prefName?.includes("wash") || prefName?.includes("type")
                      ? IoShirt
                      : prefName?.includes("temp")
                        ? MdThermostat
                        : prefName?.includes("detergent")
                          ? IoFlask
                          : IoShirt;

                    return (
                      <div key={pref.id} className="space-y-3">
                        <p className="font-sf font-semibold text-base sm:text-lg text-theme-gray-3">
                          Please select your preference for {pref.preferenceType?.name || "Preference"}
                        </p>
                        <div className={`grid ${getGridClass(values.length)} gap-2 sm:gap-3`}>
                          {values.map((value) => {
                            const isSelected = currentPref?.preferenceValueId === value.id;
                            return (
                              <button
                                type="button"
                                key={value.id}
                                onClick={() =>
                                  setPreferences((prev) => ({
                                    ...prev,
                                    [prefKey]: {
                                      preferenceTypeId: pref.preferenceTypeId,
                                      preferenceTypeName:
                                        pref.preferenceType?.name || prefKey,
                                      preferenceValueId: value.id,
                                      value: value.value,
                                    },
                                  }))
                                }
                                className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer text-left transition-all min-h-[80px] sm:min-h-[88px] ${
                                  isSelected
                                    ? "border-theme-blue bg-theme-skyBlue/30"
                                    : "border-theme-gray bg-white hover:border-theme-gray-2"
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center size-5 rounded-full bg-theme-blue text-white">
                                    <IoCheckmarkSharp className="size-3" />
                                  </span>
                                )}
                                <span className="flex items-center justify-center size-8 sm:size-9 rounded-full bg-theme-skyBlue text-theme-blue mb-1 sm:mb-1.5">
                                  <PreferenceIcon className="size-4 sm:size-5" />
                                </span>
                                <span className="font-sf font-medium text-[11px] sm:text-xs text-theme-gray-3 text-center leading-tight">
                                  {value.value}
                                </span>
                                {(value.temperature || value.meta) && (
                                  <span className="mt-1 inline-flex items-center rounded-full bg-theme-skyBlue px-2 py-0.5 font-sf text-[10px] sm:text-xs text-theme-blue">
                                    {value.temperature || value.meta}
                                  </span>
                                )}
                                {(value.price != null || value.weight != null) && (
                                  <span className="mt-0.5 font-sf text-[10px] text-theme-gray-2">
                                    {value.price != null && `£${value.price}`}
                                    {value.price != null && value.weight != null && " / "}
                                    {value.weight != null && `${value.weight}kg`}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                    value={preferences.additionalInstructions || ""}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        additionalInstructions: e.target.value,
                      }))
                    }
                  />

                  <p className="font-sf pb-5 text-sm text-theme-psGray">
                    The user is responsible if the clothes color bleeds due to the
                    selected wash settings and temperature.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full px-6 py-6 font-sf">
                <p className="text-center text-theme-psGray">
                  No preferences available for this service.
                </p>
              </div>
            )}
          </div>
        ) : modal.modType === "dry cleaning" ? (
          ""
        ) : modal.modType === "driverInstructions" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
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
          ""
        )}
      </ReusableModal>
    </>
  );
}
