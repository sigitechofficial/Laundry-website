"use client";

import { useEffect, useId, useRef, useState } from "react";
import { addToast } from "@heroui/react";
import ProtoIcon from "../proto/ProtoIcon";
import Dialog from "../ds/Dialog";
import { cx } from "../ds/cx";

/*
 * A photo to go with the driver note (front door, gate, where to leave the
 * bag). "Add a photo" opens an in-page camera (live preview + shutter), back camera on
 * phones, webcam on computers. "Choose from photos" picks one from the gallery instead, and
 * is also the way out when the camera is blocked or missing. Shows a thumbnail with
 * Retake / Remove.
 *
 * Why an in-page camera: <input capture> only opens the camera on some phones; desktop
 * browsers (and phone emulators) ignore it and show a file picker.
 *
 * Place order passes the File up through onChange; Payment uploads it with the booking
 * (utilities/collectionPhoto.js).
 * `initialFile` shows a photo already chosen when the customer comes back to the page.
 */
const MAX_BYTES = 10 * 1024 * 1024; // phone photos are usually 2–6 MB
// Phones: a full-width row under the note, the same height empty and with a photo.
// Computers: a compact button beside the note bar, as tall as the bar (h-14, h-12 on
// short laptops), so the page does not get taller and Continue stays in view.
const SHORT = "[@media(min-width:901px)_and_(max-height:860px)]:h-12";
const ROW = cx(
  "flex h-[78px] w-full items-center gap-3 rounded-xl border bg-white text-left",
  "min-[721px]:h-14 min-[721px]:w-auto min-[721px]:gap-2.5",
  SHORT
);

const CAMERA_ERRORS = {
  NotAllowedError: "Camera access is blocked. Allow it in your browser settings, or choose a photo instead.",
  SecurityError: "Camera access is blocked. Allow it in your browser settings, or choose a photo instead.",
  NotFoundError: "No camera found on this device. You can choose a photo instead.",
  OverconstrainedError: "No camera found on this device. You can choose a photo instead.",
  NotReadableError: "The camera is being used by another app. Close it and try again, or choose a photo.",
};

export default function DriverNotePhoto({ onChange, className, initialFile = null }) {
  const galleryId = useId();
  const galleryRef = useRef(null);
  const [photo, setPhoto] = useState(() =>
    initialFile ? { url: URL.createObjectURL(initialFile), file: initialFile } : null
  ); // { url, file }
  const [cameraOpen, setCameraOpen] = useState(false);

  // free the preview URL when it is replaced or the page closes
  useEffect(() => () => photo?.url && URL.revokeObjectURL(photo.url), [photo]);

  const accept = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast({ title: "Please choose a photo", color: "warning" });
      return;
    }
    if (file.size > MAX_BYTES) {
      addToast({ title: "That photo is too large", description: "Please use one under 10 MB.", color: "warning" });
      return;
    }
    setPhoto({ url: URL.createObjectURL(file), file });
    onChange?.(file);
  };

  const fromGallery = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // the same photo can be chosen again later
    setCameraOpen(false);
    accept(file);
  };

  const remove = () => {
    setPhoto(null);
    onChange?.(null);
  };

  // the camera when the browser can show it in the page; otherwise the phone's own picker
  const takePhoto = () => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) setCameraOpen(true);
    else galleryRef.current?.click();
  };

  return (
    <div className={className}>
      <input ref={galleryRef} id={galleryId} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={fromGallery} />

      {photo ? (
        <div className={cx(ROW, "border-jdc-line p-2.5 pr-3 min-[721px]:p-1.5 min-[721px]:pr-2")}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL) */}
          <img
            src={photo.url}
            alt="Photo for the driver"
            className="size-14 flex-none rounded-[10px] object-cover min-[721px]:size-11 [@media(min-width:901px)_and_(max-height:860px)]:size-9"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[14.5px] font-semibold text-jdc-navy min-[721px]:hidden">Photo added</p>
            <button
              type="button"
              className="mt-0.5 cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-semibold text-jdc-blue"
              onClick={takePhoto}
            >
              Retake
            </button>
          </div>
          <button
            type="button"
            aria-label="Remove photo"
            className="flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-jdc-paper text-jdc-navy"
            onClick={remove}
          >
            <ProtoIcon name="close" size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={cx(ROW, "cursor-pointer border-dashed border-[#C5CEDD] px-3 hover:border-jdc-blue active:bg-jdc-paper min-[721px]:px-4")}
          aria-label="Add a photo for the driver"
          onClick={takePhoto}
        >
          <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-jdc-blue-tint text-jdc-blue min-[721px]:size-8">
            <ProtoIcon name="camera" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block whitespace-nowrap text-[14.5px] font-semibold text-jdc-navy min-[721px]:text-[15px]">Add a photo</span>
            <span className="block truncate text-[13px] leading-[1.35] text-jdc-muted min-[721px]:hidden">Optional · your front door or gate</span>
          </span>
        </button>
      )}

      <CameraSheet
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onShot={(file) => {
          setCameraOpen(false);
          accept(file);
        }}
        galleryId={galleryId}
      />
    </div>
  );
}

/* Live camera in a popup (bottom sheet on phones): preview, shutter, gallery fallback. */
function CameraSheet({ open, onClose, onShot, galleryId }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [state, setState] = useState("starting"); // starting | live | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setState("starting");
    setError("");
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.play().catch(() => {});
        }
        setState("live");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(CAMERA_ERRORS[err?.name] || "The camera could not start. You can choose a photo instead.");
        setState("error");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const shoot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => blob && onShot(new File([blob], `driver-note-${Date.now()}.jpg`, { type: "image/jpeg" })),
      "image/jpeg",
      0.9,
    );
  };

  return (
    <Dialog open={open} onClose={onClose} labelledBy="camTitle" width="md">
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <h2 id="camTitle" className="m-0 font-display text-[18px] font-bold text-jdc-navy">
          Take a photo
        </h2>
        <button
          type="button"
          aria-label="Close camera"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-jdc-paper text-jdc-navy"
          onClick={onClose}
        >
          <ProtoIcon name="close" size={15} />
        </button>
      </div>

      {/* viewfinder: fixed 3:4, so the sheet does not change size when the camera starts */}
      <div className="relative mx-5 aspect-[3/4] max-h-[56vh] overflow-hidden rounded-2xl bg-[#0F141C]">
        <video
          ref={videoRef}
          className={cx("size-full object-cover", state !== "live" && "invisible")}
          playsInline
          muted
          autoPlay
        />
        {state === "starting" ? (
          <p className="absolute inset-0 m-0 flex items-center justify-center text-[14px] text-white/70">Starting camera…</p>
        ) : null}
        {state === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center" role="alert">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white">
              <ProtoIcon name="camera" size={22} />
            </span>
            <p className="m-0 text-[14.5px] leading-[1.5] text-white/85">{error}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
        <label
          htmlFor={galleryId}
          className="flex h-11 cursor-pointer items-center gap-2 justify-self-start whitespace-nowrap rounded-full border border-jdc-line bg-white px-4 text-[14px] font-semibold text-jdc-navy active:bg-jdc-paper"
          aria-label="Choose from your photos"
        >
          <ProtoIcon name="image" size={18} />
          Gallery
        </label>
        <button
          type="button"
          aria-label="Take photo"
          disabled={state !== "live"}
          onClick={shoot}
          className="flex size-[68px] cursor-pointer items-center justify-center rounded-full border-4 border-jdc-blue bg-white p-1 disabled:cursor-not-allowed disabled:border-[#C5CEDD]"
        >
          <span className={cx("size-full rounded-full", state === "live" ? "bg-jdc-blue" : "bg-[#C5CEDD]")} />
        </button>
        <span />
      </div>
    </Dialog>
  );
}
