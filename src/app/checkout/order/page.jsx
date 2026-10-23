"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import CategoryCard from "../../../../components/CategoryCard";
import { ButtonYouth70018 } from "../../../../components/Buttons";
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
  setPage,
  updatePreference,
  setOrderData,
  removePreference,
} from "@/app/store/slices/cartItemSlice";
import {
  fetchBookingSlots,
  fetchZoneForCoordinates,
} from "../../../../utilities/bookingSlotsApi";
import {
  buildDeliveryUpdateForMinDate,
  formatIsoDateLong,
  getTurnaroundConflict,
} from "../../../../utilities/turnaroundTime";
import { formatDate, to24Hour } from "../../../../utilities/ConversionFunction";
import { groupServicePrefs } from "../../../../utilities/serviceChips";
import PageShell from "../../../../components/ds/PageShell";
import ServiceBar from "../../../../components/booking/ServiceBar";
import ProtoIcon from "../../../../components/proto/ProtoIcon";
import { cx } from "../../../../components/ds/cx";
import { lockPageScroll } from "../../../../utilities/scrollLock";
import { useFitsViewport } from "../../../../components/ds/useFitsViewport";
import * as ui from "../../../../components/booking/ui";

// "Good to know." questions from the prototype's services page.
const SERVICES_FAQ = [
  { q: "How is each service priced?", a: "Every service is priced by item. You’ll see the price for each item, and nothing is charged until your things are checked and counted." },
  { q: "Can I add more than one service?", a: "Yes — add as many as you need. They’re all collected together in a single pickup." },
  { q: "Not sure exactly what you need?", a: "Just add the service and leave a note. Our team checks your items and confirms everything with you before any charge." },
  { q: "When do I pay?", a: "There’s no charge now. We confirm your items and the total after collection, and you pay then." },
  { q: "Can I still change my pickup?", a: "Of course. Use the Edit or Modify links in your pickup summary to change your times, address or driver instructions." },
];
import { useRouter } from "next/navigation";
import { MiniLoader } from "../../../../components/Loader";
import {
  parseServiceBooleanFlag,
  shouldShowWashBleedDisclaimer,
  WASH_BLEED_DISCLAIMER_TEXT,
} from "../../../../utilities/washBleedDisclaimer";

const parseQuantityCount = (value) => {
  const parsed = parseInt(String(value ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

// Quantity stepper (bags / items) in the preferences popup
function ProtoStepper({ label, icon, value, onChange, disabled = false }) {
  const count = parseQuantityCount(value);
  return (
    <div className={cx(ui.STEP, disabled && "pointer-events-none opacity-50")}>
      <span className={ui.STEP_LBL}>
        <span className={ui.STEP_IC}>
          <ProtoIcon name={icon} size={18} />
        </span>
        <b>{label}</b>
      </span>
      <span className={ui.STEPPER}>
        <button type="button" className={ui.STEPPER_BTN} aria-label="Decrease" disabled={disabled} onClick={() => onChange(Math.max(0, count - 1))}>
          &minus;
        </button>
        <input className={ui.STEPPER_VAL} value={count} readOnly aria-label={label} />
        <button type="button" className={ui.STEPPER_BTN} aria-label="Increase" disabled={disabled} onClick={() => onChange(count + 1)}>
          +
        </button>
      </span>
    </div>
  );
}

export default function Order() {
  const dispatch = useDispatch();
  const [asideRef, asideFits] = useFitsViewport(108 + 16);
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
  const collectionLat = orderData?.collectionData?.lat;
  const collectionLng = orderData?.collectionData?.lng;
  const { data, isLoading } = useGetServicesQuery(
    { lat: collectionLat, lng: collectionLng },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [modal, setModal] = useState({
    modType: "wash",
    step: "",
  });
  const [turnaroundModal, setTurnaroundModal] = useState({
    open: false,
    minDeliveryDate: "",
    maxDays: 0,
    serviceLabels: [],
  });
  const [pendingContinueAfterTurnaround, setPendingContinueAfterTurnaround] =
    useState(false);

  const [slotsDeliveryForTurnaround, setSlotsDeliveryForTurnaround] = useState(
    []
  );

  useEffect(() => {
    const lat = orderData?.collectionData?.lat;
    const lng = orderData?.collectionData?.lng;
    if (lat == null || lng == null) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const zone = await fetchZoneForCoordinates(lat, lng);
        const delData = await fetchBookingSlots({
          countryId: zone.countryId,
          zoneId: zone.zoneId,
          clientTimeZone,
          type: "delivery",
          daysCount: 21,
        });
        if (!cancelled) setSlotsDeliveryForTurnaround(delData.days || []);
      } catch (err) {
        console.warn("Could not load platform delivery slots for turnaround", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    orderData?.collectionData?.lat,
    orderData?.collectionData?.lng,
    clientTimeZone,
  ]);

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

  const selectedServiceCount = useMemo(() => {
    const ids = new Set(cartServiceIds);
    if (currentServiceId) ids.add(Number(currentServiceId));
    return ids.size;
  }, [cartServiceIds, currentServiceId]);

  const multiServiceInCart = selectedServiceCount >= 2;
  const canOfferOneBag =
    serviceList.length >= 2 ||
    preferencesData.length >= 2 ||
    multiServiceInCart;

  const packingSourceServiceId = orderData?.sameBagSourceServiceId ?? null;
  const sourceStillInCart =
    packingSourceServiceId == null ||
    cartServiceIds.some(
      (id) => Number(id) === Number(packingSourceServiceId)
    ) ||
    Number(currentServiceId) === Number(packingSourceServiceId);

  /** User chose "All in one bag" (stored on order; applies at checkout when 2+ services). */
  const isAllInOneBagSelected = orderData?.sameBagForAllServices === true;
  /** Shared bag counts apply only with 2+ services in cart (matches payment API). */
  const sharedBagsApply =
    isAllInOneBagSelected && multiServiceInCart && sourceStillInCart;
  const isPackingSourceService =
    packingSourceServiceId == null ||
    Number(currentServiceId) === Number(packingSourceServiceId);

  const showPackingOptions = canOfferOneBag;
  const canEditPackingChoice =
    showPackingOptions && (!sharedBagsApply || isPackingSourceService);

  const packingSourceServiceName = useMemo(() => {
    if (packingSourceServiceId == null) return null;
    const fromCart = (preferencesData || []).find(
      (p) => Number(p?.serviceId) === Number(packingSourceServiceId)
    );
    if (fromCart?.serviceName) return fromCart.serviceName;
    return (
      serviceList.find((s) => Number(s?.id) === Number(packingSourceServiceId))
        ?.name ?? null
    );
  }, [packingSourceServiceId, preferencesData, serviceList]);

  const bagsStepperDisabled = sharedBagsApply && !isPackingSourceService;
  const itemsStepperDisabled = false;
  const useSharedBagStepper =
    isAllInOneBagSelected && isPackingSourceService;

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

  // Initialize preferences state based on fetched data
  const [preferences, setPreferences] = useState({});
  /** `preferenceValueId` (string) -> whether per–wash-type instruction textarea is shown */
  const [washInstructionPanelOpen, setWashInstructionPanelOpen] = useState({});
  /** Wash accordion: `null` = expand first selected row; `"__none__"` = all bodies collapsed; else open that value id */
  const [washAccordionOpenId, setWashAccordionOpenId] = useState(null);

  const handlePackingModeChange = (mode) => {
    if (mode === "allInOne") {
      const bagCount = parseQuantityCount(
        preferences.bagsCount ?? orderData?.totalBags
      );
      dispatch(
        setOrderData({
          sameBagForAllServices: true,
          sameBagSourceServiceId: Number(currentServiceId),
          ...(bagCount > 0 ? { totalBags: bagCount } : {}),
        })
      );
      return;
    }
    dispatch(
      setOrderData({
        sameBagForAllServices: false,
        sameBagSourceServiceId: null,
      })
    );
  };

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
  } = useGetServiceWithPreferenceDetailsQuery(
    {
      serviceId: currentServiceId,
      lat: orderData?.collectionData?.lat,
      lng: orderData?.collectionData?.lng,
    },
    {
      skip: !currentServiceId,
      refetchOnMountOrArgChange: true,
    }
  );

  const servicePreferencesData = preferencesResponse?.data?.preferencesData;
  const preferenceServiceMeta = preferencesResponse?.data;

  const showBagsInput = parseServiceBooleanFlag(
    preferenceServiceMeta?.numberOfBags ?? currentServiceMeta?.numberOfBags
  );
  const showItemsInput = parseServiceBooleanFlag(
    preferenceServiceMeta?.numberOfItems ?? currentServiceMeta?.numberOfItems
  );

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
            useSharedBagStepper
              ? String(orderData?.totalBags ?? "")
              : savedPrefs.bagsCount != null
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
          useSharedBagStepper
            ? String(orderData?.totalBags ?? "")
            : existingServicePref?.bagsCount != null
              ? String(existingServicePref.bagsCount)
              : "";
      }
      if (showItemsInput) {
        initialPrefs.itemsCount =
          existingServicePref?.itemsCount != null
            ? String(existingServicePref.itemsCount)
            : "";
      }
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
    useSharedBagStepper,
    multiServiceInCart,
    orderData?.totalBags,
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
            useSharedBagStepper
              ? String(orderData?.totalBags ?? "")
              : existingServicePref?.bagsCount != null
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

  useEffect(() => {
    const on = isOpen && modal?.modType === "servicePreferences";
    lockPageScroll(on);
    return () => {
      lockPageScroll(false);
    };
  }, [isOpen, modal?.modType]);

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
      rescheduleType: orderData?.rescheduleData?.rescheduleType || "full",
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

    // Build preferences array with preferenceTypeId and preferenceValueId
    const preferencesArray = [];
    const preferencesDisplay = [];
    Object.keys(preferences).forEach((key) => {
        if (
          key === "additionalInstructions" ||
          key === "washTypeSettings" ||
          key === "bagsCount" ||
          key === "itemsCount"
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

    const resolvedBagCount = useSharedBagStepper
      ? parseQuantityCount(orderData?.totalBags ?? preferences.bagsCount)
      : parseQuantityCount(preferences.bagsCount);

    if (showBagsInput && !bagsStepperDisabled) {
      if (useSharedBagStepper) {
        dispatch(
          setOrderData({
            totalBags: resolvedBagCount > 0 ? resolvedBagCount : "",
          })
        );
        if (isPackingSourceService && resolvedBagCount > 0) {
          preferencesDisplay.push({
            preferenceTypeName: "Number of bags (all services)",
            value: String(resolvedBagCount),
          });
        }
      } else if (resolvedBagCount > 0) {
        preferencesDisplay.push({
          preferenceTypeName: "Number of bags",
          value: String(resolvedBagCount),
        });
      }
    }
    if (
      showItemsInput &&
      parseQuantityCount(preferences.itemsCount) > 0 &&
      !itemsStepperDisabled
    ) {
      preferencesDisplay.push({
        preferenceTypeName: "Number of items",
        value: String(parseQuantityCount(preferences.itemsCount)),
      });
    }

    const prefsData = {
      serviceName,
      preferencesArray,
      preferencesDisplay,
      additionalInstructions: preferences.additionalInstructions || "",
      selectedPreferences: deepClone(preferences),
      ...(showBagsInput &&
      !bagsStepperDisabled &&
      (!isAllInOneBagSelected || isPackingSourceService)
        ? { bagsCount: resolvedBagCount }
        : {}),
      ...(showItemsInput && !itemsStepperDisabled
        ? { itemsCount: parseQuantityCount(preferences.itemsCount) }
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

  // Editing a service already in the order: show "Remove service" and "Update".
  const removable = preferencesData.some((p) => Number(p?.serviceId) === Number(currentServiceId));

  return (
    <>
      <PageShell header="solid">
        {/* Add services: layout from the prototype (services.html), styled with Tailwind */}
        <div id="jdcServicesRoot" className={ui.ROOT}>
          <div className={ui.PAGE_BG}>
            <section className={ui.HERO_SECTION}>
              <div className={ui.WRAP}>
                <div className={ui.PG_HEAD}>
                  <div className={ui.TITLE_ROW}>
                    <a
                      className={cx(ui.BACK, "mb-3.5", ui.BACK_ROUND)}
                      href="/place-order"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/place-order");
                      }}
                    >
                      <ProtoIcon name="back" size={16} />
                      <span className={ui.BACK_LABEL}>Back</span>
                    </a>
                    <h1 className={ui.H2}>
                      Add your <em>services.</em>
                    </h1>
                  </div>
                  <p className={ui.LEAD}>
                    Pick what you&rsquo;d like cleaned. You only pay after we weigh it.
                  </p>
                </div>

                <div className="mt-[34px] grid grid-cols-[minmax(0,1fr)_310px] [align-items:start] gap-7 min-[1200px]:grid-cols-[minmax(0,1fr)_330px] min-[1200px]:gap-8 max-[980px]:block max-[980px]:grid-cols-[minmax(0,1fr)] max-[980px]:gap-[22px]">
                  <div className="min-w-0 max-[980px]:mx-auto max-[980px]:max-w-[760px]">
                    <div className="flex flex-col gap-4">
                      {!isLoading ? (
                        data?.data?.serviceData?.map((item) => {
                          const selectedEntry = Array.isArray(preferencesData)
                            ? preferencesData.find((elem) => elem?.serviceId === item?.id)
                            : null;
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
                              h={item?.name}
                              p={item?.description}
                              type={selectedEntry ? "check" : "plus"}
                              serviceId={item?.id}
                              prefs={selectedEntry?.preferencesDisplay}
                            />
                          );
                        })
                      ) : (
                        <div className="flex justify-center py-10">
                          <MiniLoader />
                        </div>
                      )}
                    </div>
                  </div>

                  <aside ref={asideRef} className={cx(asideFits && "sticky top-[108px]", "flex flex-col gap-[18px] max-[980px]:static max-[980px]:!hidden max-[980px]:min-w-0 max-[980px]:max-w-full")}>
                    <div className={ui.SUM}>
                      <div className={ui.SUM_HEAD}>
                        <ProtoIcon name="truck" size={18} />
                        <b>Pickup</b>
                        <a
                          className={cx(ui.SUM_EDIT, "ml-auto")}
                          href="/place-order"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push("/place-order");
                          }}
                        >
                          Edit
                        </a>
                      </div>
                      <p className={ui.SUM_LEAD}>Scheduled for</p>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Collection</p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="calendar" size={16} />
                          <span>{formatDate(orderData?.collectionData?.collectionDate) || "Not set"}</span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="clock" size={16} />
                          <span>
                            {orderData?.collectionData?.collectionTimeFrom
                              ? `${to24Hour(orderData?.collectionData?.collectionTimeFrom)} – ${to24Hour(
                                  orderData?.collectionData?.collectionTimeTo
                                )}`
                              : "—"}
                          </span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="door" size={16} />
                          <span>{orderData?.collectionData?.driverInstructionOptions || "—"}</span>
                        </p>
                      </div>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Delivery</p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="calendar" size={16} />
                          <span>{formatDate(orderData?.deliveryData?.deliveryDate) || "Not set"}</span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="clock" size={16} />
                          <span>
                            {orderData?.deliveryData?.deliveryTimeFrom
                              ? `${to24Hour(orderData?.deliveryData?.deliveryTimeFrom)} – ${to24Hour(
                                  orderData?.deliveryData?.deliveryTimeTo
                                )}`
                              : "—"}
                          </span>
                        </p>
                        <p className={ui.SUM_ROW}>
                          <ProtoIcon name="door" size={16} />
                          <span>{orderData?.deliveryData?.driverInstructionOptions1 || "—"}</span>
                        </p>
                      </div>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Address</p>
                        <p className={cx(ui.SUM_ROW, ui.SUM_ROW_BETWEEN)}>
                          <span className={ui.SUM_ADDR}>
                            <ProtoIcon name="pin" size={16} />
                            <span>{orderData?.collectionData?.streetAddress || "Not set"}</span>
                          </span>
                          <a
                            className={ui.SUM_EDIT}
                            href="/place-order"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push("/place-order");
                            }}
                          >
                            Modify
                          </a>
                        </p>
                      </div>
                      <div className={ui.SUM_BLOCK}>
                        <p className={ui.SUM_SUB}>Driver instructions</p>
                        <p className={cx(ui.SUM_ROW, ui.SUM_ROW_BETWEEN)}>
                          <span className={ui.SUM_ADDR}>
                            <ProtoIcon name="note" size={16} />
                            <span className={orderData?.driverInstruction ? "" : ui.SUM_MUTED}>
                              {orderData?.driverInstruction || "None"}
                            </span>
                          </span>
                          <a
                            className={ui.SUM_EDIT}
                            href="/place-order"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push("/place-order");
                            }}
                          >
                            {orderData?.driverInstruction ? "Edit" : "Add"}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className={ui.SUM}>
                      <div className={cx(ui.SUM_HEAD, "mb-0.5")}>
                        <ProtoIcon name="basket" size={18} />
                        <b>Services requested</b>
                        <span className={ui.REQ_COUNT}>{preferencesData?.length || 0}</span>
                      </div>
                      <div className={ui.REQ_LIST}>
                        {preferencesData?.length > 0 ? (
                          <>
                            {preferencesData.map((item, idx) => (
                              <div key={item?.serviceId ?? idx} className={ui.REQ_ITEM}>
                                <div className={ui.REQ_HEAD}>
                                  <span className={ui.REQ_NAME}>{item?.serviceName || "Selected"}</span>
                                  <button
                                    type="button"
                                    className={ui.REQ_X}
                                    aria-label={`Remove ${item?.serviceName || "service"}`}
                                    onClick={() => dispatch(removePreference(item?.serviceId))}
                                  >
                                    ×
                                  </button>
                                </div>
                                {(Array.isArray(item?.preferencesDisplay) && item.preferencesDisplay.length > 0) ||
                                item?.additionalInstructions ? (
                                  <div className={ui.REQ_PREFS}>
                                    {groupServicePrefs(item?.preferencesDisplay).map((group, gIdx) => (
                                      <div key={`${idx}-${gIdx}`} className={ui.REQ_GROUP}>
                                        {group.title && (
                                          <div className={ui.REQ_GROUP_HEAD}>
                                            <span>{group.title}</span>
                                            {group.detail && <span className={ui.REQ_GROUP_DETAIL}>{group.detail}</span>}
                                          </div>
                                        )}
                                        {group.rows.length > 0 && (
                                          <div className={ui.REQ_ROWS}>
                                            {group.rows.map((row, rIdx) => (
                                              <div key={rIdx} className={ui.REQ_ROW}>
                                                <span className={ui.REQ_ROW_L}>{row.label}</span>
                                                <span className={ui.REQ_ROW_V}>{row.value}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {group.note && (
                                          <p className={ui.REQ_GROUP_NOTE}>
                                            <span className="text-jdc-muted">Note: </span>
                                            {group.note}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                    {item?.additionalInstructions && (
                                      <div className={ui.REQ_PREF}>
                                        <span className={ui.REQ_PREF_L}>Instructions</span>
                                        <span className={ui.REQ_PREF_V}>{item?.additionalInstructions}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                            {sharedBagsApply && parseQuantityCount(orderData?.totalBags) > 0 && (
                              <div className={ui.REQ_ITEM}>
                                <div className={cx(ui.REQ_PREFS, "mt-0")}>
                                  <div className={ui.REQ_PREF}>
                                    <span className={ui.REQ_PREF_L}>Number of bags (all services)</span>
                                    <span className={ui.REQ_PREF_V}>{parseQuantityCount(orderData?.totalBags)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className={ui.REQ_EMPTY}>No service selected yet. Pick one on the left to get started.</p>
                        )}
                      </div>
                      <p className={ui.REQ_NOTE}>
                        <ProtoIcon name="shield" size={16} />
                        <span>No charge now &mdash; you pay after your items are weighed and confirmed.</span>
                      </p>
                      <button
                        type="button"
                        className={cx(ui.BTN, ui.BTN_BLOCK, "h-[52px] disabled:cursor-not-allowed disabled:opacity-50")}
                        id="svcCheckout"
                        disabled={
                          isRescheduling ||
                          !preferencesData?.length ||
                          (!isRescheduleFlow && !orderData?.collectionData?.streetAddress)
                        }
                        onClick={handleContinue}
                      >
                        Continue to checkout
                        <ProtoIcon name="arrow" size={18} />
                      </button>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <section className={ui.FAQ_SECTION} id="svcFaq">
              <div className={ui.WRAP}>
                <div className={cx(ui.PG_HEAD, ui.PG_HEAD_CENTER, "mb-[26px] max-[720px]:mb-[26px]")}>
                  <h2 className={ui.H2}>
                    Good to <em>know.</em>
                  </h2>
                </div>
                <div className={ui.FAQ_CARD}>
                  <div>
                    <div className={ui.FAQ_LIST}>
                      {SERVICES_FAQ.map((f) => (
                        <details key={f.q} className={ui.FAQ_DETAILS}>
                          <summary className={ui.FAQ_SUMMARY}>
                            {f.q}
                            <i aria-hidden="true" className={ui.FAQ_ICON}>
                              <ProtoIcon name="chevDown" size={14} />
                            </i>
                          </summary>
                          <p className={ui.FAQ_ANSWER}>{f.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Service preferences popup */}
          {modal?.modType === "servicePreferences" && currentServiceId ? (
            <div className={cx(ui.MODAL, !(isOpen) && "hidden")} id="svcModal" hidden={!isOpen}>
              <div className={ui.MODAL_OVERLAY} onClick={handleCancelModal} />
              <div className={ui.MODAL_PANEL} role="dialog" aria-modal="true" aria-labelledby="svcModalTitle">
                <div className={ui.MODAL_HEAD}>
                  <b id="svcModalTitle">
                    {currentServiceMeta?.name ? `${currentServiceMeta.name} preferences` : "Service preferences"}
                  </b>
                  <button type="button" className={ui.MODAL_X} onClick={handleCancelModal}>
                    Cancel
                  </button>
                </div>
                <div className={ui.MODAL_BODY} id="svcModalBody" ref={modalScrollRef}>
                  {isLoadingPreferences || isFetchingPreferences ? (
                    <div className="flex justify-center py-10">
                      <MiniLoader />
                    </div>
                  ) : (Array.isArray(servicePreferencesData) && servicePreferencesData.length > 0) ||
                    showBagsInput ||
                    showItemsInput ? (
                    <>
                      {(servicePreferencesData || []).map((pref) => {
                        const prefKey = getPreferenceKey(pref);
                        const currentPref = preferences[prefKey];
                        const values = getPreferenceValues(pref);
                        const isWashTypePref = isWashTypePreference(prefKey);
                        const isMultiPref = isMultiSelectPreferenceGroup(pref);
                        if (isTemperaturePreference(prefKey) || isDetergentPreference(prefKey)) return null;

                        const temperaturePref = getSettingPreference(servicePreferencesData, isTemperaturePreference);
                        const detergentPref = getSettingPreference(servicePreferencesData, isDetergentPreference);
                        const washWithSubs = isWashTypePref && !isDryCleanService;
                        const hasWashSubPickOptions = washWithSubs && (Boolean(temperaturePref) || Boolean(detergentPref));
                        const selectedList = Array.isArray(currentPref)
                          ? currentPref
                          : currentPref?.preferenceTypeId
                            ? [currentPref]
                            : [];
                        const firstSelectedValueId = values.find((v) =>
                          selectedList.some((s) => s.preferenceValueId === v.id)
                        )?.id;

                        const entryFor = (value) => ({
                          preferenceTypeId: getPreferenceId(pref),
                          preferenceTypeName: getPreferenceLabel(pref) || prefKey,
                          preferenceValueId: value.id,
                          value: value.value,
                        });

                        // tick / untick one option (wash types keep their own temperature + detergent)
                        const toggle = (value) =>
                          setPreferences((prev) => {
                            if (isWashTypePref || isMultiPref) {
                              const raw = prev[prefKey];
                              const list = Array.isArray(raw) ? raw : raw?.preferenceTypeId ? [raw] : [];
                              const already = list.some((s) => s.preferenceValueId === value.id);
                              const nextList = already
                                ? list.filter((s) => s.preferenceValueId !== value.id)
                                : [...list, entryFor(value)];
                              if (!washWithSubs) return { ...prev, [prefKey]: nextList };
                              const nextSettings = { ...(prev.washTypeSettings || {}) };
                              if (already) delete nextSettings[value.id];
                              else nextSettings[value.id] = buildDefaultWashTypeSettings(servicePreferencesData || []);
                              return { ...prev, [prefKey]: nextList, washTypeSettings: nextSettings };
                            }
                            if (prev[prefKey]?.preferenceValueId === value.id) {
                              const next = { ...prev };
                              delete next[prefKey];
                              return next;
                            }
                            return { ...prev, [prefKey]: entryFor(value) };
                          });

                        const setWashSetting = (value, settingKey, settingPref, settingValue) =>
                          setPreferences((prev) => {
                            const existing = prev.washTypeSettings || {};
                            return {
                              ...prev,
                              washTypeSettings: {
                                ...existing,
                                [value.id]: {
                                  ...(existing[value.id] || {}),
                                  [settingKey]: {
                                    preferenceTypeId: getPreferenceId(settingPref),
                                    preferenceTypeName:
                                      getPreferenceLabel(settingPref) ||
                                      (settingKey === "temperature" ? "Temperature" : "Detergent"),
                                    preferenceValueId: settingValue.id,
                                    value: settingValue.value,
                                  },
                                },
                              },
                            };
                          });

                        return (
                          <div key={pref.id}>
                            <h3 className={ui.SEC_H3}>{getPreferenceLabel(pref)}</h3>
                            {getPreferenceInstruction(pref) ? (
                              <p className={ui.QTY_HINT}>{getPreferenceInstruction(pref)}</p>
                            ) : null}
                            {values.map((value) => {
                              const isSelected = selectedList.some((s) => s.preferenceValueId === value.id);
                              const isExpanded =
                                hasWashSubPickOptions &&
                                isSelected &&
                                (washAccordionOpenId === WASH_ACCORDION_ALL_COLLAPSED
                                  ? false
                                  : washAccordionOpenId === null
                                    ? value.id === firstSelectedValueId
                                    : washAccordionOpenId === value.id);
                              const settings = preferences?.washTypeSettings?.[value.id] || {};
                              const instrKey = String(value.id);
                              const instrOpen =
                                Boolean(washInstructionPanelOpen[instrKey]) ||
                                Boolean((settings.preferenceInstruction ?? "").trim());
                              const priceText = [
                                value.price != null ? `£${value.price}` : null,
                                value.weight != null ? `${value.weight}kg` : null,
                              ]
                                .filter(Boolean)
                                .join(" / ");
                              // "Mixed Wash (£19.50 / 6kg)" → name in bold, price underneath (prototype)
                              const split = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(String(value.value || ""));
                              const optName = split ? split[1] : value.value;
                              const meta = value.temperature || value.meta || priceText || (split ? split[2] : "");

                              return (
                                <div className={cx(ui.OPT, isSelected && ui.OPT_ON)} key={value.id}>
                                  <label
                                    className={ui.OPT_ROW}
                                    onClick={(e) => {
                                      if (!hasWashSubPickOptions) return;
                                      if (e.target.tagName === "INPUT") return;
                                      // name / arrow: open or close the choices; ticks the option, never unticks
                                      e.preventDefault();
                                      if (!isSelected) {
                                        toggle(value);
                                        setWashAccordionOpenId(value.id);
                                        return;
                                      }
                                      setWashAccordionOpenId(isExpanded ? WASH_ACCORDION_ALL_COLLAPSED : value.id);
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      className={ui.CHECKBOX}
                                      name={prefKey}
                                      value={value.value}
                                      checked={isSelected}
                                      onChange={() => {
                                        toggle(value);
                                        if (hasWashSubPickOptions) {
                                          if (!isSelected) setWashAccordionOpenId(value.id);
                                          else {
                                            setWashAccordionOpenId(null);
                                            setWashInstructionPanelOpen((prev) => {
                                              const next = { ...prev };
                                              delete next[instrKey];
                                              return next;
                                            });
                                          }
                                        }
                                      }}
                                    />
                                    <span className={ui.OPT_MAIN}>
                                      <b>{optName}</b>
                                      {meta ? <small>{meta}</small> : null}
                                    </span>
                                    {hasWashSubPickOptions ? (
                                      <button
                                        type="button"
                                        className={cx(ui.OPT_EXP, isExpanded && "rotate-180")}
                                        aria-label={`Options for ${optName}`}
                                        aria-expanded={isExpanded ? "true" : "false"}
                                      >
                                        <ProtoIcon name="chevDown" size={18} />
                                      </button>
                                    ) : null}
                                  </label>
                                  {hasWashSubPickOptions ? (
                                    <div className={cx(ui.OPT_MORE, !(isExpanded) && "hidden")} hidden={!isExpanded}>
                                      {shouldShowWashBleedDisclaimer(preferenceServiceMeta, value?.value) ? (
                                        <p className={ui.QTY_HINT} role="note">
                                          {WASH_BLEED_DISCLAIMER_TEXT}
                                        </p>
                                      ) : null}
                                      {[
                                        ["temperature", temperaturePref, "Wash temperature"],
                                        ["detergent", detergentPref, "Detergent"],
                                      ].map(([settingKey, settingPref, fallback]) =>
                                        settingPref ? (
                                          <div className={ui.SUB} key={settingKey}>
                                            <p className={ui.SUB_LBL}>{getPreferenceLabel(settingPref) || fallback}</p>
                                            <div className={ui.PILLS} data-sublabel={getPreferenceLabel(settingPref) || fallback}>
                                              {getPreferenceValues(settingPref).map((sv) => (
                                                <button
                                                  key={sv.id}
                                                  type="button"
                                                  className={cx(
                                                    ui.PILL,
                                                    settings?.[settingKey]?.preferenceValueId === sv.id && ui.PILL_ON
                                                  )}
                                                  data-v={sv.value}
                                                  onClick={() => setWashSetting(value, settingKey, settingPref, sv)}
                                                >
                                                  {sv.value}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        ) : null
                                      )}
                                      <button
                                        type="button"
                                        className={cx(ui.SUB_ADD, (instrOpen) && "hidden")}
                                        hidden={instrOpen}
                                        onClick={() => setWashInstructionPanelOpen((prev) => ({ ...prev, [instrKey]: true }))}
                                      >
                                        Add instruction
                                      </button>
                                      <div className={cx(ui.SUB_NOTE, !(instrOpen) && "hidden")} hidden={!instrOpen}>
                                        <div className={ui.SUB_NOTE_H}>
                                          <b>Preference instruction</b>
                                          <span className={ui.SUB_TAG}>Optional</span>
                                          <button
                                            type="button"
                                            className={ui.SUB_HIDE}
                                            onClick={() =>
                                              setWashInstructionPanelOpen((prev) => ({ ...prev, [instrKey]: false }))
                                            }
                                          >
                                            Hide
                                          </button>
                                        </div>
                                        <textarea
                                          className={ui.SUB_TA}
                                          rows={3}
                                          placeholder="Add any special instructions for this wash type..."
                                          value={settings.preferenceInstruction ?? ""}
                                          onChange={(e) =>
                                            setPreferences((prev) => {
                                              const existing = prev.washTypeSettings || {};
                                              return {
                                                ...prev,
                                                washTypeSettings: {
                                                  ...existing,
                                                  [value.id]: {
                                                    ...(existing[value.id] || {}),
                                                    preferenceInstruction: e.target.value,
                                                  },
                                                },
                                              };
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      {showBagsInput || showItemsInput ? (
                        <div className={ui.QTY}>
                          <b className={ui.QTY_H}>
                            Estimated quantity <span>(optional)</span>
                          </b>
                          <p className={ui.QTY_HINT}>Help us prepare for collection &mdash; you can skip this if unsure.</p>
                          {showPackingOptions && canEditPackingChoice ? (
                            <>
                              <p className={ui.QTY_Q}>How are you packing?</p>
                              <label className={cx(ui.PACK, !isAllInOneBagSelected && ui.PACK_ON)}>
                                <input
                                  type="radio"
                                  className={ui.RADIO}
                                  name={`m-pack-${currentServiceId}`}
                                  value="One bag per service"
                                  checked={!isAllInOneBagSelected}
                                  onChange={() => handlePackingModeChange("perService")}
                                />
                                <span>
                                  <b>One bag per service</b>
                                  <small>Recommended when mixing wash types</small>
                                </span>
                              </label>
                              <label className={cx(ui.PACK, isAllInOneBagSelected && ui.PACK_ON)}>
                                <input
                                  type="radio"
                                  className={ui.RADIO}
                                  name={`m-pack-${currentServiceId}`}
                                  value="All in one bag"
                                  checked={isAllInOneBagSelected}
                                  onChange={() => handlePackingModeChange("allInOne")}
                                />
                                <span>
                                  <b>All in one bag</b>
                                  <small>Everything in a single bag for collection</small>
                                </span>
                              </label>
                              {isAllInOneBagSelected && !multiServiceInCart ? (
                                <p className={ui.QTY_HINT}>
                                  Add another service to your order for this option to apply at checkout.
                                </p>
                              ) : null}
                            </>
                          ) : null}
                          {showPackingOptions && !canEditPackingChoice ? (
                            <p className={ui.QTY_HINT}>
                              All in one bag &mdash;{" "}
                              {packingSourceServiceName
                                ? `bag count is set on ${packingSourceServiceName}.`
                                : "bag count is set on your first service."}
                              {parseQuantityCount(orderData?.totalBags) > 0
                                ? ` Total: ${parseQuantityCount(orderData?.totalBags)} bag(s).`
                                : ""}
                            </p>
                          ) : null}
                          {showBagsInput && !bagsStepperDisabled ? (
                            <ProtoStepper
                              label="Bags"
                              icon="bag"
                              value={useSharedBagStepper ? orderData?.totalBags : preferences.bagsCount}
                              onChange={(next) => {
                                if (useSharedBagStepper) dispatch(setOrderData({ totalBags: next }));
                                else setPreferences((prev) => ({ ...prev, bagsCount: String(next) }));
                              }}
                            />
                          ) : null}
                          {showItemsInput ? (
                            <ProtoStepper
                              label="Items"
                              icon="tshirt2"
                              value={preferences.itemsCount}
                              disabled={itemsStepperDisabled}
                              onChange={(next) => setPreferences((prev) => ({ ...prev, itemsCount: String(next) }))}
                            />
                          ) : null}
                        </div>
                      ) : null}

                      <div>
                        <h3 className={ui.SEC_H3}>Additional service instructions</h3>
                        <textarea
                          className={ui.TA}
                          placeholder="Enter your instructions"
                          value={preferences.additionalInstructions || ""}
                          onChange={(e) =>
                            setPreferences((prev) => ({ ...prev, additionalInstructions: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <p className={ui.REQ_EMPTY}>No preferences available for this service.</p>
                  )}
                </div>
                <div className={cx(ui.MODAL_FOOT, removable && "flex items-center gap-3")}>
                  <button
                    type="button"
                    className={cx(ui.MODAL_RM, !(removable) && "hidden")}
                    hidden={!preferencesData.some((p) => Number(p?.serviceId) === Number(currentServiceId))}
                    onClick={() => {
                      const nm = currentServiceMeta?.name || "Service";
                      dispatch(removePreference(currentServiceId));
                      handleCancelModal();
                      addToast({ title: `${nm} removed`, color: "success" });
                    }}
                  >
                    Remove service
                  </button>
                  <button type="button" className={cx(ui.BTN, ui.BTN_BLOCK, removable && "flex-1")} onClick={closePreferenceModal}>
                    {preferencesData.some((p) => Number(p?.serviceId) === Number(currentServiceId)) ? "Update" : "Continue"}
                    <ProtoIcon name="arrow" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <ServiceBar
            count={preferencesData?.length || 0}
            targetId="svcCheckout"
            fallbackId="svcFaq"
            rootId="jdcServicesRoot"
            isDisabled={isRescheduling || (!isRescheduleFlow && !orderData?.collectionData?.streetAddress)}
            onContinue={handleContinue}
          />
        </div>
      </PageShell>

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={true}
        isOpen={isOpen && modal?.modType !== "servicePreferences"}
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
        {modal.modType === "dry cleaning" ? (
          ""
        ) : modal.modType === "driverInstructions" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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
