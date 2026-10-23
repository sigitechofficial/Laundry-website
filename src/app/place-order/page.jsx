"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { takeBookingDraft } from "../../../utilities/useStartBooking";
import { ensureGuestSession } from "../../../utilities/guestSession";
import { ButtonYouth70018 } from "../../../components/Buttons";
import { PiArrowRight } from "react-icons/pi";
import { FaChevronLeft } from "react-icons/fa";
import ReusableModal from "../../../components/Modal";
import { Spinner, addToast, useDisclosure } from "@heroui/react";
import { TbLocation } from "react-icons/tb";
import { useRouter } from "next/navigation";
import {
  fetchBookingSlots,
  fetchZoneForCoordinates,
} from "../../../utilities/bookingSlotsApi";
import { useLiveClock } from "../../../utilities/useLiveClock";
import { useDispatch, useSelector } from "react-redux";
import { setOrderData, setPage, clearCartData } from "../store/slices/cartItemSlice";
import {
  useGetAllAddressQuery,
  useGetServicesQuery,
  useGetAllOrdersQuery,
  useRescheduleBookingMutation,
} from "../store/services/api";
import { to24Hour } from "../../../utilities/ConversionFunction";
import { getFailedAttemptBookings } from "../../../utilities/bookingAttemptStatus";
import {
  buildDeliveryUpdateForMinDate,
  formatIsoDateLong,
  getMinDeliveryDate,
  getMaxTurnaroundDays,
  getTurnaroundConflict,
} from "../../../utilities/turnaroundTime";
import PageShell from "../../../components/ds/PageShell";
import { cx } from "../../../components/ds/cx";
import { BACK_LABEL, BACK_ROUND, BTN, BTN_BLOCK, CTRL, CTRL_CHEV, CTRL_ICON, CTRL_INPUT, FIELD, FIELD_LABEL, FIELDSET, LEGEND, ROOT, TITLE_ROW } from "../../../components/booking/ui";
import { MiniLoader } from "../../../components/Loader";
import { BASE_URL } from "../../../utilities/URL";
import AddressFilterLookup from "../../../components/AddressFilterLookup";
import { mapPostcodeAddressToFormFields } from "../../../utilities/postcodeLookup";
import ProtoIcon from "../../../components/proto/ProtoIcon";
import ProtoSelect from "../../../components/proto/ProtoSelect";
import BookAddressFields from "../../../components/booking/BookAddressFields";
import SlotSheet, { slotNiceDay } from "../../../components/booking/SlotSheet";

const collection = [
  { key: "Collect from me in person", label: "Collect from me in person" },
  { key: "Collect from Outside", label: "Collect from Outside" },
  { key: "Collect from reception/Porter", label: "Collect from reception/Porter" },
  { key: "Collect from the reception", label: "Collect from the reception" },
];
const delivery = [
  { key: "Deliver to me in person", label: "Deliver to me in person" },
  { key: "Leave at the door", label: "Leave at the door" },
  { key: "Deliver to the Reception/Porter", label: "Deliver to the Reception/Porter" },
];

function SlotTimezoneBanner({ operational, clientLocal }) {
  const { time: liveOperationalTime, abbrev: liveOperationalAbbrev } =
    useLiveClock(operational?.ianaTimeZone);
  const { time: liveClientTime } = useLiveClock(clientLocal?.ianaTimeZone);

  if (!operational) return null;
  const showLocal =
    clientLocal?.ianaTimeZone &&
    clientLocal.ianaTimeZone !== operational.ianaTimeZone;
  const opAbbrev =
    liveOperationalAbbrev || operational.abbreviationNow || "";
  const opNow = liveOperationalTime || operational.nowFormatted || "";
  const clientNow = liveClientTime || clientLocal?.nowFormatted || "";

  return (
    <div className="rounded-xl bg-theme-gray/80 px-4 py-3 text-sm font-sf space-y-1 mb-4">
      <p>
        Times in{" "}
        <span className="font-semibold">{operational.displayLabel}</span>
        {opAbbrev ? ` (${opAbbrev}, now ${opNow})` : ` (now ${opNow})`}
      </p>
      {showLocal ? (
        <p className="text-theme-psGray">
          Your local ({clientLocal.ianaTimeZone}): now {clientNow}
        </p>
      ) : null}
    </div>
  );
}

export default function PlaceOrderPage() {
  const router = useRouter();
  const orderData = useSelector((state) => state.cart.orderData);
  const preferencesData = useSelector((state) => state.cart.preferences) || [];
  const { data: servicesApiData } = useGetServicesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const isRescheduleFlow = Boolean(orderData?.rescheduleData?.isReschedule);
  const isDeliveryOnlyReschedule = isRescheduleFlow && orderData?.rescheduleData?.rescheduleType === "delivery";
  const state = history.state?.customData?.step || null;
  const dispatch = useDispatch();
  const [rescheduleBooking, { isLoading: isRescheduling }] =
    useRescheduleBookingMutation();
  const { data } = useGetAllAddressQuery();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    isOpen: isFailedAttemptModalOpen,
    onOpen: onFailedAttemptModalOpen,
    onClose: onFailedAttemptModalClose,
    onOpenChange: onFailedAttemptModalOpenChange,
  } = useDisclosure();
  const [failedAttemptModalShown, setFailedAttemptModalShown] = useState(false);
  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("loginStatus");
  const { data: ordersData } = useGetAllOrdersQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
  });
  const failedAttemptBookings = useMemo(
    () => getFailedAttemptBookings(ordersData?.data),
    [ordersData]
  );

  // The "Action required" popup is shown once per order: orders the customer has
  // already seen it for are remembered, so it only comes back for a new one.
  // (Those orders stay flagged in Order history.)
  const FAILED_SEEN_KEY = "jdc:failedAttemptSeen";
  const readFailedSeen = () => {
    try {
      return JSON.parse(localStorage.getItem(FAILED_SEEN_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const markFailedAttemptsSeen = () => {
    try {
      const seen = new Set(readFailedSeen().map(String));
      failedAttemptBookings.forEach(({ order }) => seen.add(String(order.id)));
      localStorage.setItem(FAILED_SEEN_KEY, JSON.stringify([...seen]));
    } catch {
      // storage unavailable: the popup may show again next time
    }
  };
  const closeFailedAttemptModal = () => {
    markFailedAttemptsSeen();
    onFailedAttemptModalClose();
  };

  useEffect(() => {
    if (failedAttemptModalShown) return;
    if (failedAttemptBookings.length === 0) return;
    if (isRescheduleFlow) return;
    const seen = new Set(readFailedSeen().map(String));
    if (failedAttemptBookings.every(({ order }) => seen.has(String(order.id)))) return;
    const t = setTimeout(() => {
      setFailedAttemptModalShown(true);
      onFailedAttemptModalOpen();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failedAttemptBookings, failedAttemptModalShown, onFailedAttemptModalOpen, isRescheduleFlow]);

  const goToFailedAttemptOrder = (bookingId) => {
    closeFailedAttemptModal();
    router.push(`/profile?tab=order-history&bookingId=${bookingId}`);
  };

  const [step, setStep] = useState(state ?? "get-started");
  const [isCheckingZone, setIsCheckingZone] = useState(false);
  const [modal, setModal] = useState({
    modType: "",
  });
  const [modalScroll, setModalScroll] = useState(false);
  const [sheet, setSheet] = useState(""); // "Col" | "Del" slot sheet
  const [noteOpen, setNoteOpen] = useState(false);
  const [turnaroundModal, setTurnaroundModal] = useState({
    open: false,
    minDeliveryDate: "",
    maxDays: 0,
    serviceLabels: [],
  });
  const [proceedAfterTurnaroundAccept, setProceedAfterTurnaroundAccept] =
    useState(false);

  const cartServiceIds = useMemo(() => {
    const ids = new Set();
    preferencesData.forEach((item) => {
      if (item?.serviceId) ids.add(Number(item.serviceId));
    });
    return [...ids];
  }, [preferencesData]);

  const serviceList = servicesApiData?.data?.serviceData ?? [];

  const { maxDays: cartMaxTurnaroundDays } = useMemo(
    () => getMaxTurnaroundDays(serviceList, cartServiceIds),
    [serviceList, cartServiceIds]
  );

  const isPostcodeDisabled = false;
  const clientTimeZone =
    Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "UTC";

  const [slots, setSlots] = useState([]);
  const [slotsDelivery, setSlotsDelivery] = useState([]);
  const [slotsOperational, setSlotsOperational] = useState(null);
  const [slotsClientLocal, setSlotsClientLocal] = useState(null);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  /** ISO yyyy-mm-dd → "April 2026" (avoids hardcoded month/year in modals) */
  const formatSlotMonthYear = (isoDate) => {
    if (!isoDate || typeof isoDate !== "string") return "";
    const parts = isoDate.split("-");
    if (parts.length < 2) return "";
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!Number.isFinite(y) || !Number.isFinite(m)) return "";
    return new Date(y, m - 1, 15).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  /** ISO yyyy-mm-dd → DD/MM/YY for read-only field display */
  const initialCollectionSlot = useMemo(() => slots?.[0] || null, [slots]);

  const initialDeliverySlot = useMemo(() => {
    const baseDate = initialCollectionSlot?.date;
    if (!baseDate) return slotsDelivery?.[0] || null;
    return (
      slotsDelivery?.find((slot) => slot.date > baseDate) ||
      slotsDelivery?.[0] ||
      null
    );
  }, [slotsDelivery, initialCollectionSlot]);

  const [driverInstruction, setDriverInstruction] = useState("");
  const [collectionData, setCollectionData] = useState({
    collectionDate: initialCollectionSlot?.date || "",
    collectionTimeTo: initialCollectionSlot?.timeSlots?.[0]?.end || "",
    collectionTimeFrom: initialCollectionSlot?.timeSlots?.[0]?.start || "",
    driverInstructionOptions: "",
    availableTimeSlots: initialCollectionSlot?.timeSlots || [],
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
    deliveryDate: initialDeliverySlot?.date || "",
    deliveryTimeTo: initialDeliverySlot?.timeSlots?.[0]?.end || "",
    deliveryTimeFrom: initialDeliverySlot?.timeSlots?.[0]?.start || "",
    driverInstructionOptions1: "",
    availableTimeSlots: initialDeliverySlot?.timeSlots || [],
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

  const minDeliveryForCart = useMemo(() => {
    if (!collectionData?.collectionDate) return "";
    return getMinDeliveryDate(collectionData.collectionDate, cartMaxTurnaroundDays);
  }, [collectionData?.collectionDate, cartMaxTurnaroundDays]);

  const loadDeliverySlotsForCountry = async (countryId, fromDate) => {
    const delData = await fetchBookingSlots({
      countryId,
      clientTimeZone,
      type: "delivery",
      daysCount: 21,
      fromDate: fromDate || undefined,
    });
    setSlotsDelivery(delData.days || []);
    return delData;
  };

  const loadSlotsForPickupAddress = async (
    lat,
    lng,
    { preserveSchedule = false } = {}
  ) => {
    setSlotsLoading(true);
    try {
      const zone = await fetchZoneForCoordinates(lat, lng);
      setZoneInfo(zone);

      const colData = await fetchBookingSlots({
        countryId: zone.countryId,
        clientTimeZone,
        type: "collection",
        daysCount: 7,
      });
      setSlots(colData.days || []);
      setSlotsOperational(colData.operational || null);
      setSlotsClientLocal(colData.clientLocal || null);

      const firstDay = colData.days?.[0];
      const firstSlot = firstDay?.timeSlots?.[0];
      if (firstDay && firstSlot) {
        let resolvedCollectionDate = firstDay.date;
        if (preserveSchedule && collectionData?.collectionDate) {
          const matchedCollectionDay = colData.days?.find(
            (d) => d.date === collectionData.collectionDate
          );
          if (matchedCollectionDay) {
            resolvedCollectionDate = matchedCollectionDay.date;
          }
        }

        setCollectionData((prev) => {
          let day = firstDay;
          let slot = firstSlot;
          if (preserveSchedule && prev.collectionDate) {
            const matchedDay = colData.days?.find(
              (d) => d.date === prev.collectionDate
            );
            if (matchedDay?.timeSlots?.length) {
              day = matchedDay;
              slot =
                matchedDay.timeSlots.find(
                  (s) => s.start === prev.collectionTimeFrom
                ) || matchedDay.timeSlots[0];
            }
          }
          return {
            ...prev,
            collectionDate: day.date,
            collectionTimeFrom: slot.start,
            collectionTimeTo: slot.end,
            availableTimeSlots: day.timeSlots,
            operationalTimeZone: colData.operational?.ianaTimeZone,
            timeZone: colData.operational?.ianaTimeZone,
            clientTimeZone,
          };
        });

        const minDel =
          getMinDeliveryDate(resolvedCollectionDate, cartMaxTurnaroundDays) ||
          resolvedCollectionDate;
        const delData = await loadDeliverySlotsForCountry(zone.countryId, minDel);
        setDeliveryData((prev) => {
          const firstDel =
            delData.days?.find((d) => d.date >= minDel) || delData.days?.[0];
          const firstDelSlot = firstDel?.timeSlots?.[0];
          if (!firstDel || !firstDelSlot) return prev;

          let day = firstDel;
          let slot = firstDelSlot;
          if (preserveSchedule && prev.deliveryDate) {
            const matchedDay = delData.days?.find(
              (d) => d.date === prev.deliveryDate
            );
            if (matchedDay?.timeSlots?.length) {
              day = matchedDay;
              slot =
                matchedDay.timeSlots.find(
                  (s) => s.start === prev.deliveryTimeFrom
                ) || matchedDay.timeSlots[0];
            }
          }

          return {
            ...prev,
            deliveryDate: day.date,
            deliveryTimeFrom: slot.start,
            deliveryTimeTo: slot.end,
            availableTimeSlots: day.timeSlots,
            operationalTimeZone: colData.operational?.ianaTimeZone,
            timeZone: colData.operational?.ianaTimeZone,
            clientTimeZone,
          };
        });
      }
    } catch (err) {
      addToast({
        title: err?.message || "Could not load time slots for this address.",
        color: "danger",
      });
      setSlots([]);
      setSlotsDelivery([]);
      setSlotsOperational(null);
      setSlotsClientLocal(null);
    } finally {
      setSlotsLoading(false);
    }
  };

  const deliverySlotsFetchKeyRef = useRef(null);

  useEffect(() => {
    if (!collectionData?.lat || !collectionData?.lng) return;
    deliverySlotsFetchKeyRef.current = null;
    loadSlotsForPickupAddress(collectionData.lat, collectionData.lng, {
      preserveSchedule: isRescheduleFlow,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionData?.lat, collectionData?.lng, clientTimeZone, isRescheduleFlow]);

  // Delivery slots: fetch once when delivery modal opens (not on every collection date tap)
  useEffect(() => {
    if (!isOpen) {
      deliverySlotsFetchKeyRef.current = null;
      return;
    }
    if (
      modal?.modType !== "delivery-date" ||
      !zoneInfo?.countryId ||
      !collectionData?.collectionDate
    ) {
      return;
    }
    const minStr =
      minDeliveryForCart ||
      getMinDeliveryDate(collectionData.collectionDate, 0);
    const fetchKey = `${zoneInfo.countryId}-${minStr}-${clientTimeZone}`;
    if (deliverySlotsFetchKeyRef.current === fetchKey) return;
    deliverySlotsFetchKeyRef.current = fetchKey;

    loadDeliverySlotsForCountry(zoneInfo.countryId, minStr)
      .then((delData) => {
        setDeliveryData((prev) => {
          const day =
            delData.days?.find((d) => d.date === prev.deliveryDate) ||
            delData.days?.find((d) => d.date >= minStr) ||
            delData.days?.[0];
          if (!day?.timeSlots?.length) return prev;
          const slot =
            day.timeSlots.find((s) => s.start === prev.deliveryTimeFrom) ||
            day.timeSlots[0];
          return {
            ...prev,
            deliveryDate: day.date,
            deliveryTimeFrom: slot.start,
            deliveryTimeTo: slot.end,
            availableTimeSlots: day.timeSlots,
          };
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    modal?.modType,
    zoneInfo?.countryId,
    collectionData?.collectionDate,
    minDeliveryForCart,
    clientTimeZone,
  ]);

  // Parse time string to minutes since midnight for comparison (handles "1:00 PM", "10:00 AM", or "13:00:00")
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const s = timeStr.trim();
    const hasAmPm = /AM|PM/i.test(s);
    if (hasAmPm) {
      const match = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return 0;
      let [, h, m, ap] = match;
      h = parseInt(h, 10);
      m = parseInt(m, 10) || 0;
      if (ap.toUpperCase() === "PM" && h !== 12) h += 12;
      if (ap.toUpperCase() === "AM" && h === 12) h = 0;
      return h * 60 + m;
    }
    const parts = s.split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  // Display helper: convert "4:00 PM" -> "16:00", keep "08:00:00" -> "08:00"
  const formatTo24HourDisplay = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return "";
    const s = timeStr.trim();
    const hasAmPm = /AM|PM/i.test(s);
    if (hasAmPm) {
      const match = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return s;
      let [, h, m, ap] = match;
      let hour = parseInt(h, 10);
      const minute = parseInt(m, 10) || 0;
      if (ap.toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (ap.toUpperCase() === "AM" && hour === 12) hour = 0;
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    const parts = s.split(":");
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return s;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  // Delivery date must be on or after minimum (collection + turnaround when applicable)
  const isDeliveryBeforeMinimum = useMemo(() => {
    if (!collectionData?.collectionDate || !deliveryData?.deliveryDate) return false;
    const minStr =
      minDeliveryForCart ||
      getMinDeliveryDate(collectionData.collectionDate, 0);
    return deliveryData.deliveryDate < minStr;
  }, [
    collectionData?.collectionDate,
    deliveryData?.deliveryDate,
    minDeliveryForCart,
  ]);

  const isDeliverySameOrBeforeCollection =
    !!collectionData?.collectionDate &&
    !!deliveryData?.deliveryDate &&
    new Date(deliveryData.deliveryDate) <= new Date(collectionData.collectionDate);

  // Kept as a guard, though delivery is now enforced to next day.
  const isSameDayDeliveryBeforeCollection =
    !!collectionData?.collectionDate &&
    !!deliveryData?.deliveryDate &&
    collectionData.collectionDate === deliveryData.deliveryDate &&
    !!collectionData?.collectionTimeTo &&
    !!deliveryData?.deliveryTimeFrom &&
    parseTimeToMinutes(deliveryData.deliveryTimeFrom) < parseTimeToMinutes(collectionData.collectionTimeTo);

  useEffect(() => {
    void ensureGuestSession();
  }, []);

  // Postcode typed on the home page: start this booking at that postcode and list
  // its addresses. Applied after the saved-booking sync so that doesn't overwrite it.
  const [draftPostcode, setDraftPostcode] = useState("");
  const draftRef = useRef(undefined); // read once; effects can run twice in development
  useEffect(() => {
    if (isRescheduleFlow) return undefined;
    if (draftRef.current === undefined) draftRef.current = takeBookingDraft();
    const draft = draftRef.current;
    if (!draft?.postcode) return undefined;
    const t = setTimeout(() => {
      setCollectionData((prev) => ({
        ...prev,
        postalCode: draft.postcode,
        streetAddress: "",
        lat: null,
        lng: null,
      }));
      setDraftPostcode(draft.postcode);
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPostcodeAddress = (address, target = "collection") => {
    const fields = {
      ...mapPostcodeAddressToFormFields(address),
      hotelName: null,
      apartmentNumber: null,
      floor: null,
    };

    if (target === "delivery") {
      setDeliveryData((prev) => ({ ...prev, ...fields }));
    } else {
      setCollectionData((prev) => ({ ...prev, ...fields }));
    }
  };

  const handleModalPostcodeAddressSelect = (address) => {
    const target =
      modal?.modType === "delivery-location" ? "delivery" : "collection";
    applyPostcodeAddress(address, target);
    setModal({ ...modal, modType: "" });
    onClose();
  };

  const renderModalAddressSearch = () => {
    const isDelivery = modal?.modType === "delivery-location";
    const postcodeValue = isDelivery
      ? deliveryData?.postalCode || ""
      : collectionData?.postalCode || "";

    return (
      <AddressFilterLookup
        key={`${modal?.modType}-${postcodeValue}-${isOpen}`}
        postcode={postcodeValue}
        disabled={isRescheduleFlow}
        placeholder="Flat, street or building name"
        onAddressSelect={handleModalPostcodeAddressSelect}
      />
    );
  };

  const parseCoordinate = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleUseCurrentLocation = (add) => {
    if (add?.id) {
      const applySavedAddress = (lat, lng) => {
        setCollectionData((prev) => ({
          ...prev,
          id: add?.id,
          streetAddress: add?.streetAddress || "",
          district: add?.district || "",
          title: add?.title || prev?.title || "Home",
          addressType: add?.addressType || prev?.addressType || "pickUp",
          province: add?.province || "",
          hotelName: null,
          apartmentNumber: null,
          floor: null,
          city: add?.city || "",
          country: add?.country || "",
          postalCode: add?.postalCode || add?.postcode || "",
          lat,
          lng,
        }));
        setModal({ ...modal, modType: "" });
        onClose();
      };

      const savedLat = parseCoordinate(add?.lat ?? add?.latitude);
      const savedLng = parseCoordinate(add?.lng ?? add?.longitude);

      if (savedLat !== null && savedLng !== null) {
        applySavedAddress(savedLat, savedLng);
        return;
      }

      const fallbackAddress = add?.streetAddress || [
        add?.district,
        add?.province,
        add?.country,
        add?.postalCode || add?.postcode,
      ]
        .filter(Boolean)
        .join(", ");

      if (fallbackAddress && window?.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: fallbackAddress }, (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const geoLat = parseCoordinate(results[0].geometry.location.lat());
            const geoLng = parseCoordinate(results[0].geometry.location.lng());
            applySavedAddress(geoLat, geoLng);
            return;
          }

          applySavedAddress(null, null);
        });
      } else {
        applySavedAddress(null, null);
      }
    } else {
      if (!navigator.geolocation) {
        addToast({ title: "Your browser can't share your location. Please enter your postcode.", color: "warning" });
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
    // Check if orderData has been cleared (empty or only default values)
    // Reset if orderData doesn't exist, or if collectionData has no meaningful user input
    const isOrderDataEmpty = !orderData ||
      !orderData.collectionData ||
      (!orderData.collectionData?.streetAddress &&
        !orderData.collectionData?.postalCode &&
        (!orderData.collectionData?.collectionDate || orderData.collectionData?.collectionDate === ""));

    if (isOrderDataEmpty) {
      // Reset form to initial state when orderData is cleared
      setCollectionData({
        collectionDate: initialCollectionSlot?.date || "",
        collectionTimeTo: initialCollectionSlot?.timeSlots?.[0]?.end || "",
        collectionTimeFrom: initialCollectionSlot?.timeSlots?.[0]?.start || "",
        driverInstructionOptions: "",
        availableTimeSlots: initialCollectionSlot?.timeSlots || [],
        title: "Home",
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
      setDeliveryData({
        deliveryDate: initialDeliverySlot?.date || "",
        deliveryTimeTo: initialDeliverySlot?.timeSlots?.[0]?.end || "",
        deliveryTimeFrom: initialDeliverySlot?.timeSlots?.[0]?.start || "",
        driverInstructionOptions1: "",
        availableTimeSlots: initialDeliverySlot?.timeSlots || [],
        title: "Home",
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
      setDriverInstruction("");
      return;
    }

    if (orderData) {
      if (orderData.collectionData) {
        // Merge with defaults to preserve first date/time if not set
        setCollectionData((prev) => ({
          ...prev,
          ...orderData.collectionData,
          // Preserve default first date/time if not in orderData
          collectionDate:
            orderData.collectionData.collectionDate ||
            prev.collectionDate ||
            initialCollectionSlot?.date ||
            "",
          collectionTimeFrom:
            orderData.collectionData.collectionTimeFrom ||
            prev.collectionTimeFrom ||
            initialCollectionSlot?.timeSlots?.[0]?.start ||
            "",
          collectionTimeTo:
            orderData.collectionData.collectionTimeTo ||
            prev.collectionTimeTo ||
            initialCollectionSlot?.timeSlots?.[0]?.end ||
            "",
          availableTimeSlots:
            orderData.collectionData.availableTimeSlots ||
            prev.availableTimeSlots ||
            initialCollectionSlot?.timeSlots ||
            [],
        }));
      }
      if (orderData.deliveryData) {
        // Merge with defaults to preserve first date/time if not set
        setDeliveryData((prev) => ({
          ...prev,
          ...orderData.deliveryData,
          // Preserve default first date/time if not in orderData
          deliveryDate:
            orderData.deliveryData.deliveryDate ||
            prev.deliveryDate ||
            initialDeliverySlot?.date ||
            "",
          deliveryTimeFrom:
            orderData.deliveryData.deliveryTimeFrom ||
            prev.deliveryTimeFrom ||
            initialDeliverySlot?.timeSlots?.[0]?.start ||
            "",
          deliveryTimeTo:
            orderData.deliveryData.deliveryTimeTo ||
            prev.deliveryTimeTo ||
            initialDeliverySlot?.timeSlots?.[0]?.end ||
            "",
          availableTimeSlots:
            orderData.deliveryData.availableTimeSlots ||
            prev.availableTimeSlots ||
            initialDeliverySlot?.timeSlots ||
            [],
        }));
      }
      if (orderData.driverInstruction) {
        setDriverInstruction(orderData.driverInstruction);
      } else {
        setDriverInstruction("");
      }
    }
  }, [orderData]);

  // Handover selects always show an option (prototype); default to the first.
  useEffect(() => {
    if (!collectionData?.driverInstructionOptions)
      setCollectionData((prev) => ({ ...prev, driverInstructionOptions: collection[0].key }));
    if (!deliveryData?.driverInstructionOptions1)
      setDeliveryData((prev) => ({ ...prev, driverInstructionOptions1: delivery[0].key }));
  }, [collectionData?.driverInstructionOptions, deliveryData?.driverInstructionOptions1]);

  // Ensure time slots are set when modal opens for collection date
  useEffect(() => {
    if (modal?.modType === "collection-date" && collectionData?.collectionDate) {
      const selectedSlot = slots?.find((slot) => slot.date === collectionData.collectionDate);
      if (selectedSlot && selectedSlot.timeSlots) {
        setCollectionData((prev) => ({
          ...prev,
          availableTimeSlots: selectedSlot.timeSlots,
        }));
      }
    }
  }, [modal?.modType, collectionData?.collectionDate]);

  // Ensure time slots are set when modal opens for delivery date
  useEffect(() => {
    if (modal?.modType === "delivery-date" && deliveryData?.deliveryDate) {
      const selectedSlot = slotsDelivery?.find((slot) => slot.date === deliveryData.deliveryDate);
      if (selectedSlot && selectedSlot.timeSlots) {
        setDeliveryData((prev) => ({
          ...prev,
          availableTimeSlots: selectedSlot.timeSlots,
        }));
      }
    }
  }, [modal?.modType, deliveryData?.deliveryDate]);

  // If delivery date is missing or before minimum (collection + turnaround), snap forward.
  useEffect(() => {
    if (!collectionData?.collectionDate || !slotsDelivery?.length) return;
    const minStr =
      minDeliveryForCart ||
      getMinDeliveryDate(collectionData.collectionDate, 0);
    const firstValid = slotsDelivery.find((slot) => slot.date >= minStr);
    if (!firstValid) return;
    const deliveryStr = deliveryData?.deliveryDate || "";
    const invalid = !deliveryStr || deliveryStr < minStr;
    if (!invalid) return;
    setDeliveryData((prev) => ({
      ...prev,
      deliveryDate: firstValid.date,
      deliveryTimeFrom: firstValid.timeSlots?.[0]?.start || prev.deliveryTimeFrom,
      deliveryTimeTo: firstValid.timeSlots?.[0]?.end || prev.deliveryTimeTo,
      availableTimeSlots: firstValid.timeSlots || [],
    }));
  }, [collectionData?.collectionDate, slotsDelivery, minDeliveryForCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("openDeliveryDateModal") === "1") {
      sessionStorage.removeItem("openDeliveryDateModal");
      setSheet("Del");
    }
  }, [onOpen]);

  // Same day: if delivery time is before collection end, reset to first valid delivery slot
  useEffect(() => {
    if (
      collectionData?.collectionDate !== deliveryData?.deliveryDate ||
      !collectionData?.collectionTimeTo ||
      !deliveryData?.deliveryTimeFrom
    )
      return;
    const collectionEndMins = parseTimeToMinutes(collectionData.collectionTimeTo);
    const deliveryStartMins = parseTimeToMinutes(deliveryData.deliveryTimeFrom);
    if (deliveryStartMins >= collectionEndMins) return;
    const slotSource =
      deliveryData?.availableTimeSlots?.length > 0
        ? deliveryData.availableTimeSlots
        : slotsDelivery?.find((s) => s.date === deliveryData?.deliveryDate)?.timeSlots || [];
    const firstValidSlot = slotSource.find(
      (item) => parseTimeToMinutes(item?.start) >= collectionEndMins
    );
    if (firstValidSlot) {
      setDeliveryData((prev) => ({
        ...prev,
        deliveryTimeFrom: firstValidSlot.start,
        deliveryTimeTo: firstValidSlot.end,
      }));
    }
  }, [
    collectionData?.collectionDate,
    collectionData?.collectionTimeTo,
    deliveryData?.deliveryDate,
  ]);

  const finishProceedToCheckout = async () => {
    const lat = collectionData?.lat;
    const lng = collectionData?.lng;

    if (!lat || !lng) {
      addToast({
        title: "Please choose a full address first.",
        color: "danger",
      });
      return;
    }

    const selectedTimeZone =
      collectionData?.operationalTimeZone ||
      zoneInfo?.operationalTimeZone ||
      zoneInfo?.ianaTimeZone ||
      collectionData?.timeZone ||
      orderData?.timeZone ||
      orderData?.rescheduleData?.timeZone ||
      clientTimeZone ||
      "Europe/London";

    setIsCheckingZone(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const response = await fetch(
        `${BASE_URL}customer/fetchZoneAndCharges?lat=${lat}&lng=${lng}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const json = await response.json();

      if (!response.ok || json?.status === "0") {
        addToast({
          title: "We don't deliver to this address yet.",
          color: "danger",
        });
        return;
      }
    } catch {
      addToast({
        title: "Couldn't check your area. Please try again.",
        color: "danger",
      });
      return;
    } finally {
      setIsCheckingZone(false);
    }

    const nextOrderData = {
      collectionData: {
        ...collectionData,
        timeZone: selectedTimeZone,
        clientTimeZone,
      },
      deliveryData: {
        ...deliveryData,
        timeZone: selectedTimeZone,
        clientTimeZone,
      },
      driverInstruction: driverInstruction,
      timeZone: selectedTimeZone,
      clientTimeZone,
    };

    dispatch(setOrderData(nextOrderData));

    // Reschedule flow (failed pickup/delivery): submit directly and skip the
    // services/checkout page — only the schedule changes, services stay the same.
    if (isRescheduleFlow) {
      await submitReschedule(selectedTimeZone);
      return;
    }

    setStep("");
    onClose();
    router.push("/checkout/order");
  };

  const submitReschedule = async (timeZone) => {
    const payload = {
      bookingId: Number(orderData?.rescheduleData?.bookingId),
      collectionDate: collectionData?.collectionDate,
      collectionTimeFrom: to24Hour(collectionData?.collectionTimeFrom),
      collectionTimeTo: to24Hour(collectionData?.collectionTimeTo),
      deliveryDate: deliveryData?.deliveryDate,
      deliveryTimeFrom: to24Hour(deliveryData?.deliveryTimeFrom),
      deliveryTimeTo: to24Hour(deliveryData?.deliveryTimeTo),
      timeZone,
      clientTimeZone,
      reasonText:
        orderData?.rescheduleData?.reasonText?.trim() || "My plans changed",
      rescheduleType: orderData?.rescheduleData?.rescheduleType || "full",
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
        router.replace(
          `/profile?tab=order-history&bookingId=${payload.bookingId}`
        );
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

  const handleProceedToCheckout = async () => {
    if (cartServiceIds.length > 0) {
      const check = getTurnaroundConflict({
        serviceList,
        serviceIds: cartServiceIds,
        collectionDate: collectionData?.collectionDate,
        deliveryDate: deliveryData?.deliveryDate,
      });
      if (check.conflict) {
        setTurnaroundModal({
          open: true,
          minDeliveryDate: check.minDeliveryDate,
          maxDays: check.maxDays,
          serviceLabels: check.serviceLabels,
        });
        setProceedAfterTurnaroundAccept(true);
        return;
      }
    }
    await finishProceedToCheckout();
  };

  const handleAcceptTurnaroundOnPlaceOrder = () => {
    const update = buildDeliveryUpdateForMinDate(
      slotsDelivery,
      collectionData?.collectionDate,
      collectionData?.collectionTimeTo,
      turnaroundModal.minDeliveryDate,
      parseTimeToMinutes
    );
    if (update) {
      setDeliveryData((prev) => ({ ...prev, ...update }));
    }
    setTurnaroundModal((prev) => ({ ...prev, open: false }));
    if (proceedAfterTurnaroundAccept) {
      setProceedAfterTurnaroundAccept(false);
      void finishProceedToCheckout();
    }
  };

  const handleChangeDeliveryFromTurnaround = () => {
    setTurnaroundModal((prev) => ({ ...prev, open: false }));
    setProceedAfterTurnaroundAccept(false);
    setSheet("Del");
  };

  // Slots come from the pickup address, so the pickers wait for it.
  const hasPickupAddress = Boolean(collectionData?.lat && collectionData?.lng);
  const slotText = (date, from, to) =>
    date && from
      ? `${slotNiceDay(date)} · ${formatTo24HourDisplay(from)} – ${formatTo24HourDisplay(to)}`
      : hasPickupAddress
        ? "Choose a slot"
        : "Add your address first";
  const openSlot = (kind) => {
    if (!hasPickupAddress) {
      addToast({ title: "Add your address first", description: "We show the times available at your address.", color: "warning" });
      const pc = document.getElementById("bkPc");
      pc?.scrollIntoView({ block: "center", behavior: "smooth" });
      pc?.focus({ preventScroll: true });
      return;
    }
    setSheet(kind);
  };

  // Delivery days/times offered in the slot sheet (same rules as before).
  const deliveryDays = (
    collectionData?.collectionDate
      ? slotsDelivery?.filter(
          (item) => item.date >= (minDeliveryForCart || getMinDeliveryDate(collectionData.collectionDate, 0))
        )
      : slotsDelivery
  ) || [];
  const deliveryTimesFor = (date) => {
    const raw = slotsDelivery?.find((s) => s.date === date)?.timeSlots || [];
    return date === collectionData?.collectionDate && collectionData?.collectionTimeTo
      ? raw.filter((s) => parseTimeToMinutes(s?.start) >= parseTimeToMinutes(collectionData.collectionTimeTo))
      : raw;
  };
  const noteIsOpen = noteOpen || Boolean(driverInstruction);
  const growNote = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const continueDisabled =
    isCheckingZone ||
    isRescheduling ||
    isDeliveryBeforeMinimum ||
    isDeliverySameOrBeforeCollection ||
    isSameDayDeliveryBeforeCollection ||
    !collectionData?.collectionDate ||
    !collectionData?.collectionTimeTo ||
    !deliveryData?.deliveryDate ||
    !deliveryData?.deliveryTimeTo ||
    (!isRescheduleFlow && !collectionData?.streetAddress) ||
    !collectionData?.driverInstructionOptions ||
    !deliveryData?.driverInstructionOptions1;

  return (
    <PageShell header="solid">
      {/* Booking form: layout from the prototype (book.html), styled with Tailwind */}
      <div id="jdcBookRoot" className={cx(ROOT, "bg-white")}>
        {step === "new-order" ? (
          <section className="px-jdc-gutter pb-[72px] pt-8 max-[720px]:pb-12 max-[720px]:pt-5">
            <div className="mx-auto max-w-[720px]">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 border-0 bg-none px-0 py-1.5 text-[15px] font-semibold text-jdc-navy hover:text-jdc-blue"
                onClick={() => {
                  dispatch(setPage(true));
                  router.push("/");
                }}
              >
                <FaChevronLeft aria-hidden="true" /> Back
              </button>
              <h1 className="mx-0 mb-0 mt-3.5 font-display text-[clamp(28px,3vw,38px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-jdc-navy">Ready for your next pickup?</h1>
              <p className="mx-0 mb-[26px] mt-2 text-[16px] text-jdc-muted">Start a new order and we&apos;ll collect from your door.</p>
              <button type="button" className="mt-2 flex w-full cursor-pointer items-center gap-[18px] rounded-jdc-lg border border-jdc-line bg-jdc-white p-[22px] text-left transition-[border-color] duration-200 hover:border-jdc-blue" onClick={() => setStep("get-started")}>
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#F1F3F7] text-[#6B7385]">
                  <TbLocation size={26} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 [&>small]:block [&>small]:text-[12.5px] [&>small]:font-bold [&>small]:uppercase [&>small]:tracking-[0.12em] [&>small]:text-jdc-blue [&>span]:mt-0.5 [&>span]:block [&>span]:text-[14.5px] [&>span]:text-jdc-muted [&>strong]:mt-0.5 [&>strong]:block [&>strong]:font-display [&>strong]:text-[22px] [&>strong]:text-jdc-navy">
                  <small>New order</small>
                  <strong>Do my laundry</strong>
                  <span>Choose your address and a one-hour window.</span>
                </span>
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[50%] bg-jdc-blue text-jdc-white" aria-hidden="true">
                  <PiArrowRight size={20} />
                </span>
              </button>
            </div>
          </section>
        ) : step === "get-started" ? (
          <div className="bg-white">
            <div className="mx-auto max-w-[820px] px-8 pb-16 pt-7 max-[1080px]:px-jdc-gutter [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:pb-7 [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:pt-5 [@media(min-width:901px)_and_(max-height:860px)]:pb-5 [@media(min-width:901px)_and_(max-height:860px)]:pt-3 max-[720px]:px-5 max-[720px]:pb-12 max-[720px]:pt-5">
              {/* Back + heading: round ← beside the heading on phones (see TITLE_ROW in booking/ui.js) */}
              <div className={TITLE_ROW}>
                <div className="mb-[18px] flex items-center justify-between gap-4 max-[720px]:mb-0">
                  <a
                    className={cx(
                      "-ml-1 inline-flex items-center gap-1.5 rounded-[10px] pb-1.5 pl-1 pr-2.5 pt-1.5 text-[14.5px] font-semibold text-jdc-navy no-underline hover:bg-jdc-paper",
                      BACK_ROUND
                    )}
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isRescheduleFlow) {
                        router.back();
                        return;
                      }
                      dispatch(setPage(true));
                      router.push("/");
                    }}
                  >
                    <ProtoIcon name="back" size={16} />
                    <span className={BACK_LABEL}>Back</span>
                  </a>
                </div>
                <h1 className="m-0 font-display text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-jdc-navy [@media(min-width:901px)_and_(max-height:860px)]:text-[28px] max-[720px]:text-[28px]">{isRescheduleFlow ? "Reschedule your booking" : "Book your pickup"}</h1>
              </div>
              <p className="mx-0 mb-0 mt-2 text-[16.5px] text-jdc-muted [@media(min-width:901px)_and_(max-height:860px)]:mt-1 [@media(min-width:901px)_and_(max-height:860px)]:text-[15px] max-[720px]:text-[15.5px]">
                {isRescheduleFlow
                  ? "Choose new collection and delivery windows."
                  : "Tell us where to come and when suits you."}
              </p>
              <form
                className="mt-[34px] [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:mt-[26px] [@media(min-width:901px)_and_(max-height:860px)]:mt-4 max-[720px]:mt-[26px] [&>*]:[transition:opacity_0.2s]"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!continueDisabled) handleProceedToCheckout();
                }}
              >
                {!isRescheduleFlow && (
                  <BookAddressFields
                    postcode={collectionData?.postalCode || ""}
                    onPostcodeChange={(next) => setCollectionData((prev) => ({ ...prev, postalCode: next }))}
                    address={collectionData?.streetAddress || ""}
                    savedAddresses={data?.data}
                    onPickAddress={(a) => applyPostcodeAddress(a, "collection")}
                    onPickSaved={(a) => handleUseCurrentLocation(a)}
                    onClearAddress={() =>
                      setCollectionData((prev) => ({ ...prev, streetAddress: "", lat: null, lng: null }))
                    }
                    disabled={isPostcodeDisabled}
                    autoSearch={draftPostcode}
                  />
                )}

                <fieldset className={FIELDSET} data-slot="Col">
                  <legend className={LEGEND}>Collection</legend>
                  <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-[18px] max-[720px]:grid-cols-[minmax(0,1fr)] max-[720px]:gap-3.5">
                    <div className={FIELD}>
                      <label htmlFor="bkColWhen" className={FIELD_LABEL}>Date &amp; time</label>
                      <div className={CTRL}>
                        <span className={CTRL_ICON}>
                          <ProtoIcon name="calendar" size={18} />
                        </span>
                        <button
                          type="button"
                          className={cx(CTRL_INPUT, "cursor-pointer overflow-hidden whitespace-nowrap pr-10 text-left font-semibold text-jdc-navy", !hasPickupAddress && "font-normal text-[#8A93A6]")}
                          id="bkColWhen"
                          aria-haspopup="dialog"
                          disabled={isDeliveryOnlyReschedule}
                          onClick={() => openSlot("Col")}
                        >
                          {slotText(
                            collectionData?.collectionDate,
                            collectionData?.collectionTimeFrom,
                            collectionData?.collectionTimeTo
                          )}
                        </button>
                        <span className={CTRL_CHEV} aria-hidden="true">
                          <ProtoIcon name="chevDown" size={14} />
                        </span>
                      </div>
                    </div>
                    <div className={FIELD}>
                      <label htmlFor="bkColMethod" className={FIELD_LABEL}>Handover</label>
                      <ProtoSelect
                        id="bkColMethod"
                        name="collection_method"
                        options={collection}
                        disabled={isDeliveryOnlyReschedule}
                        value={collectionData?.driverInstructionOptions || ""}
                        onChange={(v) => setCollectionData((prev) => ({ ...prev, driverInstructionOptions: v }))}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className={FIELDSET} data-slot="Del">
                  <legend className={LEGEND}>Delivery</legend>
                  <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-[18px] max-[720px]:grid-cols-[minmax(0,1fr)] max-[720px]:gap-3.5">
                    <div className={FIELD}>
                      <label htmlFor="bkDelWhen" className={FIELD_LABEL}>Date &amp; time</label>
                      <div className={CTRL}>
                        <span className={CTRL_ICON}>
                          <ProtoIcon name="calendar" size={18} />
                        </span>
                        <button
                          type="button"
                          className={cx(CTRL_INPUT, "cursor-pointer overflow-hidden whitespace-nowrap pr-10 text-left font-semibold text-jdc-navy", !hasPickupAddress && "font-normal text-[#8A93A6]")}
                          id="bkDelWhen"
                          aria-haspopup="dialog"
                          onClick={() => openSlot("Del")}
                        >
                          {slotText(deliveryData?.deliveryDate, deliveryData?.deliveryTimeFrom, deliveryData?.deliveryTimeTo)}
                        </button>
                        <span className={CTRL_CHEV} aria-hidden="true">
                          <ProtoIcon name="chevDown" size={14} />
                        </span>
                      </div>
                      {isDeliverySameOrBeforeCollection && (
                        <p role="alert" className="mx-0 mb-0 mt-2 text-[13.5px] text-[#D92D20]">
                          Delivery date must be after collection date.
                        </p>
                      )}
                      {isSameDayDeliveryBeforeCollection && (
                        <p role="alert" className="mx-0 mb-0 mt-2 text-[13.5px] text-[#D92D20]">
                          On the same day, delivery time must be after collection time.
                        </p>
                      )}
                    </div>
                    <div className={FIELD}>
                      <label htmlFor="bkDelMethod" className={FIELD_LABEL}>Handover</label>
                      <ProtoSelect
                        id="bkDelMethod"
                        name="delivery_method"
                        options={delivery}
                        value={deliveryData?.driverInstructionOptions1 || ""}
                        onChange={(v) => setDeliveryData((prev) => ({ ...prev, driverInstructionOptions1: v }))}
                      />
                    </div>
                  </div>
                </fieldset>

                <div className={cx("mt-8 rounded-xl border border-transparent bg-jdc-blue-tint [transition:background_0.2s,border-color_0.2s,box-shadow_0.2s] [@media(min-width:901px)_and_(min-height:861px)_and_(max-height:960px)]:mt-[26px] [@media(min-width:901px)_and_(max-height:860px)]:mt-4 max-[720px]:mt-7", noteIsOpen && "border-jdc-line bg-white focus-within:border-jdc-blue focus-within:[box-shadow:0_0_0_4px_rgba(2,120,254,0.14)]")} id="bkNote">
                  <button
                    type="button"
                    className={cx("flex h-14 w-full cursor-pointer items-center justify-center gap-[9px] rounded-xl border-0 bg-none text-[15px] font-bold text-jdc-blue [@media(min-width:901px)_and_(max-height:860px)]:h-12", noteIsOpen && "hidden")}
                    onClick={() => {
                      setNoteOpen(true);
                      requestAnimationFrame(() => {
                        const ta = document.getElementById("bkNotes");
                        if (ta) {
                          ta.focus();
                          growNote(ta);
                        }
                      });
                    }}
                  >
                    <ProtoIcon name="note" size={16} />
                    Add a note for the driver
                  </button>
                  <textarea
                    className={cx("hidden min-h-[56px] w-full resize-none overflow-hidden border-0 bg-transparent px-[18px] py-4 text-[16px] leading-[1.5] text-jdc-text [outline:none] [@media(min-width:901px)_and_(max-height:860px)]:min-h-[48px] [@media(min-width:901px)_and_(max-height:860px)]:px-4 [@media(min-width:901px)_and_(max-height:860px)]:py-3", noteIsOpen && "block")}
                    id="bkNotes"
                    name="driver_notes"
                    rows={1}
                    placeholder="Gate code, buzzer or drop-off note"
                    aria-label="Note for the driver"
                    value={driverInstruction}
                    ref={(el) => {
                      if (el && noteIsOpen) growNote(el);
                    }}
                    onChange={(e) => {
                      setDriverInstruction(e.target.value);
                      growNote(e.target);
                    }}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setDriverInstruction("");
                        setNoteOpen(false);
                      }
                    }}
                  />
                </div>

                <button className={cx(BTN, BTN_BLOCK, "mt-6 h-[58px] rounded-xl text-[16.5px] [@media(min-width:901px)_and_(max-height:860px)]:mt-3.5 [@media(min-width:901px)_and_(max-height:860px)]:h-[52px]")} type="submit" disabled={continueDisabled}>
                  {isCheckingZone
                    ? "Checking..."
                    : isRescheduling
                      ? "Rescheduling..."
                      : isRescheduleFlow
                        ? "Reschedule"
                        : "Continue"}
                  <ProtoIcon name="arrow" size={18} />
                </button>
                {!isRescheduleFlow ? (
                  <p className="mx-0 mb-0 mt-3.5 flex items-center justify-center gap-2 text-[13.5px] text-jdc-muted [@media(min-width:901px)_and_(max-height:860px)]:mt-2.5 [&>svg]:flex-none [&>svg]:text-[#8A93A6] [&>svg]:transition-colors [&>svg]:duration-200">
                    <ProtoIcon name="shield" size={15} />
                    <span>No charge to book &mdash; we will confirm your slot by text.</span>
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        ) : (
          <MiniLoader />
        )}

        <SlotSheet
          open={sheet === "Col"}
          loading={slotsLoading}
          title="Collection slot"
          days={slots || []}
          timesFor={(date) => slots?.find((s) => s.date === date)?.timeSlots || []}
          value={{ date: collectionData?.collectionDate, start: collectionData?.collectionTimeFrom }}
          fmt={formatTo24HourDisplay}
          onClose={() => setSheet("")}
          onConfirm={(day, slot) => {
            setCollectionData((prev) => ({
              ...prev,
              collectionDate: day?.date,
              availableTimeSlots: day?.timeSlots || [],
              collectionTimeFrom: slot?.start,
              collectionTimeTo: slot?.end,
            }));
            setSheet("");
          }}
        />
        <SlotSheet
          open={sheet === "Del"}
          loading={slotsLoading}
          title="Delivery slot"
          days={deliveryDays}
          timesFor={deliveryTimesFor}
          value={{ date: deliveryData?.deliveryDate, start: deliveryData?.deliveryTimeFrom }}
          fmt={formatTo24HourDisplay}
          onClose={() => setSheet("")}
          onConfirm={(day, slot) => {
            setDeliveryData((prev) => ({
              ...prev,
              deliveryDate: day?.date,
              availableTimeSlots: day?.timeSlots || [],
              deliveryTimeFrom: slot?.start,
              deliveryTimeTo: slot?.end,
            }));
            setSheet("");
          }}
        />
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
              <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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

              <div className="w-full px-6 py-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto modal-scroll">
                {renderModalAddressSearch()}

                <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-center gap-5">
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
                      We'll use your location to find your address
                    </p>
                  </div>
                </div>

                {data?.data &&
                  data?.data?.map((add) => {
                    return (
                      <div key={add?.id} className="flex items-center gap-5">
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
            </div>
          ) : modal?.modType === "collection-date" ? (
            <div
              onScroll={handleModalScroll}
              className="max-h-[95vh] overflow-y-auto modal-scroll"
            >
              <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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
                <SlotTimezoneBanner
                  operational={slotsOperational}
                  clientLocal={slotsClientLocal}
                />
                {slotsLoading && !slots?.length ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : null}
                {!slotsLoading && !slots?.length ? (
                  <p className="font-sf text-sm text-theme-psGray pb-4">
                    Select a pickup address to see available collection times.
                  </p>
                ) : null}
                <div className="space-y-5">
                  <h6 className="font-sf text-xl font-medium">
                    {formatSlotMonthYear(
                      collectionData?.collectionDate || slots?.[0]?.date
                    )}
                  </h6>

                  <div className="flex gap-5 items-center font-sf overflow-x-auto pb-2 -mx-1 px-1 flex-nowrap [scrollbar-width:thin]">
                    {slots?.map((item, idx) => {
                      return (
                        <div
                          key={item?.date ?? idx}
                          className="flex flex-col items-center justify-center shrink-0"
                        >
                          <div
                            onClick={() => {
                              const firstSlot = item?.timeSlots?.[0];
                              setCollectionData({
                                ...collectionData,
                                collectionDate: item?.date,
                                availableTimeSlots: item?.timeSlots,
                                collectionTimeFrom:
                                  firstSlot?.start || collectionData?.collectionTimeFrom,
                                collectionTimeTo:
                                  firstSlot?.end || collectionData?.collectionTimeTo,
                              });
                            }}
                            className={`text-2xl font-semibold size-14 rounded-full shrink-0 flex items-center justify-center ${collectionData?.collectionDate === item?.date
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
                  {(collectionData?.availableTimeSlots?.length > 0
                    ? collectionData.availableTimeSlots
                    : slots?.find((slot) => slot.date === collectionData?.collectionDate)?.timeSlots || []
                  )?.map((item, idx) => {
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
                        className={`w-full min-h-14 px-5 py-2 flex flex-col justify-center rounded-full shrink-0 font-sf font-semibold text-2xl ${collectionData?.collectionTimeFrom === item?.start
                          ? "bg-theme-blue text-white"
                          : "bg-theme-gray"
                          }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span>{formatTo24HourDisplay(item?.start)}</span>
                          <span>{formatTo24HourDisplay(item?.end)}</span>
                        </div>
                        {item?.local ? (
                          <p
                            className={`text-xs font-normal mt-0.5 ${collectionData?.collectionTimeFrom === item?.start
                              ? "text-white/90"
                              : "text-theme-psGray"
                              }`}
                          >
                            Your time: {formatTo24HourDisplay(item.local.start12h)}{" "}
                            – {formatTo24HourDisplay(item.local.end12h)}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : modal?.modType === "collection-location" ? (
            <div className="">
              <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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

              <div className="w-full px-6 py-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto modal-scroll">
                {renderModalAddressSearch()}

                <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-5">
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
                      We'll use your location to find your address
                    </p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          ) : modal?.modType === "delivery-date" ? (
            <div
              onScroll={handleModalScroll}
              className="max-h-[95vh] overflow-y-auto modal-scroll"
            >
              <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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
                <SlotTimezoneBanner
                  operational={slotsOperational}
                  clientLocal={slotsClientLocal}
                />
                {slotsLoading && !slotsDelivery?.length ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : null}
                <div className="space-y-5">
                  <h6 className="font-sf text-xl font-medium">
                    {formatSlotMonthYear(
                      deliveryData?.deliveryDate ||
                        slotsDelivery?.find(
                          (s) => s.date > collectionData.collectionDate
                        )?.date ||
                        slotsDelivery?.[0]?.date
                    )}
                  </h6>

                  <div className="flex gap-5 items-center font-sf overflow-x-auto pb-2 -mx-1 px-1 flex-nowrap [scrollbar-width:thin]">
                    <div className="flex gap-5 items-center font-sf flex-nowrap">
                      {(collectionData?.collectionDate
                        ? slotsDelivery?.filter((item) => {
                            const minStr =
                              minDeliveryForCart ||
                              getMinDeliveryDate(
                                collectionData.collectionDate,
                                0
                              );
                            return item.date >= minStr;
                          })
                        : slotsDelivery
                      )?.map((item, idx) => {
                        return (
                          <div
                            key={item?.date ?? idx}
                            className="flex flex-col items-center justify-center shrink-0"
                          >
                            <div
                              onClick={() => {
                                const rawSlots = item?.timeSlots || [];
                                const candidateSlots =
                                  item?.date === collectionData?.collectionDate &&
                                  collectionData?.collectionTimeTo
                                    ? rawSlots.filter(
                                        (slot) =>
                                          parseTimeToMinutes(slot?.start) >=
                                          parseTimeToMinutes(collectionData.collectionTimeTo)
                                      )
                                    : rawSlots;
                                const firstSlot =
                                  candidateSlots?.[0] || rawSlots?.[0];
                                setDeliveryData({
                                  ...deliveryData,
                                  deliveryDate: item?.date,
                                  availableTimeSlots: item?.timeSlots,
                                  deliveryTimeFrom:
                                    firstSlot?.start || deliveryData?.deliveryTimeFrom,
                                  deliveryTimeTo:
                                    firstSlot?.end || deliveryData?.deliveryTimeTo,
                                });
                              }}
                              className={`text-2xl font-semibold size-14 rounded-full shrink-0 flex items-center justify-center ${deliveryData?.deliveryDate === item?.date
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
                  {(() => {
                    const rawSlots =
                      deliveryData?.availableTimeSlots?.length > 0
                        ? deliveryData.availableTimeSlots
                        : slotsDelivery?.find((slot) => slot.date === deliveryData?.deliveryDate)?.timeSlots || [];
                    const isSameDay =
                      deliveryData?.deliveryDate === collectionData?.collectionDate &&
                      !!collectionData?.collectionTimeTo;
                    const slots =
                      isSameDay && collectionData?.collectionTimeTo
                        ? rawSlots.filter(
                            (item) =>
                              parseTimeToMinutes(item?.start) >=
                              parseTimeToMinutes(collectionData.collectionTimeTo)
                          )
                        : rawSlots;
                    return slots?.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setDeliveryData({
                            ...deliveryData,
                            deliveryTimeFrom: item?.start,
                            deliveryTimeTo: item?.end,
                          });
                        }}
                        className={`w-full min-h-14 px-5 py-2 flex flex-col justify-center rounded-full shrink-0 font-sf font-semibold text-2xl ${deliveryData?.deliveryTimeFrom === item?.start
                          ? "bg-theme-blue text-white"
                          : "bg-theme-gray"
                          }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span>{formatTo24HourDisplay(item?.start)}</span>
                          <span>{formatTo24HourDisplay(item?.end)}</span>
                        </div>
                        {item?.local ? (
                          <p
                            className={`text-xs font-normal mt-0.5 ${deliveryData?.deliveryTimeFrom === item?.start
                              ? "text-white/90"
                              : "text-theme-psGray"
                              }`}
                          >
                            Your time: {formatTo24HourDisplay(item.local.start12h)}{" "}
                            – {formatTo24HourDisplay(item.local.end12h)}
                          </p>
                        ) : null}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          ) : modal?.modType === "delivery-location" ? (
            <div className="">
              <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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

              <div className="w-full px-6 py-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto modal-scroll">
                {renderModalAddressSearch()}

                <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-5">
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
                      We'll use your location to find your address
                    </p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          ) : modal?.modType === "driver" ? (
            <div className="">
              <div className="h-[58px] flex items-center justify-center relative border-b border-jdc-line">
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

        <ReusableModal
          isOpen={turnaroundModal.open}
          onOpenChange={(open) => {
            if (!open) {
              setTurnaroundModal((prev) => ({ ...prev, open: false }));
              setProceedAfterTurnaroundAccept(false);
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
                onClick={handleAcceptTurnaroundOnPlaceOrder}
              />
              <ButtonYouth70018
                size="compact"
                variant="outline"
                text="Change delivery date"
                onClick={handleChangeDeliveryFromTurnaround}
              />
            </div>
          }
        >
          <div className="px-6 py-4 font-sf text-base text-theme-psGray space-y-3">
            <p>
              Your selected services need more time
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
              Earliest delivery:{" "}
              <span className="font-semibold text-gray-900">
                {formatIsoDateLong(turnaroundModal.minDeliveryDate)}
              </span>
            </p>
          </div>
        </ReusableModal>

        <ReusableModal
          isOpen={isFailedAttemptModalOpen}
          onOpenChange={(open) => {
            if (!open) markFailedAttemptsSeen();
            onFailedAttemptModalOpenChange(open);
          }}
          showHeader
          headerTitle="Action Required"
          modalScroll={modalScroll}
          onClose={closeFailedAttemptModal}
          isDismissable
          backdrop="blur"
          size="sm"
        >
          <div
            onScroll={handleModalScroll}
            className="max-h-[85vh] overflow-y-auto modal-scroll"
          >
            <div className="space-y-5 px-6 pb-6 pt-8 font-body max-[720px]:px-5">
              {/* Header: neutral, like the prototype's On hold screens */}
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="mb-1 flex size-[52px] items-center justify-center rounded-[14px] bg-[#F1F3F7] text-jdc-navy">
                  <ProtoIcon name="ntWarn" size={24} />
                </span>
                <h3 className="m-0 font-display text-[22px] font-bold text-jdc-navy">Action required</h3>
                <p className="m-0 text-[15px] text-jdc-muted">
                  {failedAttemptBookings.length === 1
                    ? "One of your orders needs a new time."
                    : `${failedAttemptBookings.length} of your orders need a new time.`}
                </p>
              </div>

              {/* Orders */}
              <div className="overflow-hidden rounded-2xl border border-jdc-line bg-white">
                {failedAttemptBookings.map(({ order, attemptType }) => (
                  <div key={order.id} className="flex items-center gap-3 border-b border-jdc-line px-4 py-3.5 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <b className="block text-[14.5px] text-jdc-navy">#{order.orderTrackId || order.id}</b>
                      <small className="mt-0.5 block text-[13px] leading-[1.45] text-jdc-muted">
                        {attemptType === "delivery"
                          ? "We couldn’t deliver your laundry. Please choose a new delivery time."
                          : "We couldn’t collect your laundry. Please choose a new collection time."}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="h-9 flex-none cursor-pointer rounded-jdc-pill border border-jdc-line bg-white px-3.5 text-[13.5px] font-bold text-jdc-navy hover:border-[#C5CEDD] hover:bg-jdc-paper"
                      onClick={() => goToFailedAttemptOrder(order.id)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>

              <ButtonYouth70018 size="compact" text="Got it" onClick={closeFailedAttemptModal} />
            </div>
          </div>
        </ReusableModal>
    </PageShell>
  );
}
