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
  setDeliveryData,
  setDriverInstruction,
  setDriverTip,
  setPage,
  updatePreference,
} from "@/app/store/slices/cartItemSlice";
import { generateCollectionSlots } from "../../../../utilities/generateSlots";
import {
  buildDeliveryUpdateForMinDate,
  formatIsoDateLong,
  getTurnaroundConflict,
  parseTimeRequiredDays,
} from "../../../../utilities/turnaroundTime";
import { FaTruck, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { formatDate, to24Hour } from "../../../../utilities/ConversionFunction";
import FAQs from "../../../../components/FAQs";
import Footer from "../../../../components/Footer";
import { useRouter } from "next/navigation";
import HomeClientWrapper from "../../../../utilities/Test";
import InputField from "../../../../components/InputHeroUi";
import { MiniLoader } from "../../../../components/Loader";
import { BASE_URL } from "../../../../utilities/URL";

const parseServiceBooleanFlag = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

const resolveQuantityCountMode = (prefs, showBags, showItems) => {
  if (!showBags && !showItems) return null;
  if (showBags && !showItems) return "bags";
  if (!showBags && showItems) return "items";
  if (prefs?.quantityCountMode === "items") return "items";
  if (prefs?.quantityCountMode === "bags") return "bags";
  if (prefs?.itemsCount) return "items";
  if (prefs?.bagsCount) return "bags";
  return "bags";
};

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
  const [turnaroundModal, setTurnaroundModal] = useState({
    open: false,
    minDeliveryDate: "",
    maxDays: 0,
    serviceLabels: [],
  });
  const [pendingContinueAfterTurnaround, setPendingContinueAfterTurnaround] =
    useState(false);

  const slotsDeliveryForTurnaround = useMemo(
    () =>
      generateCollectionSlots({
        daysCount: 21,
        slotDurationInHours: 1,
        lastHour: 19,
        startAfterHours: 24,
        includeWeekends: true,
      }),
    []
  );

  const cartServiceIds = useMemo(() => {
    const ids = new Set();
    if (isRescheduleFlow) {
      const fromReschedule = orderData?.rescheduleData?.services;
      if (Array.isArray(fromReschedule)) {
        fromReschedule.forEach((s) => {
          if (s?.serviceId) ids.add(Number(s.serviceId));
        });
      }
    }
    (preferencesData || []).forEach((item) => {
      if (item?.serviceId) ids.add(Number(item.serviceId));
    });
    return [...ids];
  }, [preferencesData, isRescheduleFlow, orderData?.rescheduleData?.services]);

  const serviceList = data?.data?.serviceData ?? [];

  const currentServiceMeta = useMemo(
    () => serviceList.find((s) => s?.id === currentServiceId) ?? null,
    [serviceList, currentServiceId]
  );

  const showBagsInput = parseServiceBooleanFlag(currentServiceMeta?.numberOfBags);
  const showItemsInput = parseServiceBooleanFlag(currentServiceMeta?.numberOfItems);

  const turnaroundCheck = useMemo(
    () =>
      getTurnaroundConflict({
        serviceList,
        serviceIds: cartServiceIds,
        collectionDate: orderData?.collectionData?.collectionDate,
        deliveryDate: orderData?.deliveryData?.deliveryDate,
      }),
    [
      serviceList,
      cartServiceIds,
      orderData?.collectionData?.collectionDate,
      orderData?.deliveryData?.deliveryDate,
    ]
  );
  const modalScrollRef = useRef(null);
  const openModalTimeoutRef = useRef(null);
  const [isModalAtBottom, setIsModalAtBottom] = useState(false);
  const [hasModalOverflow, setHasModalOverflow] = useState(false);

  // Initialize preferences state based on fetched data
  const [preferences, setPreferences] = useState({});
  /** `preferenceValueId` (string) -> whether per–wash-type instruction textarea is shown */
  const [washInstructionPanelOpen, setWashInstructionPanelOpen] = useState({});
  /** Wash accordion: `null` = expand first selected row; `"__none__"` = all bodies collapsed; else open that value id */
  const [washAccordionOpenId, setWashAccordionOpenId] = useState(null);

  const handleCancelModal = useCallback(() => {
    if (openModalTimeoutRef.current) {
      clearTimeout(openModalTimeoutRef.current);
      openModalTimeoutRef.current = null;
    }
    setCurrentServiceId(null);
    setPreferences({});
    setWashInstructionPanelOpen({});
    setWashAccordionOpenId(null);
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

  const WASH_ACCORDION_ALL_COLLAPSED = "__none__";

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
        if (showBagsInput) {
          restoredPrefs.bagsCount =
            savedPrefs.bagsCount != null
              ? String(savedPrefs.bagsCount)
              : existingServicePref?.bagsCount != null
                ? String(existingServicePref.bagsCount)
                : "";
        }
        if (showItemsInput) {
          restoredPrefs.itemsCount =
            savedPrefs.itemsCount != null
              ? String(savedPrefs.itemsCount)
              : existingServicePref?.itemsCount != null
                ? String(existingServicePref.itemsCount)
                : "";
        }
        restoredPrefs.quantityCountMode = resolveQuantityCountMode(
          {
            ...restoredPrefs,
            quantityCountMode: savedPrefs.quantityCountMode,
          },
          showBagsInput,
          showItemsInput
        );
        setPreferences(restoredPrefs);
        setWashInstructionPanelOpen(getInstructionPanelState(restoredPrefs));
        setWashAccordionOpenId(null);
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
      if (showBagsInput) {
        initialPrefs.bagsCount =
          existingServicePref?.bagsCount != null
            ? String(existingServicePref.bagsCount)
            : "";
      }
      if (showItemsInput) {
        initialPrefs.itemsCount =
          existingServicePref?.itemsCount != null
            ? String(existingServicePref.itemsCount)
            : "";
      }
      initialPrefs.quantityCountMode = resolveQuantityCountMode(
        initialPrefs,
        showBagsInput,
        showItemsInput
      );
      setPreferences(initialPrefs);
      setWashInstructionPanelOpen({});
      setWashAccordionOpenId(null);
    } else if (servicePreferencesData) {
      setPreferences({});
      setWashInstructionPanelOpen({});
      setWashAccordionOpenId(null);
    }
  }, [
    servicePreferencesData,
    currentServiceId,
    preferencesData,
    showBagsInput,
    showItemsInput,
  ]);

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
      const svc = data?.data?.serviceData?.find((s) => s.id === currentServiceId);
      const needsQuantityModal =
        parseServiceBooleanFlag(svc?.numberOfBags) ||
        parseServiceBooleanFlag(svc?.numberOfItems);

      if (needsQuantityModal) {
        const existingServicePref = Array.isArray(preferencesData)
          ? preferencesData.find((item) => item?.serviceId === currentServiceId)
          : null;
        setPreferences({
          additionalInstructions: existingServicePref?.additionalInstructions || "",
          bagsCount:
            existingServicePref?.bagsCount != null
              ? String(existingServicePref.bagsCount)
              : "",
          itemsCount:
            existingServicePref?.itemsCount != null
              ? String(existingServicePref.itemsCount)
              : "",
        });
        return;
      }

      const serviceName = svc?.name || "";
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

  const handleRescheduleSubmit = async (deliveryOverride) => {
    const delivery = {
      ...orderData?.deliveryData,
      ...(deliveryOverride || {}),
    };
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
      deliveryDate: delivery?.deliveryDate,
      deliveryTimeFrom: to24Hour(delivery?.deliveryTimeFrom),
      deliveryTimeTo: to24Hour(delivery?.deliveryTimeTo),
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

  const proceedToPayment = () => {
    dispatch(setPage(true));
    router.push("/checkout/payment");
  };

  const handleContinue = async () => {
    if (isRescheduleFlow) {
      if (turnaroundCheck.conflict) {
        setTurnaroundModal({
          open: true,
          minDeliveryDate: turnaroundCheck.minDeliveryDate,
          maxDays: turnaroundCheck.maxDays,
          serviceLabels: turnaroundCheck.serviceLabels,
        });
        setPendingContinueAfterTurnaround(true);
        return;
      }
      await handleRescheduleSubmit();
      return;
    }

    if (turnaroundCheck.conflict) {
      setTurnaroundModal({
        open: true,
        minDeliveryDate: turnaroundCheck.minDeliveryDate,
        maxDays: turnaroundCheck.maxDays,
        serviceLabels: turnaroundCheck.serviceLabels,
      });
      setPendingContinueAfterTurnaround(true);
      return;
    }

    proceedToPayment();
  };

  const handleAcceptSuggestedDelivery = () => {
    const collectionDate = orderData?.collectionData?.collectionDate;
    const collectionTimeTo = orderData?.collectionData?.collectionTimeTo;
    const update = buildDeliveryUpdateForMinDate(
      slotsDeliveryForTurnaround,
      collectionDate,
      collectionTimeTo,
      turnaroundModal.minDeliveryDate
    );
    if (update) {
      dispatch(setDeliveryData(update));
    }
    setTurnaroundModal((prev) => ({ ...prev, open: false }));
    if (pendingContinueAfterTurnaround) {
      setPendingContinueAfterTurnaround(false);
      if (isRescheduleFlow) {
        void handleRescheduleSubmit(update || undefined);
      } else {
        proceedToPayment();
      }
    }
  };

  const handleChangeDeliveryDateFromTurnaround = () => {
    setTurnaroundModal((prev) => ({ ...prev, open: false }));
    setPendingContinueAfterTurnaround(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("openDeliveryDateModal", "1");
      if (turnaroundModal.minDeliveryDate) {
        sessionStorage.setItem(
          "minDeliveryDate",
          turnaroundModal.minDeliveryDate
        );
      }
    }
    router.push("/place-order");
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

    const quantityCountMode = resolveQuantityCountMode(
      preferences,
      showBagsInput,
      showItemsInput
    );

    // Build preferences array with preferenceTypeId and preferenceValueId
    const preferencesArray = [];
    const preferencesDisplay = [];
    Object.keys(preferences).forEach((key) => {
        if (
          key === "additionalInstructions" ||
          key === "washTypeSettings" ||
          key === "bagsCount" ||
          key === "itemsCount" ||
          key === "quantityCountMode"
        ) {
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

    if (quantityCountMode === "bags" && showBagsInput && preferences.bagsCount) {
      preferencesDisplay.push({
        preferenceTypeName: "Number of bags",
        value: String(preferences.bagsCount),
      });
    }
    if (quantityCountMode === "items" && showItemsInput && preferences.itemsCount) {
      preferencesDisplay.push({
        preferenceTypeName: "Number of items",
        value: String(preferences.itemsCount),
      });
    }

    const prefsData = {
      serviceName,
      preferencesArray,
      preferencesDisplay,
      additionalInstructions: preferences.additionalInstructions || "",
      selectedPreferences: deepClone(preferences),
      ...(quantityCountMode === "bags" && showBagsInput && preferences.bagsCount
        ? { bagsCount: Number(preferences.bagsCount) }
        : {}),
      ...(quantityCountMode === "items" && showItemsInput && preferences.itemsCount
        ? { itemsCount: Number(preferences.itemsCount) }
        : {}),
    };

    // Dispatch to redux
    dispatch(updatePreference({ serviceId: currentServiceId, data: prefsData }));

    // Reset state
    setPreferences({});
    setWashInstructionPanelOpen({});
    setWashAccordionOpenId(null);
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
                          p={item?.description}
                          turnaroundDays={parseTimeRequiredDays(item?.timeRequired)}
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
            setWashAccordionOpenId(null);
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
            ) : (Array.isArray(servicePreferencesData) &&
                servicePreferencesData.length > 0) ||
              showBagsInput ||
              showItemsInput ? (
              <>
                <div
                  ref={modalScrollRef}
                  onScroll={handleModalScroll}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                >
                  <div className="w-full px-6 py-6 font-sf">
                <div className="space-y-6">
                  {(servicePreferencesData || []).map((pref) => {
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
                        {isWashTypePref && !isDryCleanService ? (
                          <>
                            {getPreferenceInstruction(pref) ? (
                              <p className="font-sf text-sm text-theme-psGray leading-relaxed">
                                {getPreferenceInstruction(pref)}
                              </p>
                            ) : null}
                            <div className="space-y-3">
                              {values.map((value) => {
                                const temperaturePref = getSettingPreference(
                                  servicePreferencesData,
                                  isTemperaturePreference
                                );
                                const detergentPref = getSettingPreference(
                                  servicePreferencesData,
                                  isDetergentPreference
                                );
                                const selectedWashList = Array.isArray(currentPref)
                                  ? currentPref
                                  : [];
                                const isSelected = selectedWashList.some(
                                  (sv) => sv.preferenceValueId === value.id
                                );
                                const firstSelectedInOrder = values.find((v) =>
                                  selectedWashList.some((s) => s.preferenceValueId === v.id)
                                );
                                const firstSelectedValueId = firstSelectedInOrder?.id;

                                const selectedSettings =
                                  preferences?.washTypeSettings?.[value.id] || {};

                                const washInstrKey = String(value.id);
                                const washInstrOpen = Boolean(
                                  washInstructionPanelOpen[washInstrKey]
                                );
                                const washHasInstr = Boolean(
                                  (selectedSettings.preferenceInstruction ?? "").trim()
                                );

                                const hasWashSubPickOptions =
                                  Boolean(temperaturePref) || Boolean(detergentPref);

                                const isMixedWashOption =
                                  String(value?.value ?? "")
                                    .trim()
                                    .toLowerCase() === "mixed wash";

                                const isExpanded =
                                  isSelected &&
                                  (hasWashSubPickOptions
                                    ? washAccordionOpenId === WASH_ACCORDION_ALL_COLLAPSED
                                      ? false
                                      : washAccordionOpenId === null
                                        ? value.id === firstSelectedValueId
                                        : washAccordionOpenId === value.id
                                    : true);

                                const runWashTypeToggle = () => {
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

                                    const existingSettings = prev.washTypeSettings || {};
                                    const nextSettings = { ...existingSettings };

                                    if (!alreadySelected) {
                                      nextSettings[value.id] = buildDefaultWashTypeSettings(
                                        servicePreferencesData || []
                                      );
                                    } else {
                                      delete nextSettings[value.id];
                                    }

                                    return {
                                      ...prev,
                                      [prefKey]: nextSelectedWashTypes,
                                      washTypeSettings: nextSettings,
                                    };
                                  });
                                };

                                return (
                                  <div
                                    key={value.id}
                                    className={`overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                                      isSelected &&
                                      (!hasWashSubPickOptions || isExpanded)
                                        ? "border-theme-blue shadow-sm"
                                        : "border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-stretch gap-3 px-3 py-3.5">
                                      <button
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const wasSelected = isSelected;
                                          runWashTypeToggle();
                                          if (wasSelected) {
                                            setWashInstructionPanelOpen((prev) => {
                                              const next = { ...prev };
                                              delete next[washInstrKey];
                                              return next;
                                            });
                                          }
                                          if (!wasSelected) {
                                            setWashAccordionOpenId(value.id);
                                          } else {
                                            setWashAccordionOpenId(null);
                                          }
                                        }}
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                          isSelected
                                            ? "border-theme-blue bg-theme-blue text-white"
                                            : "border-gray-300 bg-white"
                                        }`}
                                      >
                                        {isSelected ? (
                                          <FaCheck className="h-3 w-3" aria-hidden />
                                        ) : null}
                                      </button>
                                      <button
                                        type="button"
                                        className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                                        onClick={() => {
                                          if (!hasWashSubPickOptions) {
                                            runWashTypeToggle();
                                            return;
                                          }
                                          if (!isSelected) {
                                            runWashTypeToggle();
                                            setWashAccordionOpenId(value.id);
                                          } else {
                                            setWashAccordionOpenId(
                                              isExpanded
                                                ? WASH_ACCORDION_ALL_COLLAPSED
                                                : value.id
                                            );
                                          }
                                        }}
                                      >
                                        <span
                                          className={`font-sf text-base ${
                                            isSelected
                                              ? "font-semibold text-theme-blue"
                                              : "font-medium text-gray-900"
                                          }`}
                                        >
                                          {value.value}
                                        </span>
                                        {hasWashSubPickOptions ? (
                                          <span className="shrink-0 text-gray-500">
                                            {isExpanded ? (
                                              <FaChevronUp className="h-4 w-4" aria-hidden />
                                            ) : (
                                              <FaChevronDown className="h-4 w-4" aria-hidden />
                                            )}
                                          </span>
                                        ) : null}
                                      </button>
                                    </div>

                                    {isSelected && isExpanded && (
                                      <div className="space-y-4 border-t border-gray-100 px-3 pb-4 pt-3">
                                        {isMixedWashOption && (
                                        <div
                                          className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 font-sf text-sm leading-snug text-amber-950"
                                          role="note"
                                        >
                                          <IoInformationCircleOutline
                                            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                                            aria-hidden
                                          />
                                          <span>
                                            You are responsible if clothes colour bleeds due to
                                            the selected wash settings.
                                          </span>
                                        </div>
                                        )}

                                        {temperaturePref && (
                                          <div>
                                            <p className="pb-2 font-sf text-xs font-medium uppercase tracking-wide text-gray-500">
                                              {getPreferenceLabel(temperaturePref) ||
                                                "Wash temperature"}
                                            </p>
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
                                                      className={`rounded-full border px-3 py-1.5 font-sf text-sm transition-colors ${
                                                        isTempSelected
                                                          ? "border-theme-blue bg-theme-blue text-white"
                                                          : "border-gray-300 bg-white text-gray-900"
                                                      }`}
                                                      onClick={() =>
                                                        setPreferences((prev) => {
                                                          const existing =
                                                            prev.washTypeSettings || {};
                                                          const selectedWashSettings =
                                                            existing[value.id] || {};
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
                                                              [value.id]: nextSettings,
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
                                            <p className="pb-2 font-sf text-xs font-medium uppercase tracking-wide text-gray-500">
                                              {getPreferenceLabel(detergentPref) || "Detergent"}
                                            </p>
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
                                                      className={`rounded-full border px-3 py-1.5 font-sf text-sm transition-colors ${
                                                        isDetergentSelected
                                                          ? "border-theme-blue bg-theme-blue text-white"
                                                          : "border-gray-300 bg-white text-gray-900"
                                                      }`}
                                                      onClick={() =>
                                                        setPreferences((prev) => {
                                                          const existing =
                                                            prev.washTypeSettings || {};
                                                          const selectedWashSettings =
                                                            existing[value.id] || {};
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
                                                              [value.id]: nextSettings,
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

                                        <div>
                                          {!washInstrOpen && !washHasInstr ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setWashInstructionPanelOpen((prev) => ({
                                                  ...prev,
                                                  [washInstrKey]: true,
                                                }))
                                              }
                                              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-sf text-xs font-medium text-theme-gray-3 transition hover:bg-gray-50"
                                            >
                                              Add instruction
                                            </button>
                                          ) : null}
                                          {!washInstrOpen && washHasInstr ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setWashInstructionPanelOpen((prev) => ({
                                                  ...prev,
                                                  [washInstrKey]: true,
                                                }))
                                              }
                                              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-sf text-xs font-medium text-theme-gray-3 transition hover:bg-gray-50"
                                            >
                                              Edit instruction
                                            </button>
                                          ) : null}
                                          {washInstrOpen ? (
                                            <>
                                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <span className="font-sf text-sm font-medium text-gray-700">
                                                    Preference Instruction
                                                  </span>
                                                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-sf text-xs text-gray-500">
                                                    Optional
                                                  </span>
                                                </div>
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
                                                className="min-h-[100px] w-full resize-none rounded-2xl border border-gray-200 bg-white p-3 font-sf text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-theme-blue focus:ring-1 focus:ring-theme-blue"
                                                placeholder="Add any special instructions for this wash type..."
                                                value={
                                                  selectedSettings.preferenceInstruction ?? ""
                                                }
                                                onChange={(e) =>
                                                  setPreferences((prev) => {
                                                    const existing = prev.washTypeSettings || {};
                                                    const row = existing[value.id] || {};
                                                    return {
                                                      ...prev,
                                                      washTypeSettings: {
                                                        ...existing,
                                                        [value.id]: {
                                                          ...row,
                                                          preferenceInstruction: e.target.value,
                                                        },
                                                      },
                                                    };
                                                  })
                                                }
                                              />
                                            </>
                                          ) : null}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            {getPreferenceInstruction(pref) &&
                            !(isWashTypePref && isDryCleanService) ? (
                              <p className="font-sf text-sm text-theme-psGray leading-relaxed">
                                {getPreferenceInstruction(pref)}
                              </p>
                            ) : null}
                            <div className="space-y-3">
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

                                const runToggle = () => {
                                  if (isWashTypePref) {
                                    setPreferences((prev) => {
                                      const selectedWashTypes = Array.isArray(
                                        prev[prefKey]
                                      )
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
                                        nextSettings[value.id] =
                                          buildDefaultWashTypeSettings(
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

                                  setPreferences((prev) => {
                                    const current = prev[prefKey];
                                    const alreadyThis =
                                      current?.preferenceTypeId &&
                                      current?.preferenceValueId === value.id;
                                    if (alreadyThis) {
                                      const next = { ...prev };
                                      delete next[prefKey];
                                      return next;
                                    }
                                    return {
                                      ...prev,
                                      [prefKey]: {
                                        preferenceTypeId: getPreferenceId(pref),
                                        preferenceTypeName:
                                          getPreferenceLabel(pref) || prefKey,
                                        preferenceValueId: value.id,
                                        value: value.value,
                                      },
                                    };
                                  });
                                };

                                return (
                                  <div
                                    key={value.id}
                                    className={`overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                                      isSelected
                                        ? "border-theme-blue shadow-sm"
                                        : "border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-stretch gap-3 px-3 py-3.5">
                                      <button
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          runToggle();
                                        }}
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                          isSelected
                                            ? "border-theme-blue bg-theme-blue text-white"
                                            : "border-gray-300 bg-white"
                                        }`}
                                      >
                                        {isSelected ? (
                                          <FaCheck className="h-3 w-3" aria-hidden />
                                        ) : null}
                                      </button>
                                      <button
                                        type="button"
                                        className="flex min-w-0 flex-1 flex-col items-stretch gap-0.5 text-left"
                                        onClick={() => runToggle()}
                                      >
                                        <span
                                          className={`font-sf text-base ${
                                            isSelected
                                              ? "font-semibold text-theme-blue"
                                              : "font-medium text-gray-900"
                                          }`}
                                        >
                                          {value.value}
                                        </span>
                                        {(value.temperature || value.meta) && (
                                          <span className="font-sf text-xs font-normal text-gray-500">
                                            {value.temperature || value.meta}
                                          </span>
                                        )}
                                        {(value.price != null || value.weight != null) && (
                                          <span className="font-sf text-xs font-normal text-gray-500">
                                            {value.price != null && `£${value.price}`}
                                            {value.price != null &&
                                              value.weight != null &&
                                              " · "}
                                            {value.weight != null && `${value.weight}kg`}
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(showBagsInput || showItemsInput) && (
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex flex-row gap-2 shrink-0">
                      {showBagsInput && showItemsInput ? (
                        <>
                          {[
                            { mode: "bags", label: "Number of bags" },
                            { mode: "items", label: "Number of items" },
                          ].map(({ mode, label }) => {
                            const active =
                              resolveQuantityCountMode(
                                preferences,
                                showBagsInput,
                                showItemsInput
                              ) === mode;
                            return (
                              <button
                                key={mode}
                                type="button"
                                onClick={() =>
                                  setPreferences((prev) => ({
                                    ...prev,
                                    quantityCountMode: mode,
                                  }))
                                }
                                className={`h-[42px] flex items-center rounded-lg border-2 px-3 font-sf text-sm font-medium transition-colors whitespace-nowrap ${
                                  active
                                    ? "border-theme-blue bg-theme-blue/5 text-theme-blue"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </>
                      ) : (
                        <p className="font-sf font-semibold text-base text-theme-gray-3 whitespace-nowrap h-[42px] flex items-center">
                          {showBagsInput ? "Number of bags" : "Number of items"}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      {resolveQuantityCountMode(
                        preferences,
                        showBagsInput,
                        showItemsInput
                      ) === "items" ? (
                        <InputField
                          label=""
                          type="number"
                          min={1}
                          step={1}
                          placeholder="e.g. 10"
                          value={preferences.itemsCount ?? ""}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            setPreferences((prev) => ({
                              ...prev,
                              itemsCount: digitsOnly,
                            }));
                          }}
                          classNames={{
                            label: ["hidden"],
                            base: ["!mt-0"],
                            inputWrapper: ["!h-[42px]", "min-h-[42px]"],
                            input: ["text-sm"],
                          }}
                        />
                      ) : (
                        <InputField
                          label=""
                          type="number"
                          min={1}
                          step={1}
                          placeholder="e.g. 2"
                          value={preferences.bagsCount ?? ""}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            setPreferences((prev) => ({
                              ...prev,
                              bagsCount: digitsOnly,
                            }));
                          }}
                          classNames={{
                            label: ["hidden"],
                            base: ["!mt-0"],
                            inputWrapper: ["!h-[42px]", "min-h-[42px]"],
                            input: ["text-sm"],
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

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

      <ReusableModal
        isOpen={turnaroundModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setTurnaroundModal((prev) => ({ ...prev, open: false }));
            setPendingContinueAfterTurnaround(false);
          }
        }}
        showHeader
        headerTitle="Delivery date update"
        showFooter
        footerContent={
          <div className="w-full flex flex-col gap-3 px-6 pb-6">
            <ButtonYouth70018
              size="compact"
              text="Use suggested date"
              onClick={handleAcceptSuggestedDelivery}
            />
            <ButtonYouth70018
              size="compact"
              variant="outline"
              text="Change delivery date"
              onClick={handleChangeDeliveryDateFromTurnaround}
            />
          </div>
        }
      >
        <div className="px-6 py-4 font-sf text-base text-theme-psGray space-y-3">
          <p>
            One or more services in your order need more processing time
            {turnaroundModal.maxDays
              ? ` (${turnaroundModal.maxDays} day${turnaroundModal.maxDays > 1 ? "s" : ""})`
              : ""}
            .
          </p>
          {turnaroundModal.serviceLabels?.length > 0 && (
            <p className="font-medium text-gray-900">
              {turnaroundModal.serviceLabels.join(", ")}
            </p>
          )}
          <p>
            Your current delivery date is too early. The earliest delivery we can
            offer is{" "}
            <span className="font-semibold text-gray-900">
              {formatIsoDateLong(turnaroundModal.minDeliveryDate)}
            </span>
            .
          </p>
        </div>
      </ReusableModal>
    </>
  );
}
