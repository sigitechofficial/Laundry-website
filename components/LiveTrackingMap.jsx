"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Spinner } from "@heroui/react";
import { MdMyLocation, MdZoomOutMap } from "react-icons/md";
import { useLazyGetLiveTrackingQuery } from "@/app/store/services/api";
import { decodePolyline } from "../utilities/decodePolyline";
import {
  getLiveTrackingDatabase,
  signInForLiveTracking,
  ref,
  onValue,
} from "../utilities/liveTrackingFirebase";

const LONDON = { lat: 51.5074, lng: -0.1278 };
const ROUTE_COLOR = "#0F766E";
const STALE_AFTER_MS = 40_000;
const TOKEN_REFRESH_MS = 45 * 60 * 1000;
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

function bannerForReason(reason) {
  switch (reason) {
    case "driver_arrived":
      return "Your driver has arrived";
    case "cancelled":
      return "This order was cancelled";
    case "on_hold":
      return "This order is on hold";
    case "delivery_failed":
      return "Delivery attempt failed — please reschedule";
    case "not_in_transit":
    default:
      return "Live tracking is available once your driver is on the way.";
  }
}

function buildAgentIcon() {
  if (typeof window === "undefined" || !window.google?.maps) return undefined;
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <ellipse cx="28" cy="40" rx="14" ry="6" fill="rgba(0,0,0,0.18)"/>
      <circle cx="28" cy="26" r="18" fill="white"/>
      <circle cx="28" cy="26" r="15" fill="#000099"/>
      <rect x="20" y="18" width="16" height="18" rx="3" fill="#0F766E"/>
      <rect x="22" y="20" width="12" height="6" rx="1" fill="#E0F2F1"/>
      <circle cx="23" cy="38" r="2.5" fill="#111827"/>
      <circle cx="33" cy="38" r="2.5" fill="#111827"/>
    </svg>
  `);
  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new window.google.maps.Size(56, 56),
    anchor: new window.google.maps.Point(28, 28),
  };
}

export default function LiveTrackingMap({ bookingId, orderTrackId, onClose }) {
  const [fetchLiveTracking] = useLazyGetLiveTrackingQuery();
  const mapRef = useRef(null);
  const unsubsRef = useRef([]);
  const staleTimerRef = useRef(null);
  const tokenTimerRef = useRef(null);
  const followAgentRef = useRef(true);
  const lastLocationAtRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leg, setLeg] = useState("");
  const [agentName, setAgentName] = useState("Your driver");
  const [etaText, setEtaText] = useState("");
  const [distanceText, setDistanceText] = useState("");
  const [banner, setBanner] = useState("Connecting to live tracking…");
  const [isStale, setIsStale] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [destination, setDestination] = useState(null);
  const [agentPos, setAgentPos] = useState(null);
  const [agentHeading, setAgentHeading] = useState(0);
  const [path, setPath] = useState([]);
  const [agentIcon, setAgentIcon] = useState(undefined);

  const updateStatusBanner = useCallback(
    (nextActive, nextEnabled, nextLeg, nextStale, preserve) => {
      if (!nextActive && !nextEnabled) {
        if (
          preserve &&
          (preserve.includes("arrived") ||
            preserve.includes("ended") ||
            preserve.includes("cancelled") ||
            preserve.includes("on hold") ||
            preserve.includes("failed"))
        ) {
          return preserve;
        }
        return "Live tracking ended";
      }
      if (nextStale) return "Waiting for driver location…";
      if (nextLeg === "delivery") {
        return "Driver is on the way with your laundry";
      }
      return "Driver is on the way to collect your laundry";
    },
    []
  );

  const checkStale = useCallback(() => {
    const last = lastLocationAtRef.current;
    const stale =
      !last || Date.now() - last.getTime() > STALE_AFTER_MS
        ? Boolean(isEnabled || isActive)
        : false;
    setIsStale(stale);
    setBanner((prev) =>
      updateStatusBanner(isActive, isEnabled, leg, stale, prev)
    );
  }, [isActive, isEnabled, leg, updateStatusBanner]);

  const applyLocation = useCallback((raw) => {
    const lat = Number(raw?.lat);
    const lng = Number(raw?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setAgentPos({ lat, lng });
    const heading = Number(raw?.heading);
    if (Number.isFinite(heading)) setAgentHeading(heading);
    const updatedAt = Number(raw?.updatedAt);
    lastLocationAtRef.current = Number.isFinite(updatedAt)
      ? new Date(updatedAt)
      : new Date();
  }, []);

  const applyRoute = useCallback((raw) => {
    setEtaText(raw?.etaText ? String(raw.etaText) : "");
    setDistanceText(raw?.distanceText ? String(raw.distanceText) : "");
    const encoded = raw?.encodedPolyline ? String(raw.encodedPolyline) : "";
    if (!encoded) return;
    const points = decodePolyline(encoded);
    if (points.length) setPath(points);
  }, []);

  const fitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    if (agentPos && destination) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(agentPos);
      bounds.extend(destination);
      map.fitBounds(bounds, 72);
      return;
    }
    const target = agentPos || destination;
    if (target) {
      map.panTo(target);
      map.setZoom(14.5);
    }
  }, [agentPos, destination]);

  const recenterOnAgent = useCallback(() => {
    followAgentRef.current = true;
    if (!agentPos || !mapRef.current) return;
    mapRef.current.panTo(agentPos);
    mapRef.current.setZoom(15);
    if (Number.isFinite(agentHeading)) {
      mapRef.current.setHeading?.(agentHeading);
    }
  }, [agentPos, agentHeading]);

  const cleanupListeners = useCallback(() => {
    unsubsRef.current.forEach((fn) => {
      try {
        fn();
      } catch (_) {}
    });
    unsubsRef.current = [];
    if (staleTimerRef.current) {
      clearInterval(staleTimerRef.current);
      staleTimerRef.current = null;
    }
    if (tokenTimerRef.current) {
      clearInterval(tokenTimerRef.current);
      tokenTimerRef.current = null;
    }
  }, []);

  const subscribeRtdb = useCallback(
    (databaseURL, rtdbPath) => {
      const db = getLiveTrackingDatabase(databaseURL);
      const root = ref(db, rtdbPath);

      const locationRef = ref(db, `${rtdbPath}/location`);
      const metaRef = ref(db, `${rtdbPath}/meta`);
      const routeRef = ref(db, `${rtdbPath}/route`);

      unsubsRef.current.push(
        onValue(locationRef, (snap) => {
          const val = snap.val();
          if (val && typeof val === "object") {
            applyLocation(val);
          }
        })
      );
      unsubsRef.current.push(
        onValue(metaRef, (snap) => {
          const val = snap.val();
          if (!val || typeof val !== "object") return;
          const nextActive = val.active === true;
          setIsActive((was) => {
            if (was && !nextActive) {
              setBanner("Your driver has arrived / trip ended");
              if (staleTimerRef.current) {
                clearInterval(staleTimerRef.current);
                staleTimerRef.current = null;
              }
            }
            return nextActive;
          });
          setIsEnabled(nextActive);
          if (val.leg) setLeg(String(val.leg));
          if (val.agent?.name) setAgentName(String(val.agent.name));
          const dest = val.destination;
          if (dest) {
            const lat = Number(dest.lat);
            const lng = Number(dest.lng);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setDestination({ lat, lng });
            }
          }
        })
      );
      unsubsRef.current.push(
        onValue(routeRef, (snap) => {
          const val = snap.val();
          if (val && typeof val === "object") applyRoute(val);
        })
      );
      void root;
    },
    [applyLocation, applyRoute]
  );

  const refreshToken = useCallback(async () => {
    try {
      const result = await fetchLiveTracking(bookingId).unwrap();
      const data = result?.data ?? result;
      const token = data?.firebaseAuthToken;
      if (token) await signInForLiveTracking(token);
    } catch (_) {}
  }, [bookingId, fetchLiveTracking]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError("");
    cleanupListeners();
    try {
      const result = await fetchLiveTracking(bookingId).unwrap();
      const data = result?.data ?? result;
      if (!data || typeof data !== "object") {
        throw new Error("Invalid tracking payload");
      }

      setIsEnabled(data.enabled === true);
      setIsActive(data.active === true);
      setLeg(data.leg ? String(data.leg) : "");

      const dest = data.destination;
      if (dest) {
        const lat = Number(dest.lat);
        const lng = Number(dest.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setDestination({ lat, lng });
        }
      }

      if (data.agent?.name) setAgentName(String(data.agent.name));
      else setAgentName("Your driver");

      if (data.location) applyLocation(data.location);
      if (data.route) applyRoute(data.route);

      const reason = data.reason ? String(data.reason) : null;
      const token = data.firebaseAuthToken
        ? String(data.firebaseAuthToken)
        : null;
      const databaseURL = data.databaseURL ? String(data.databaseURL) : null;
      const rtdbPath = data.rtdbPath ? String(data.rtdbPath) : null;

      const canSubscribe =
        Boolean(token) &&
        Boolean(databaseURL) &&
        Boolean(rtdbPath) &&
        (data.enabled === true ||
          data.active === true ||
          reason === "driver_arrived");

      if (!canSubscribe) {
        setBanner(bannerForReason(reason));
        return;
      }

      await signInForLiveTracking(token);
      setBanner(
        updateStatusBanner(
          data.active === true,
          data.enabled === true,
          data.leg ? String(data.leg) : "",
          false,
          null
        )
      );
      subscribeRtdb(databaseURL, rtdbPath);

      tokenTimerRef.current = setInterval(() => {
        void refreshToken();
      }, TOKEN_REFRESH_MS);

      staleTimerRef.current = setInterval(() => {
        const last = lastLocationAtRef.current;
        const enabled = data.enabled === true;
        const active = data.active === true;
        const stale = !last
          ? enabled || active
          : Date.now() - last.getTime() > STALE_AFTER_MS;
        setIsStale(stale);
        setBanner((prev) =>
          updateStatusBanner(
            active,
            enabled,
            data.leg ? String(data.leg) : "",
            stale,
            prev
          )
        );
      }, 5000);
    } catch (e) {
      const status = e?.status || e?.originalStatus;
      if (status === 403) {
        setError("You do not have access to track this order");
      } else if (status === 503) {
        setError("Live tracking is temporarily unavailable");
      } else {
        setError(e?.data?.message || e?.message || "Unable to start live tracking");
      }
    } finally {
      setLoading(false);
    }
  }, [
    bookingId,
    fetchLiveTracking,
    cleanupListeners,
    applyLocation,
    applyRoute,
    subscribeRtdb,
    refreshToken,
    updateStatusBanner,
  ]);

  useEffect(() => {
    if (!bookingId) return;
    void bootstrap();
    return () => cleanupListeners();
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (agentPos && followAgentRef.current && mapRef.current) {
      mapRef.current.panTo(agentPos);
    }
  }, [agentPos]);

  useEffect(() => {
    checkStale();
  }, [agentPos, checkStale]);

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      setAgentIcon(buildAgentIcon());
      // Slight delay so markers exist before fit
      setTimeout(() => fitBounds(), 200);
    },
    [fitBounds]
  );

  const initialCenter = useMemo(
    () => agentPos || destination || LONDON,
    // Only for first paint — GoogleMap ignores later center changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const etaLine = [etaText && `ETA ${etaText}`, distanceText]
    .filter(Boolean)
    .join(" · ");

  if (loading) {
    return (
      <div className="w-full h-[70vh] min-h-[420px] flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[70vh] min-h-[420px] flex flex-col items-center justify-center px-8 text-center bg-white">
        <MdZoomOutMap size={48} className="text-gray-300 mb-4" />
        <h4 className="font-youth font-bold text-xl text-gray-900">
          Tracking unavailable
        </h4>
        <p className="font-sf text-sm text-gray-500 mt-2 max-w-sm">{error}</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-theme-blue font-sf font-semibold underline"
          >
            Close
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[75vh] min-h-[480px] bg-white">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={initialCenter}
        zoom={14}
        onLoad={onMapLoad}
        onDragStart={() => {
          followAgentRef.current = false;
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        {destination ? (
          <Marker
            position={destination}
            title={leg === "delivery" ? "Delivery" : "Pickup"}
            icon={
              typeof window !== "undefined" && window.google?.maps
                ? {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#2563EB",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2,
                  }
                : undefined
            }
          />
        ) : null}
        {agentPos ? (
          <Marker
            position={agentPos}
            title={agentName}
            icon={agentIcon}
            options={{
              flat: true,
              rotation: agentHeading || 0,
              zIndex: 2,
            }}
          />
        ) : null}
        {path.length > 1 ? (
          <Polyline
            path={path}
            options={{
              strokeColor: ROUTE_COLOR,
              strokeOpacity: 1,
              strokeWeight: 5,
            }}
          />
        ) : null}
      </GoogleMap>

      <div className="absolute right-4 bottom-[210px] flex flex-col gap-2.5 z-10">
        <button
          type="button"
          onClick={recenterOnAgent}
          className="w-11 h-11 rounded-xl bg-white shadow flex items-center justify-center text-theme-blue"
          aria-label="Recenter on driver"
        >
          <MdMyLocation size={22} />
        </button>
        <button
          type="button"
          onClick={fitBounds}
          className="w-11 h-11 rounded-xl bg-white shadow flex items-center justify-center text-theme-blue"
          aria-label="Fit route"
        >
          <MdZoomOutMap size={22} />
        </button>
      </div>

      <div className="absolute left-0 right-0 bottom-0 z-10 bg-white rounded-t-[20px] shadow-[0_-4px_16px_rgba(0,0,0,0.1)] px-5 pt-4 pb-7">
        <div className="w-10 h-1 rounded bg-gray-200 mx-auto mb-3.5" />
        <h4 className="font-youth font-bold text-lg text-gray-900">
          Order #{orderTrackId || bookingId}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isStale ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          <p className="font-sf text-sm text-gray-900 font-medium">{banner}</p>
        </div>
        {etaLine ? (
          <p className="font-sf font-semibold text-[15px] text-[#0F766E] mt-2.5">
            {etaLine}
          </p>
        ) : null}
        <div className="mt-3 rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-theme-blue/10 flex items-center justify-center text-theme-blue font-semibold">
            {(agentName || "D").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-sf font-semibold text-[15px] text-gray-900 truncate">
              {agentName || "Your driver"}
            </p>
            <p className="font-sf text-[13px] text-gray-500">
              {leg === "delivery" ? "Out for delivery" : "Out for pickup"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
