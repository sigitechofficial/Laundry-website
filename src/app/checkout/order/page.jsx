"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdKeyboardArrowDown, MdKeyboardArrowUp, MdOutlineDryCleaning } from "react-icons/md";
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
  const modalScrollRef = useRef(null);
  const openModalTimeoutRef = useRef(null);
  const [isModalAtBottom, setIsModalAtBottom] = useState(false);
  const [hasModalOverflow, setHasModalOverflow] = useState(false);

  // Initialize preferences state based on fetched data
  const [preferences, setPreferences] = useState({});
  /** `preferenceValueId` (string) -> whether per–wash-type instruction textarea is shown */
  const [washInstructionPanelOpen, setWashInstructionPanelOpen] = useState({});

  const handleCancelModal = useCallback(() => {
    if (openModalTimeoutRef.current) {
      clearTimeout(openModalTimeoutRef.current);
      openModalTimeoutRef.current = null;
    }
    setCurrentServiceId(null);
    setPreferences({});
    setWashInstructionPanelOpen({});
    setModal((prev) => ({ ...prev, modType: "" }));
    onClose();
  }, [onClose]);

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

  const isDryCleanService = useMemo(() => {
    const name = (
      data?.data?.serviceData?.find((s) => s?.id === currentServiceId)?.name || ""
    )
      .toLowerCase()
      .replace(/\s+/g, " ");
    return (
      name.includes("dry clean") ||
      name.includes("dryclean") ||
      name.includes("dry-clean")
    );
  }, [data, currentServiceId]);

  const getPreferenceId = (pref) => pref?.preferenceTypeId ?? pref?.id;
  const getPreferenceLabel = (pref) =>
    pref?.preferenceType?.name || pref?.name || "Preference";
  const getPreferenceValues = (pref) =>
    pref?.preferenceType?.preferenceValues || pref?.preferenceValues || [];
  const getPreferenceChildren = (pref) =>
    Array.isArray(pref?.childTypes) ? pref.childTypes : [];
  const getPreferenceKey = (pref) =>
    getPreferenceLabel(pref).toLowerCase() || `pref_${getPreferenceId(pref)}`;

  const getPreferenceInstruction = (pref) => {
    const pt = pref?.preferenceType;
    const pick = (v) => (typeof v === "string" ? v.trim() : "");
    return (
      pick(pref?.instruction) ||
      pick(pref?.description) ||
      pick(pt?.instruction) ||
      pick(pt?.description) ||
      pick(pref?.preferenceInstruction) ||
      pick(pt?.preferenceInstruction) ||
      ""
    );
  };

  const isTemperaturePreference = (name = "") => name.includes("temp");
  const isDetergentPreference = (name = "") => name.includes("detergent");
  const isWashTypePreference = (name = "") =>
    (name.includes("wash") || name.includes("type")) &&
    !isTemperaturePreference(name) &&
    !isDetergentPreference(name);

  const getSettingPreference = (prefsData = [], matcher) => {
    const topLevelMatch = prefsData.find((pref) =>
      matcher(getPreferenceKey(pref))
    );
    if (topLevelMatch) return topLevelMatch;

    const washTypePref = prefsData.find((pref) =>
      isWashTypePreference(getPreferenceKey(pref))
    );
    if (!washTypePref) return null;

    const childMatch = getPreferenceChildren(washTypePref).find((childPref) =>
      matcher(getPreferenceKey(childPref))
    );
    return childMatch || null;
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const getInstructionPanelState = (prefsObj = {}) => {
    const next = {};
    const settings = prefsObj?.washTypeSettings || {};
    Object.keys(settings).forEach((washId) => {
      const hasText = Boolean(settings[washId]?.preferenceInstruction?.trim());
      if (hasText) next[String(washId)] = true;
    });
    return next;
  };

  const buildDefaultWashTypeSettings = () => ({
    preferenceInstruction: "",
  });

  /** Garment finish options (e.g. Shirt Hang, Shirt Folded) allow multiple picks */
  const isMultiSelectPreferenceGroup = (pref) => {
    const prefName = getPreferenceKey(pref);
    if (
      isWashTypePreference(prefName) ||
      isTemperaturePreference(prefName) ||
      isDetergentPreference(prefName)
    ) {
      return false;
    }
    const label = (getPreferenceLabel(pref) || "").toLowerCase();
    const values = getPreferenceValues(pref);
    const optionsLookLikeHangFold = values.some((v) => {
      const t = String(v?.value ?? "").toLowerCase();
      return t.includes("hang") || t.includes("fold");
    });
    return (
      optionsLookLikeHangFold ||
      label.includes("hang") ||
      label.includes("fold")
    );
  };

  const normalizeMultiPreferenceState = (prefsObj, prefsData) => {
    if (!prefsObj || typeof prefsObj !== "object" || !Array.isArray(prefsData)) {
      return prefsObj;
    }
    const out = deepClone(prefsObj);
    prefsData.forEach((pref) => {
      if (!isMultiSelectPreferenceGroup(pref)) return;
      const key = getPreferenceKey(pref);
      const v = out[key];
      if (v && !Array.isArray(v) && v.preferenceTypeId) {
        out[key] = [v];
      }
    });
    return out;
  };

  // Initialize preferences when service preferences data is loaded
  useEffect(() => {
    if (Array.isArray(servicePreferencesData) && servicePreferencesData.length > 0) {
      const existingServicePref = Array.isArray(preferencesData)
        ? preferencesData.find((item) => item?.serviceId === currentServiceId)
        : null;
      const savedPrefs = existingServicePref?.selectedPreferences;
      if (savedPrefs && typeof savedPrefs === "object") {
        const restoredPrefs = normalizeMultiPreferenceState(
          savedPrefs,
          servicePreferencesData
        );
        setPreferences(restoredPrefs);
        setWashInstructionPanelOpen(getInstructionPanelState(restoredPrefs));
        return;
      }
      const initialPrefs = {};
      servicePreferencesData.forEach((pref) => {
        const prefName = getPreferenceKey(pref);
        const prefValues = getPreferenceValues(pref);
        if (prefName && prefValues.length > 0) {
          if (isWashTypePreference(prefName)) {
            initialPrefs[prefName] = [];
            initialPrefs.washTypeSettings = {};
          } else if (isMultiSelectPreferenceGroup(pref)) {
            initialPrefs[prefName] = [];
          }
          // Other single-select preferences: no default until user chooses
        }
      });
      // Add additional instructions field
      initialPrefs.additionalInstructions = "";
      setPreferences(initialPrefs);
      setWashInstructionPanelOpen({});
    } else if (servicePreferencesData) {
      setPreferences({});
      setWashInstructionPanelOpen({});
    }
  }, [servicePreferencesData, currentServiceId, preferencesData]);

  // After preferences load: empty list → add service without modal; otherwise open modal
  useEffect(() => {
    if (!currentServiceId) return;
    if (isFetchingPreferences) return;

    if (isPreferencesQueryError) {
      addToast({
        title: "Could not load preferences. Please try again.",
        color: "danger",
      });
      handleCancelModal();
      return;
    }

    const res = preferencesResponse;
    if (res == null) return;

    if (String(res.status) !== "1") {
      addToast({
        title: res?.message || "Something went wrong.",
        color: "danger",
      });
      handleCancelModal();
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
      handleCancelModal();
      return;
    }
  }, [
    currentServiceId,
    isFetchingPreferences,
    isPreferencesQueryError,
    preferencesResponse,
    data,
    dispatch,
    handleCancelModal,
  ]);

  useEffect(() => {
    return () => {
      if (openModalTimeoutRef.current) {
        clearTimeout(openModalTimeoutRef.current);
        openModalTimeoutRef.current = null;
      }
    };
  }, []);

  function handleModalScroll(e) {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    const isScrolled = scrollTop > 50;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 8;
    const hasOverflow = scrollHeight > clientHeight + 8;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
    setIsModalAtBottom((prev) => {
      if (prev !== isAtBottom) return isAtBottom;
      return prev;
    });
    setHasModalOverflow((prev) => {
      if (prev !== hasOverflow) return hasOverflow;
      return prev;
    });
  }

  useEffect(() => {
    if (!isOpen || modal?.modType !== "servicePreferences") return;
    const modalEl = modalScrollRef.current;
    if (!modalEl) return;

    const { scrollTop, clientHeight, scrollHeight } = modalEl;
    setIsModalAtBottom(scrollTop + clientHeight >= scrollHeight - 8);
    setHasModalOverflow(scrollHeight > clientHeight + 8);
  }, [isOpen, modal?.modType, isLoadingPreferences, preferences]);

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
    if (!currentServiceId) {
      setModal({ ...modal, modType: "" });
      onClose();
      return;
    }

    const washTypeParent = (servicePreferencesData || []).find((p) =>
      isWashTypePreference(getPreferenceKey(p))
    );
    const washPrefKey = washTypeParent ? getPreferenceKey(washTypeParent) : null;
    const washOptionsCount = washTypeParent
      ? getPreferenceValues(washTypeParent).length
      : 0;
    const selectedWashTypes = washPrefKey
      ? Array.isArray(preferences[washPrefKey])
        ? preferences[washPrefKey]
        : []
      : [];

    if (washPrefKey && washOptionsCount > 0 && selectedWashTypes.length === 0) {
      addToast({
        title: "Wash type required",
        description: "Please select at least one wash type.",
        color: "warning",
      });
      return;
    }

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
            const washTypeSetting =
              preferences?.washTypeSettings?.[selectedItem.preferenceValueId];
            const washPrefInstruction =
              washTypeSetting?.preferenceInstruction?.trim() || "";
            preferencesArray.push({
              preferenceTypeId: selectedItem.preferenceTypeId,
              preferenceValueId: selectedItem.preferenceValueId,
              serviceId: currentServiceId,
              preferenceInstruction: washPrefInstruction,
            });
            preferencesDisplay.push({
              preferenceTypeName:
                selectedItem.preferenceTypeName || key,
              value: selectedItem.value || "",
            });

            ["temperature", "detergent"].forEach((settingKey) => {
              const settingValue = washTypeSetting?.[settingKey];
              if (!settingValue?.preferenceTypeId) return;
              preferencesArray.push({
                preferenceTypeId: settingValue.preferenceTypeId,
                preferenceValueId: settingValue.preferenceValueId,
                serviceId: currentServiceId,
                preferenceInstruction: washPrefInstruction,
              });
              preferencesDisplay.push({
                preferenceTypeName: `${selectedItem.value} - ${settingValue.preferenceTypeName}`,
                value: settingValue.value || "",
              });
            });

            const prefInstr = washTypeSetting?.preferenceInstruction?.trim();
            if (prefInstr) {
              preferencesDisplay.push({
                preferenceTypeName: `${selectedItem.value} — instructions`,
                value: prefInstr,
              });
            }
          });
        } else if (prefValue?.preferenceTypeId) {
          preferencesArray.push({
            preferenceTypeId: prefValue.preferenceTypeId,
            preferenceValueId: prefValue.preferenceValueId,
            serviceId: currentServiceId,
            preferenceInstruction: "",
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
      selectedPreferences: deepClone(preferences),
    };

    // Dispatch to redux
    dispatch(updatePreference({ serviceId: currentServiceId, data: prefsData }));

    // Reset state
    setPreferences({});
    setWashInstructionPanelOpen({});
    setCurrentServiceId(null);
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
                            setModal((m) => ({ ...m, modType: "servicePreferences" }));
                            if (openModalTimeoutRef.current) {
                              clearTimeout(openModalTimeoutRef.current);
                            }
                            openModalTimeoutRef.current = setTimeout(() => {
                              onOpen();
                              openModalTimeoutRef.current = null;
                            }, 250);
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
                              item.preferencesDisplay.length > 0 && (
                                <div className="mt-1.5 space-y-1">
                                  {item.preferencesDisplay.map((pref, prefIdx) => (
                                    <div
                                      key={`${idx}-${prefIdx}`}
                                      className="rounded-md border border-theme-gray/70 px-2 py-1.5"
                                    >
                                      <p className="text-theme-psGray font-sf text-[11px] leading-tight">
                                        {pref?.preferenceTypeName || "Preference"}
                                      </p>
                                      <p className="text-xs font-semibold leading-tight">
                                        {pref?.value || "-"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {item?.additionalInstructions && (
                              <div className="mt-1.5 rounded-md border border-theme-gray/70 px-2 py-1.5">
                                <p className="text-theme-psGray font-sf text-[11px] leading-tight">
                                  Instructions
                                </p>
                                <p className="text-xs font-semibold leading-tight">
                                  {item?.additionalInstructions}
                                </p>
                              </div>
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
            setWashInstructionPanelOpen({});
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
        className="custom-modal-class max-h-[90vh] overflow-hidden"
      >
        {modal?.modType === "servicePreferences" && currentServiceId ? (
          <div className="modal-scroll relative flex min-h-0 max-h-[calc(90vh-6.5rem)] flex-col overflow-hidden">
            <div className="h-[58px] shrink-0 flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Service Preferences
              </h4>

              <p
                onClick={handleCancelModal}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            {isLoadingPreferences || isFetchingPreferences ? (
              <div className="w-full px-6 py-6 font-sf flex justify-center items-center min-h-[200px]">
                <MiniLoader />
              </div>
            ) : servicePreferencesData && servicePreferencesData.length > 0 ? (
              <>
                <div
                  ref={modalScrollRef}
                  onScroll={handleModalScroll}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                >
                  <div className="w-full px-6 py-6 font-sf">
                <div className="space-y-6">
                  {servicePreferencesData.map((pref) => {
                    const prefName = getPreferenceKey(pref);
                    const prefKey = prefName;
                    const currentPref = preferences[prefKey];
                    const values = getPreferenceValues(pref);
                    const isTempPref = isTemperaturePreference(prefName);
                    const isDetergentPref = isDetergentPreference(prefName);
                    const isWashTypePref = isWashTypePreference(prefName);
                    const isMultiPref = isMultiSelectPreferenceGroup(pref);

                    if (isTempPref || isDetergentPref) {
                      return null;
                    }

                    return (
                      <div key={pref.id} className="space-y-3">
                        <p className="font-sf font-semibold text-base sm:text-lg text-theme-gray-3">
                          {getPreferenceLabel(pref)}
                        </p>
                        {getPreferenceInstruction(pref) &&
                        !(isWashTypePref && isDryCleanService) ? (
                          <p className="font-sf text-sm text-theme-psGray leading-relaxed">
                            {getPreferenceInstruction(pref)}
                          </p>
                        ) : null}
                        {isWashTypePref && !isTempPref && !isDryCleanService && (
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
                              : isMultiPref
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
                                              preferenceTypeId: getPreferenceId(pref),
                                              preferenceTypeName:
                                                getPreferenceLabel(pref) || prefKey,
                                              preferenceValueId: value.id,
                                              value: value.value,
                                            },
                                          ];

                                      if (isDryCleanService) {
                                        return {
                                          ...prev,
                                          [prefKey]: nextSelectedWashTypes,
                                        };
                                      }

                                      const existingSettings = prev.washTypeSettings || {};
                                      const nextSettings = { ...existingSettings };

                                      if (!alreadySelected) {
                                        nextSettings[value.id] = buildDefaultWashTypeSettings(
                                          servicePreferencesData || []
                                        );
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

                                  if (isMultiPref) {
                                    setPreferences((prev) => {
                                      const raw = prev[prefKey];
                                      const selected = Array.isArray(raw)
                                        ? raw
                                        : raw?.preferenceTypeId
                                          ? [raw]
                                          : [];
                                      const alreadySelected = selected.some(
                                        (item) => item.preferenceValueId === value.id
                                      );
                                      const nextSelected = alreadySelected
                                        ? selected.filter(
                                            (item) => item.preferenceValueId !== value.id
                                          )
                                        : [
                                            ...selected,
                                            {
                                              preferenceTypeId: getPreferenceId(pref),
                                              preferenceTypeName:
                                                getPreferenceLabel(pref) || prefKey,
                                              preferenceValueId: value.id,
                                              value: value.value,
                                            },
                                          ];
                                      return { ...prev, [prefKey]: nextSelected };
                                    });
                                    return;
                                  }

                                  setPreferences((prev) => ({
                                    ...prev,
                                    [prefKey]: {
                                      preferenceTypeId: getPreferenceId(pref),
                                      preferenceTypeName:
                                        getPreferenceLabel(pref) || prefKey,
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
                          !isDryCleanService &&
                          Array.isArray(currentPref) &&
                          currentPref.length > 0 && (
                            <div className="space-y-4 pt-2">
                              <p className="font-sf text-base uppercase tracking-wide text-theme-psGray">
                                Settings per wash type
                              </p>
                              {currentPref.map((selectedWashType) => {
                                const temperaturePref = getSettingPreference(
                                  servicePreferencesData,
                                  isTemperaturePreference
                                );
                                const detergentPref = getSettingPreference(
                                  servicePreferencesData,
                                  isDetergentPreference
                                );
                                const selectedSettings =
                                  preferences?.washTypeSettings?.[
                                    selectedWashType.preferenceValueId
                                  ] || {};
                                const washInstrKey = String(
                                  selectedWashType.preferenceValueId
                                );
                                const washInstrOpen =
                                  washInstructionPanelOpen[washInstrKey];
                                const washHasInstr = Boolean(
                                  (selectedSettings.preferenceInstruction ?? "").trim()
                                );

                                return (
                                  <div
                                    key={selectedWashType.preferenceValueId}
                                    className="rounded-2xl border border-theme-gray-2 p-3"
                                  >
                                    <p className="font-sf font-semibold text-lg pb-2">
                                      {selectedWashType.value}
                                    </p>

                                    {temperaturePref && (
                                      <div className="pb-2">
                                        <p className="font-sf text-sm text-theme-psGray pb-1.5">
                                          {getPreferenceLabel(temperaturePref) || "Temperature"}
                                        </p>
                                        {getPreferenceInstruction(temperaturePref) ? (
                                          <p className="font-sf text-xs text-theme-psGray/90 pb-2 leading-relaxed">
                                            {getPreferenceInstruction(temperaturePref)}
                                          </p>
                                        ) : null}
                                        <div className="flex flex-wrap gap-2">
                                          {getPreferenceValues(temperaturePref).map(
                                            (tempValue) => {
                                              const isTempSelected =
                                                selectedSettings?.temperature
                                                  ?.preferenceValueId === tempValue.id;
                                              return (
                                                <button
                                                  key={tempValue.id}
                                                  type="button"
                                                  className={`rounded-full border px-2.5 py-1 font-sf text-xs ${
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
                                                      const isAlreadySelected =
                                                        selectedWashSettings?.temperature
                                                          ?.preferenceValueId ===
                                                        tempValue.id;
                                                      const nextSettings = {
                                                        ...selectedWashSettings,
                                                      };
                                                      if (isAlreadySelected) {
                                                        delete nextSettings.temperature;
                                                      } else {
                                                        nextSettings.temperature = {
                                                          preferenceTypeId: getPreferenceId(
                                                            temperaturePref
                                                          ),
                                                          preferenceTypeName:
                                                            getPreferenceLabel(
                                                              temperaturePref
                                                            ) || "Temperature",
                                                          preferenceValueId: tempValue.id,
                                                          value: tempValue.value,
                                                        };
                                                      }
                                                      return {
                                                        ...prev,
                                                        washTypeSettings: {
                                                          ...existing,
                                                          [selectedWashType.preferenceValueId]:
                                                            nextSettings,
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
                                        <p className="font-sf text-sm text-theme-psGray pb-1.5">
                                          {getPreferenceLabel(detergentPref) || "Detergent"}
                                        </p>
                                        {getPreferenceInstruction(detergentPref) ? (
                                          <p className="font-sf text-xs text-theme-psGray/90 pb-2 leading-relaxed">
                                            {getPreferenceInstruction(detergentPref)}
                                          </p>
                                        ) : null}
                                        <div className="flex flex-wrap gap-2">
                                          {getPreferenceValues(detergentPref).map(
                                            (detergentValue) => {
                                              const isDetergentSelected =
                                                selectedSettings?.detergent
                                                  ?.preferenceValueId ===
                                                detergentValue.id;
                                              return (
                                                <button
                                                  key={detergentValue.id}
                                                  type="button"
                                                  className={`rounded-full border px-4 py-1.5 font-sf text-sm ${
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
                                                      const isAlreadySelected =
                                                        selectedWashSettings?.detergent
                                                          ?.preferenceValueId ===
                                                        detergentValue.id;
                                                      const nextSettings = {
                                                        ...selectedWashSettings,
                                                      };
                                                      if (isAlreadySelected) {
                                                        delete nextSettings.detergent;
                                                      } else {
                                                        nextSettings.detergent = {
                                                          preferenceTypeId: getPreferenceId(
                                                            detergentPref
                                                          ),
                                                          preferenceTypeName:
                                                            getPreferenceLabel(
                                                              detergentPref
                                                            ) || "Detergent",
                                                          preferenceValueId:
                                                            detergentValue.id,
                                                          value: detergentValue.value,
                                                        };
                                                      }
                                                      return {
                                                        ...prev,
                                                        washTypeSettings: {
                                                          ...existing,
                                                          [selectedWashType.preferenceValueId]:
                                                            nextSettings,
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

                                    {(temperaturePref || detergentPref) && (
                                      <div className="mt-3 border-t border-theme-gray-2/40 pt-3">
                                        {!washInstrOpen ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setWashInstructionPanelOpen((prev) => ({
                                                ...prev,
                                                [washInstrKey]: true,
                                              }))
                                            }
                                            className="rounded-full border border-theme-gray-2 bg-white px-2.5 py-1 font-sf text-xs font-medium text-theme-gray-3 transition hover:bg-theme-gray"
                                          >
                                            {washHasInstr
                                              ? "Edit instruction"
                                              : "Add instruction"}
                                          </button>
                                        ) : (
                                          <>
                                            <div className="mb-1.5 flex items-start justify-between gap-2">
                                              <label className="block font-sf text-xs font-medium text-theme-gray-3">
                                                Instructions for this wash type
                                                <span className="font-normal text-theme-psGray">
                                                  {" "}
                                                  (optional)
                                                </span>
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setWashInstructionPanelOpen((prev) => ({
                                                    ...prev,
                                                    [washInstrKey]: false,
                                                  }))
                                                }
                                                className="shrink-0 font-sf text-xs text-theme-psGray underline-offset-2 hover:text-theme-gray-3 hover:underline"
                                              >
                                                Hide
                                              </button>
                                            </div>
                                            <textarea
                                              className="mt-1.5 w-full h-24 resize-none rounded-lg bg-theme-gray p-3 font-sf text-sm text-theme-gray-2 outline-none"
                                              placeholder="Add any notes for temperature, detergent, or other preferences for this wash…"
                                              value={
                                                selectedSettings.preferenceInstruction ?? ""
                                              }
                                              onChange={(e) =>
                                                setPreferences((prev) => {
                                                  const existing =
                                                    prev.washTypeSettings || {};
                                                  const row =
                                                    existing[
                                                      selectedWashType.preferenceValueId
                                                    ] || {};
                                                  return {
                                                    ...prev,
                                                    washTypeSettings: {
                                                      ...existing,
                                                      [selectedWashType.preferenceValueId]: {
                                                        ...row,
                                                        preferenceInstruction:
                                                          e.target.value,
                                                      },
                                                    },
                                                  };
                                                })
                                              }
                                            />
                                          </>
                                        )}
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
                </div>
                {(() => {
                  const washParent = servicePreferencesData.find((p) =>
                    isWashTypePreference(getPreferenceKey(p))
                  );
                  const washKey = washParent ? getPreferenceKey(washParent) : null;
                  const washSelected = washKey
                    ? Array.isArray(preferences[washKey])
                      ? preferences[washKey]
                      : []
                    : [];
                  if (washSelected.length < 2 || !hasModalOverflow) return null;
                  return (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[58px] z-20">
                      <div className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-5 sm:right-5">
                        <button
                          type="button"
                          onClick={() =>
                            modalScrollRef.current?.scrollTo({
                              top: isModalAtBottom
                                ? 0
                                : modalScrollRef.current.scrollHeight,
                              behavior: "smooth",
                            })
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-theme-blue text-white shadow-md transition hover:opacity-90"
                          aria-label={
                            isModalAtBottom ? "Scroll to top" : "Scroll to bottom"
                          }
                        >
                          {isModalAtBottom ? (
                            <MdKeyboardArrowUp size={20} />
                          ) : (
                            <MdKeyboardArrowDown size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
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
                onClick={handleCancelModal}
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
