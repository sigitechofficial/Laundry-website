"use client";
import React, { useState, useEffect } from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { ButtonYouth70018, PurpleButton } from "../../../../components/Buttons";
import { IoBagCheck, IoLocation, IoShirt, IoCalendarOutline, IoTimeOutline, IoInformationCircleOutline, IoLocationOutline, IoBagOutline } from "react-icons/io5";
import {
  useRescheduleBookingMutation,
  useGetServicesQuery,
  useGetServiceWithPreferenceDetailsQuery,
} from "@/app/store/services/api";
import { addToast, useDisclosure } from "@heroui/react";
import ReusableModal from "../../../../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCartData,
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
  const isRescheduleFlow = Boolean(orderData?.rescheduleData?.isReschedule);
  const clientTimeZone =
    Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";
  const resolvedTimeZone =
    orderData?.rescheduleData?.timeZone ||
    orderData?.collectionData?.timeZone ||
    orderData?.timeZone ||
    clientTimeZone;
  const router = useRouter();
  const [rescheduleBooking, { isLoading: isRescheduling }] = useRescheduleBookingMutation();
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
  const {
    data: preferencesResponse,
    isLoading: isLoadingPreferences,
    isFetching: isFetchingPreferences,
    isError: isPreferencesQueryError,
  } = useGetServiceWithPreferenceDetailsQuery(currentServiceId, {
    skip: !currentServiceId,
  });

  const servicePreferencesData = preferencesResponse?.data?.preferencesData;

  // Initialize preferences state based on fetched data
  const [preferences, setPreferences] = useState({});

  const getPreferenceKey = (pref) =>
    pref?.preferenceType?.name?.toLowerCase() || `pref_${pref.preferenceTypeId}`;

  const isTemperaturePreference = (name = "") => name.includes("temp");
  const isDetergentPreference = (name = "") => name.includes("detergent");
  const isWashTypePreference = (name = "") =>
    (name.includes("wash") || name.includes("type")) &&
    !isTemperaturePreference(name) &&
    !isDetergentPreference(name);

  const getDefaultSettingsForWashType = (prefsData = []) => {
    const temperaturePref = prefsData.find((pref) =>
      isTemperaturePreference(getPreferenceKey(pref))
    );
    const detergentPref = prefsData.find((pref) =>
      isDetergentPreference(getPreferenceKey(pref))
    );

    const temperatureValue = temperaturePref?.preferenceType?.preferenceValues?.[0];
    const detergentValue = detergentPref?.preferenceType?.preferenceValues?.[0];

    return {
      temperature:
        temperaturePref && temperatureValue
          ? {
              preferenceTypeId: temperaturePref.preferenceTypeId,
              preferenceTypeName: temperaturePref.preferenceType?.name || "Temperature",
              preferenceValueId: temperatureValue.id,
              value: temperatureValue.value,
            }
          : null,
      detergent:
        detergentPref && detergentValue
          ? {
              preferenceTypeId: detergentPref.preferenceTypeId,
              preferenceTypeName: detergentPref.preferenceType?.name || "Detergent",
              preferenceValueId: detergentValue.id,
              value: detergentValue.value,
            }
          : null,
    };
  };

  // Initialize preferences when service preferences data is loaded
  useEffect(() => {
    if (Array.isArray(servicePreferencesData) && servicePreferencesData.length > 0) {
      const initialPrefs = {};
      const defaultWashSettings = getDefaultSettingsForWashType(servicePreferencesData);
      servicePreferencesData.forEach((pref) => {
        const prefName = getPreferenceKey(pref);
        const prefValues = pref.preferenceType?.preferenceValues || [];
        if (prefName && prefValues.length > 0) {
          if (isWashTypePreference(prefName)) {
            const firstWashType = prefValues[0];
            initialPrefs[prefName] = [
              {
                preferenceTypeId: pref.preferenceTypeId,
                preferenceTypeName: pref.preferenceType?.name || prefName,
                preferenceValueId: firstWashType.id,
                value: firstWashType.value,
              },
            ];
            initialPrefs.washTypeSettings = {
              [firstWashType.id]: defaultWashSettings,
            };
          } else {
            // Set first value as default
            initialPrefs[prefName] = {
              preferenceTypeId: pref.preferenceTypeId,
              preferenceTypeName: pref.preferenceType?.name || prefName,
              preferenceValueId: prefValues[0].id,
              value: prefValues[0].value,
            };
          }
        }
      });
      // Add additional instructions field
      initialPrefs.additionalInstructions = "";
      setPreferences(initialPrefs);
    } else if (servicePreferencesData) {
      setPreferences({});
    }
  }, [servicePreferencesData, currentServiceId]);

  // After preferences load: empty list → add service without modal; otherwise open modal
  useEffect(() => {
    if (!currentServiceId) return;
    if (isFetchingPreferences) return;

    if (isPreferencesQueryError) {
      addToast({
        title: "Could not load preferences. Please try again.",
        color: "danger",
      });
      setCurrentServiceId(null);
      return;
    }

    const res = preferencesResponse;
    if (res == null) return;

    if (String(res.status) !== "1") {
      addToast({
        title: res?.message || "Something went wrong.",
        color: "danger",
      });
      setCurrentServiceId(null);
      return;
    }

    const prefs = res?.data?.preferencesData;
    if (!Array.isArray(prefs)) return;

    if (prefs.length === 0) {
      const serviceName =
        data?.data?.serviceData?.find((s) => s.id === currentServiceId)?.name ||
        "";
      dispatch(
        updatePreference({
          serviceId: currentServiceId,
          data: {
            serviceName,
            preferencesArray: [],
            preferencesDisplay: [],
            additionalInstructions: "",
          },
        })
      );
      setCurrentServiceId(null);
      setPreferences({});
      return;
    }

    setModal((m) => ({ ...m, modType: "servicePreferences" }));
    if (!isOpen) {
      onOpen();
    }
  }, [
    currentServiceId,
    isFetchingPreferences,
    isPreferencesQueryError,
    preferencesResponse,
    data,
    dispatch,
    isOpen,
    onOpen,
  ]);

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  const handleRescheduleSubmit = async () => {
    const flattenedPreferences =
      preferencesData
        ?.filter(
          (item) => item?.preferencesArray && Array.isArray(item.preferencesArray)
        )
        ?.flatMap((item) => item.preferencesArray) || [];

    const fallbackServices =
      preferencesData
        ?.filter((item) => item?.serviceId)
        ?.map((item) => ({
          serviceId: Number(item.serviceId),
          categoryId: item?.categoryId ? Number(item.categoryId) : null,
          subCategoryId: item?.subCategoryId ? Number(item.subCategoryId) : null,
          categoryCharge: Number.parseFloat(item?.categoryprice) || 0,
        })) || [];

    const services = Array.isArray(orderData?.rescheduleData?.services)
      ? orderData.rescheduleData.services
      : fallbackServices;

    const payload = {
      bookingId: Number(orderData?.rescheduleData?.bookingId),
      collectionDate: orderData?.collectionData?.collectionDate,
      collectionTimeFrom: to24Hour(orderData?.collectionData?.collectionTimeFrom),
      collectionTimeTo: to24Hour(orderData?.collectionData?.collectionTimeTo),
      deliveryDate: orderData?.deliveryData?.deliveryDate,
      deliveryTimeFrom: to24Hour(orderData?.deliveryData?.deliveryTimeFrom),
      deliveryTimeTo: to24Hour(orderData?.deliveryData?.deliveryTimeTo),
      timeZone: resolvedTimeZone,
      clientTimeZone,
      reasonText: orderData?.rescheduleData?.reasonText?.trim() || "My plans changed",
      services,
      preferencesArray: flattenedPreferences,
    };

    try {
      const response = await rescheduleBooking(payload).unwrap();
      if (response?.status === "1") {
        dispatch(clearCartData());
        addToast({
          title: "Reschedule Booking",
          description: response?.message || "Booking rescheduled successfully.",
          color: "success",
        });
        router.replace("/");
      } else {
        addToast({
          title: "Reschedule Booking",
          description:
            response?.error || response?.message || "Failed to reschedule booking.",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Reschedule Booking",
        description:
          error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Failed to reschedule booking.",
        color: "danger",
      });
    }
  };

  const handleContinue = async () => {
    if (isRescheduleFlow) {
      await handleRescheduleSubmit();
      return;
    }
    dispatch(setPage(true));
    router.push("/checkout/payment");
  };

  function closePreferenceModal() {
    if (currentServiceId) {
      // Build preferences array with preferenceTypeId and preferenceValueId
      const preferencesArray = [];
      const preferencesDisplay = [];
      Object.keys(preferences).forEach((key) => {
        if (key === "additionalInstructions" || key === "washTypeSettings") {
          return;
        }

        const prefValue = preferences[key];
        if (Array.isArray(prefValue)) {
          prefValue.forEach((selectedItem) => {
            if (!selectedItem?.preferenceTypeId) return;
            preferencesArray.push({
              preferenceTypeId: selectedItem.preferenceTypeId,
              preferenceValueId: selectedItem.preferenceValueId,
              serviceId: currentServiceId,
            });
            preferencesDisplay.push({
              preferenceTypeName:
                selectedItem.preferenceTypeName || key,
              value: selectedItem.value || "",
            });

            const washTypeSetting =
              preferences?.washTypeSettings?.[selectedItem.preferenceValueId];

            ["temperature", "detergent"].forEach((settingKey) => {
              const settingValue = washTypeSetting?.[settingKey];
              if (!settingValue?.preferenceTypeId) return;
              preferencesArray.push({
                preferenceTypeId: settingValue.preferenceTypeId,
                preferenceValueId: settingValue.preferenceValueId,
                serviceId: currentServiceId,
              });
              preferencesDisplay.push({
                preferenceTypeName: `${selectedItem.value} ${settingValue.preferenceTypeName}`,
                value: settingValue.value || "",
              });
            });
          });
        } else if (prefValue?.preferenceTypeId) {
          preferencesArray.push({
            preferenceTypeId: prefValue.preferenceTypeId,
            preferenceValueId: prefValue.preferenceValueId,
            serviceId: currentServiceId,
          });
          preferencesDisplay.push({
            preferenceTypeName:
              prefValue.preferenceTypeName || key,
            value: prefValue.value || "",
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
                          isRescheduling ||
                          !preferencesData?.length ||
                          (!isRescheduleFlow &&
                            !orderData?.collectionData?.streetAddress)
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
                        isRescheduling ||
                        !preferencesData?.length ||
                        (!isRescheduleFlow &&
                          !orderData?.collectionData?.streetAddress)
                      }
                      text="Continue"
                      onClick={handleContinue}
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
                          isRescheduling ||
                          !preferencesData?.length ||
                          (!isRescheduleFlow &&
                            !orderData?.collectionData?.streetAddress)
                        }
                        text="Continue"
                        onClick={handleContinue}
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
                    const prefName = getPreferenceKey(pref);
                    const prefKey = prefName;
                    const currentPref = preferences[prefKey];
                    const values = pref.preferenceType?.preferenceValues || [];
                    const isTempPref = isTemperaturePreference(prefName);
                    const isDetergentPref = isDetergentPreference(prefName);
                    const isWashTypePref = isWashTypePreference(prefName);

                    if (isTempPref || isDetergentPref) {
                      return null;
                    }

                    return (
                      <div key={pref.id} className="space-y-3">
                        <p className="font-sf font-semibold text-base sm:text-lg text-theme-gray-3">
                          {pref.preferenceType?.name || "Preference"}
                        </p>
                        {isWashTypePref && !isTempPref && (
                          <p className="font-sf text-sm text-theme-psGray">
                            The user is responsible if the clothes color bleeds due to the
                            selected wash settings and temperature.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {values.map((value) => {
                            const isSelected = isWashTypePref
                              ? Array.isArray(currentPref) &&
                                currentPref.some(
                                  (selectedValue) =>
                                    selectedValue.preferenceValueId === value.id
                                )
                              : currentPref?.preferenceValueId === value.id;
                            return (
                              <button
                                type="button"
                                key={value.id}
                                onClick={() => {
                                  if (isWashTypePref) {
                                    setPreferences((prev) => {
                                      const selectedWashTypes = Array.isArray(prev[prefKey])
                                        ? prev[prefKey]
                                        : [];
                                      const alreadySelected = selectedWashTypes.some(
                                        (selectedItem) =>
                                          selectedItem.preferenceValueId === value.id
                                      );

                                      const nextSelectedWashTypes = alreadySelected
                                        ? selectedWashTypes.filter(
                                            (selectedItem) =>
                                              selectedItem.preferenceValueId !== value.id
                                          )
                                        : [
                                            ...selectedWashTypes,
                                            {
                                              preferenceTypeId: pref.preferenceTypeId,
                                              preferenceTypeName:
                                                pref.preferenceType?.name || prefKey,
                                              preferenceValueId: value.id,
                                              value: value.value,
                                            },
                                          ];

                                      const defaultSettings =
                                        getDefaultSettingsForWashType(
                                          servicePreferencesData
                                        );
                                      const existingSettings = prev.washTypeSettings || {};
                                      const nextSettings = { ...existingSettings };

                                      if (!alreadySelected && !nextSettings[value.id]) {
                                        nextSettings[value.id] = defaultSettings;
                                      }
                                      if (alreadySelected) {
                                        delete nextSettings[value.id];
                                      }

                                      return {
                                        ...prev,
                                        [prefKey]: nextSelectedWashTypes,
                                        washTypeSettings: nextSettings,
                                      };
                                    });
                                    return;
                                  }

                                  setPreferences((prev) => ({
                                    ...prev,
                                    [prefKey]: {
                                      preferenceTypeId: pref.preferenceTypeId,
                                      preferenceTypeName:
                                        pref.preferenceType?.name || prefKey,
                                      preferenceValueId: value.id,
                                      value: value.value,
                                    },
                                  }));
                                }}
                                className={`inline-flex max-w-full flex-col items-stretch rounded-2xl border-2 px-3.5 py-2 text-left font-sf text-xs font-medium leading-snug transition-all sm:text-sm ${
                                  isSelected
                                    ? "border-gray-800 bg-gray-100 text-gray-900 shadow-sm"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <span className="whitespace-normal">
                                  {value.value}
                                </span>
                                {(value.temperature || value.meta) && (
                                  <span className="mt-0.5 font-sf text-[10px] font-normal text-gray-500">
                                    {value.temperature || value.meta}
                                  </span>
                                )}
                                {(value.price != null || value.weight != null) && (
                                  <span className="mt-0.5 font-sf text-[10px] font-normal text-gray-500">
                                    {value.price != null && `£${value.price}`}
                                    {value.price != null && value.weight != null && " · "}
                                    {value.weight != null && `${value.weight}kg`}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {isWashTypePref &&
                          Array.isArray(currentPref) &&
                          currentPref.length > 0 && (
                            <div className="space-y-4 pt-2">
                              <p className="font-sf text-base uppercase tracking-wide text-theme-psGray">
                                Settings per wash type
                              </p>
                              {currentPref.map((selectedWashType) => {
                                const temperaturePref = servicePreferencesData.find((item) =>
                                  isTemperaturePreference(getPreferenceKey(item))
                                );
                                const detergentPref = servicePreferencesData.find((item) =>
                                  isDetergentPreference(getPreferenceKey(item))
                                );
                                const selectedSettings =
                                  preferences?.washTypeSettings?.[
                                    selectedWashType.preferenceValueId
                                  ] || {};

                                return (
                                  <div
                                    key={selectedWashType.preferenceValueId}
                                    className="rounded-2xl border border-theme-gray-2 p-4"
                                  >
                                    <p className="font-sf font-semibold text-xl pb-3">
                                      {selectedWashType.value}
                                    </p>

                                    {temperaturePref && (
                                      <div className="pb-3">
                                        <p className="font-sf text-theme-psGray pb-2">
                                          Temperature
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {(temperaturePref.preferenceType?.preferenceValues || []).map(
                                            (tempValue) => {
                                              const isTempSelected =
                                                selectedSettings?.temperature
                                                  ?.preferenceValueId === tempValue.id;
                                              return (
                                                <button
                                                  key={tempValue.id}
                                                  type="button"
                                                  className={`rounded-xl border px-4 py-2 font-sf text-base ${
                                                    isTempSelected
                                                      ? "border-theme-blue bg-theme-blue text-white"
                                                      : "border-theme-gray-2 bg-white text-theme-gray-3"
                                                  }`}
                                                  onClick={() =>
                                                    setPreferences((prev) => {
                                                      const existing =
                                                        prev.washTypeSettings || {};
                                                      const selectedWashSettings =
                                                        existing[
                                                          selectedWashType.preferenceValueId
                                                        ] || {};
                                                      return {
                                                        ...prev,
                                                        washTypeSettings: {
                                                          ...existing,
                                                          [selectedWashType.preferenceValueId]:
                                                            {
                                                              ...selectedWashSettings,
                                                              temperature: {
                                                                preferenceTypeId:
                                                                  temperaturePref.preferenceTypeId,
                                                                preferenceTypeName:
                                                                  temperaturePref.preferenceType
                                                                    ?.name || "Temperature",
                                                                preferenceValueId: tempValue.id,
                                                                value: tempValue.value,
                                                              },
                                                            },
                                                        },
                                                      };
                                                    })
                                                  }
                                                >
                                                  {tempValue.value}
                                                </button>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {detergentPref && (
                                      <div>
                                        <p className="font-sf text-theme-psGray pb-2">
                                          Detergent
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {(detergentPref.preferenceType?.preferenceValues || []).map(
                                            (detergentValue) => {
                                              const isDetergentSelected =
                                                selectedSettings?.detergent
                                                  ?.preferenceValueId ===
                                                detergentValue.id;
                                              return (
                                                <button
                                                  key={detergentValue.id}
                                                  type="button"
                                                  className={`rounded-full border px-6 py-2 font-sf text-base ${
                                                    isDetergentSelected
                                                      ? "border-theme-blue bg-theme-blue text-white"
                                                      : "border-theme-gray-2 bg-white text-theme-gray-3"
                                                  }`}
                                                  onClick={() =>
                                                    setPreferences((prev) => {
                                                      const existing =
                                                        prev.washTypeSettings || {};
                                                      const selectedWashSettings =
                                                        existing[
                                                          selectedWashType.preferenceValueId
                                                        ] || {};
                                                      return {
                                                        ...prev,
                                                        washTypeSettings: {
                                                          ...existing,
                                                          [selectedWashType.preferenceValueId]:
                                                            {
                                                              ...selectedWashSettings,
                                                              detergent: {
                                                                preferenceTypeId:
                                                                  detergentPref.preferenceTypeId,
                                                                preferenceTypeName:
                                                                  detergentPref.preferenceType
                                                                    ?.name || "Detergent",
                                                                preferenceValueId:
                                                                  detergentValue.id,
                                                                value: detergentValue.value,
                                                              },
                                                            },
                                                        },
                                                      };
                                                    })
                                                  }
                                                >
                                                  {detergentValue.value}
                                                </button>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
