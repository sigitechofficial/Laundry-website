"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import InputHeroUi from "../../../components/InputHeroUi";
import { ButtonYouth70018 } from "../../../components/Buttons";
import { PiArrowRight } from "react-icons/pi";
import SelectHero from "../../../components/SelectHero";
import { FaPlus } from "react-icons/fa6";
import { FaChevronLeft } from "react-icons/fa";
import ReusableModal from "../../../components/Modal";
import { Spinner, addToast, useDisclosure } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { TbLocation } from "react-icons/tb";
import { useRouter } from "next/navigation";
import {
  fetchBookingSlots,
  fetchZoneForCoordinates,
} from "../../../utilities/bookingSlotsApi";
import { useLiveClock } from "../../../utilities/useLiveClock";
import { useDispatch, useSelector } from "react-redux";
import { setOrderData, setPage } from "../store/slices/cartItemSlice";
import {
  useGetAllAddressQuery,
  useGetServicesQuery,
  useGetAllOrdersQuery,
} from "../store/services/api";
import { getFailedAttemptBookings } from "../../../utilities/bookingAttemptStatus";
import {
  buildDeliveryUpdateForMinDate,
  formatIsoDateLong,
  getMinDeliveryDate,
  getMaxTurnaroundDays,
  getTurnaroundConflict,
} from "../../../utilities/turnaroundTime";
import Link from "next/link";
import Header from "../../../components/Header";
import HomeClientWrapper from "../../../utilities/Test";
import { MiniLoader } from "../../../components/Loader";
import { BASE_URL } from "../../../utilities/URL";
import PostcodeAddressLookup from "../../../components/PostcodeAddressLookup";
import AddressFilterLookup from "../../../components/AddressFilterLookup";
import { mapPostcodeAddressToFormFields } from "../../../utilities/postcodeLookup";

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

export default function orderRegistration() {
  const router = useRouter();
  const orderData = useSelector((state) => state.cart.orderData);
  const preferencesData = useSelector((state) => state.cart.preferences) || [];
  const { data: servicesApiData } = useGetServicesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const isRescheduleFlow = Boolean(orderData?.rescheduleData?.isReschedule);
  const state = history.state?.customData?.step || null;
  const dispatch = useDispatch();
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
  });
  const failedAttemptBookings = useMemo(
    () => getFailedAttemptBookings(ordersData?.data),
    [ordersData]
  );

  useEffect(() => {
    if (failedAttemptModalShown) return;
    if (failedAttemptBookings.length === 0) return;
    setFailedAttemptModalShown(true);
    onFailedAttemptModalOpen();
  }, [failedAttemptBookings, failedAttemptModalShown, onFailedAttemptModalOpen]);

  const goToFailedAttemptOrder = (bookingId) => {
    onFailedAttemptModalClose();
    router.push(`/profile?tab=order-history&bookingId=${bookingId}`);
  };

  const [step, setStep] = useState(state ?? "get-started");
  const [isCheckingZone, setIsCheckingZone] = useState(false);
  const [modal, setModal] = useState({
    modType: "",
  });
  const [modalScroll, setModalScroll] = useState(false);
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
  const formatIsoDateAsDdMmYy = (isoDate) => {
    if (!isoDate || typeof isoDate !== "string") return "";
    const parts = isoDate.split("-");
    if (parts.length < 3) return "";
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return "";
    const yy = String(y).slice(-2);
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${yy}`;
  };

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
    const ensureGuestSession = async () => {
      if (typeof window === "undefined") return;
      if (localStorage.getItem("accessToken")) return;

      try {
        const response = await fetch(`${BASE_URL}customer/guest/start`, {
          method: "POST",
          credentials: "include",
        });
        const json = await response.json();
        if (json?.data?.accessToken) {
          localStorage.setItem("accessToken", json.data.accessToken);
        }
      } catch {
        // Guest session optional; logged-in users still work.
      }
    };

    void ensureGuestSession();
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
      setModal({ modType: "delivery-date" });
      onOpen();
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
    setStep("");
    onClose();
    router.push("/checkout/order");
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
    setModal({ modType: "delivery-date" });
    onOpen();
  };

  return (
    <HomeClientWrapper>
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
              <div className="w-full h-screen flex justify-center lg:items-center overflow-auto px-8 py-10 sm:py-16 lg:py-20 relative">
                {/* Back Button - Desktop Only */}
                <button
                  onClick={() => {
                    dispatch(setPage(true));
                    router.push("/");
                  }}
                  className="hidden lg:flex absolute top-8 left-8 items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm z-10"
                  aria-label="Go back"
                >
                  <FaChevronLeft className="text-theme-blue text-lg" />
                </button>

                <div className="w-full max-w-[565px] mx-auto h-[84vh  ]">
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
              <div className="w-full h-screen flex justify-center 2xl:items-center overflow-auto px-5 sm:px-8 py-10 sm:py-16 md:py-20  relative">
                {/* Back Button - Desktop Only */}
                <button
                  onClick={() => setStep("new-order")}
                  className="hidden lg:flex absolute top-8 left-8 items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm z-10"
                  aria-label="Go back"
                >
                  <FaChevronLeft className="text-theme-blue text-lg" />
                </button>

                <div className="w-full max-w-[565px] mx-auto h-[86vh]">
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
                    {/* Mobile Back Button and Heading in Row */}
                    <div className="md:hidden flex items-center gap-4 mb-4">
                      <button
                        onClick={() => setStep("new-order")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm shrink-0"
                        aria-label="Go back"
                      >
                        <FaChevronLeft className="text-theme-blue text-lg" />
                      </button>
                      <h4 className="font-youth font-bold text-[32px]">
                        Let's get Started
                      </h4>
                    </div>
                    <h4 className="font-youth font-bold text-[32px] text-center max-md:hidden">
                      Let's get Started
                    </h4>
                    {!isRescheduleFlow && (
                      <PostcodeAddressLookup
                        value={collectionData?.postalCode || ""}
                        disabled={isPostcodeDisabled}
                        onChange={(next) =>
                          setCollectionData((prev) => ({
                            ...prev,
                            postalCode: next,
                          }))
                        }
                        onPostcodeSelected={() => {
                          setModal((prev) => ({ ...prev, modType: "address" }));
                          onOpen();
                        }}
                      />
                    )}
                    <div
                      className={`relative z-0 ${
                        isRescheduleFlow ? "pointer-events-none opacity-80" : ""
                      }`}
                      onClick={() => {
                        if (isRescheduleFlow) return;
                        setModal({ ...modal, modType: "address" });
                        onOpen();
                      }}
                    >
                      <InputHeroUi
                        type="text"
                        label="Address"
                        value={collectionData?.streetAddress}
                        isDisabled={isRescheduleFlow}
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
                        value={formatIsoDateAsDdMmYy(collectionData?.collectionDate)}
                        endContent={
                          <span className="whitespace-nowrap">
                            {collectionData?.collectionTimeFrom
                              ? `${formatTo24HourDisplay(
                                  collectionData?.collectionTimeFrom
                                )} - ${formatTo24HourDisplay(
                                  collectionData?.collectionTimeTo
                                )}`
                              : ""}
                          </span>
                        }
                      />
                    </div>
                    <SelectHero
                      label="Select collection method"
                      list={collection}
                      value={[collectionData?.driverInstructionOptions]}
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
                        value={formatIsoDateAsDdMmYy(deliveryData?.deliveryDate)}
                        endContent={
                          <span className="whitespace-nowrap">
                            {deliveryData?.deliveryTimeFrom
                              ? `${formatTo24HourDisplay(
                                  deliveryData?.deliveryTimeFrom
                                )} - ${formatTo24HourDisplay(
                                  deliveryData?.deliveryTimeTo
                                )}`
                              : ""}
                          </span>
                        }
                      />
                      {isDeliverySameOrBeforeCollection && (
                        <p className="font-sf text-sm text-red-600 mt-1">
                          Delivery date must be after collection date.
                        </p>
                      )}
                      {isSameDayDeliveryBeforeCollection && (
                        <p className="font-sf text-sm text-red-600 mt-1">
                          On the same day, delivery time must be after collection time.
                        </p>
                      )}
                    </div>
                    <SelectHero
                      label="Select delivery method"
                      list={delivery}
                      value={deliveryData?.driverInstructionOptions1 ? [deliveryData?.driverInstructionOptions1] : []}
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
                        text={isCheckingZone ? "Checking..." : "Continue"}
                        isDisabled={
                          isCheckingZone ||
                          isDeliveryBeforeMinimum ||
                          isDeliverySameOrBeforeCollection ||
                          isSameDayDeliveryBeforeCollection ||
                          !collectionData?.collectionDate ||
                          !collectionData?.collectionTimeTo ||
                          !deliveryData?.deliveryDate ||
                          !deliveryData?.deliveryTimeTo ||
                          (!isRescheduleFlow && !collectionData?.streetAddress) ||
                          !collectionData?.driverInstructionOptions ||
                          !deliveryData?.driverInstructionOptions1
                        }
                        onClick={handleProceedToCheckout}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <MiniLoader />
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
                      Fomino will use your location
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
                      Fomino will use your location
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
                      Fomino will use your location
                    </p>
                  </div>
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
          onOpenChange={onFailedAttemptModalOpenChange}
          showHeader
          headerTitle="Action needed on your order"
          onClose={onFailedAttemptModalClose}
        >
          <div className="px-6 py-6 space-y-4">
            {failedAttemptBookings.map(({ order, attemptType }) => (
              <div
                key={order.id}
                className="rounded-xl border border-theme-gray p-4 space-y-2"
              >
                <p className="font-sf text-sm text-theme-psGray">
                  Order{" "}
                  <span className="font-semibold text-black">
                    #{order.orderTrackId || order.id}
                  </span>
                </p>
                <p className="font-sf text-base text-black">
                  {attemptType === "delivery"
                    ? "We were unable to deliver your laundry. Please reschedule your delivery slot."
                    : "Our driver was unable to collect your laundry. Please reschedule your collection slot."}
                </p>
                <ButtonYouth70018
                  size="compact"
                  text="View order"
                  onClick={() => goToFailedAttemptOrder(order.id)}
                />
              </div>
            ))}
          </div>
        </ReusableModal>
</HomeClientWrapper>
  );
}
