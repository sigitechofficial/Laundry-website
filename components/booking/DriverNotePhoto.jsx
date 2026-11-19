"use client";

import { useEffect, useId, useRef, useState } from "react";
import { addToast } from "@heroui/react";
import ProtoIcon from "../proto/ProtoIcon";
import Dialog from "../ds/Dialog";
import { cx } from "../ds/cx";
import { MAX_DRIVER_PHOTOS } from "../../utilities/collectionPhoto";

/*
 * Up to 3 photos for the driver (front door, gate, where the bags are left).
 * "Add a photo" opens an in-page camera (live preview + shutter), back camera on phones,
 * webcam on computers. "Gallery" picks from the device instead (several at once), and is
 * also the way out when the camera is blocked or missing. Each photo shows as a thumbnail:
 * tap it to see it larger, ✕ to remove it; a "+ Add" tile stays until there are 3.
 *
 * Why an in-page camera: <input capture> only opens the camera on some phones; desktop
 * browsers (and phone emulators) ignore it and show a file picker.
 *
 * Place order passes the Files up through onChange; Payment uploads them with the booking
 * (utilities/collectionPhoto.js). `initialFiles` shows photos already chosen when the
 * customer comes back to the page.
 */
const MAX_BYTES = 10 * 1024 * 1024; // phone photos are usually 2–6 MB; shrunk before upload
const SHORT = "[@media(min-width:901px)_and_(max-height:860px)]:h-12";
// No photo yet. Phones: a full-width row under the note. Computers: a compact button
// beside the note bar, as tall as the bar, so the page does not get taller.
const ADD_ROW = cx(
  "flex h-[78px] w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#C5CEDD] bg-white px-3 text-left",
  "hover:border-jdc-blue active:bg-jdc-paper min-[721px]:h-14 min-[721px]:w-auto min-[721px]:gap-2.5 min-[721px]:px-4",
  SHORT
);
const TILE = "relative size-16 flex-none rounded-xl";

const CAMERA_ERRORS = {
  NotAllowedError: "Camera access is blocked. Allow it in your browser settings, or choose a photo instead.",
  SecurityError: "Camera access is blocked. Allow it in your browser settings, or choose a photo instead.",
  NotFoundError: "No camera found on this device. You can choose a photo instead.",
  OverconstrainedError: "No camera found on this device. You can choose a photo instead.",
  NotReadableError: "The camera is being used by another app. Close it and try again, or choose a photo.",
};

let nextPhotoId = 0;
const toPhoto = (file) => ({ id: ++nextPhotoId, file, url: URL.createObjectURL(file) });

export default function DriverNotePhoto({ onChange, className, initialFiles = [] }) {
  const galleryId = useId();
  const galleryRef = useRef(null);
  const [photos, setPhotos] = useState(() => (initialFiles || []).slice(0, MAX_DRIVER_PHOTOS).map(toPhoto));
  const [cameraOpen, setCameraOpen] = useState(false);
  const [viewing, setViewing] = useState(null); // photo shown large
  const photosRef = useRef(photos);
  photosRef.current = photos;

  // free every preview URL when the page closes
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const commit = (next) => {
    setPhotos(next);
    onChange?.(next.map((p) => p.file));
  };

  const accept = (files) => {
    const room = MAX_DRIVER_PHOTOS - photosRef.current.length;
    const valid = [];
    for (const file of files) {
      if (!file) continue;
      if (!file.type.startsWith("image/")) {
        addToast({ title: "Please choose a photo", color: "warning" });
        continue;
      }
      if (file.size > MAX_BYTES) {
        addToast({ title: "That photo is too large", description: "Please use one under 10 MB.", color: "warning" });
        continue;
      }
      valid.push(file);
    }
    if (valid.length > room) {
      addToast({
        title: `You can add up to ${MAX_DRIVER_PHOTOS} photos`,
        description: room > 0 ? `We added the first ${room}.` : "Remove one to add another.",
        color: "warning",
      });
    }
    const added = valid.slice(0, Math.max(0, room)).map(toPhoto);
    if (added.length) commit([...photosRef.current, ...added]);
  };

  const fromGallery = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // the same photo can be chosen again later
    setCameraOpen(false);
    accept(files);
  };

  const remove = (id) => {
    const gone = photosRef.current.find((p) => p.id === id);
    if (gone) URL.revokeObjectURL(gone.url);
    if (viewing?.id === id) setViewing(null);
    commit(photosRef.current.filter((p) => p.id !== id));
  };

  // the camera when the browser can show it in the page; otherwise the phone's own picker
  const takePhoto = () => {
    if (photosRef.current.length >= MAX_DRIVER_PHOTOS) return;
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) setCameraOpen(true);
    else galleryRef.current?.click();
  };

  const full = photos.length >= MAX_DRIVER_PHOTOS;

  return (
    <div className={cx(photos.length ? "w-full basis-full" : "flex-none max-[720px]:w-full", className)}>
      <input
        ref={galleryRef}
        id={galleryId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={fromGallery}
      />

      {photos.length ? (
        <div className="rounded-xl border border-jdc-line bg-white p-3">
          <p className="m-0 mb-2.5 text-[14px] font-semibold text-jdc-navy">
            Photos for the driver
            <span className="ml-1.5 font-normal text-jdc-muted">
              {photos.length} of {MAX_DRIVER_PHOTOS}
            </span>
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {photos.map((p, i) => (
              <li key={p.id} className={TILE}>
                <button
                  type="button"
                  aria-label={`View photo ${i + 1}`}
                  className="block size-full cursor-zoom-in overflow-hidden rounded-xl border border-jdc-line bg-jdc-paper p-0"
                  onClick={() => setViewing(p)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL) */}
                  <img src={p.url} alt={`Photo ${i + 1} for the driver`} className="size-full object-cover" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-jdc-line bg-white p-0 text-jdc-navy before:absolute before:-inset-2.5 before:content-['']"
                  onClick={() => remove(p.id)}
                >
                  <ProtoIcon name="close" size={11} />
                </button>
              </li>
            ))}
            {!full ? (
              <li className={TILE}>
                <button
                  type="button"
                  aria-label="Add another photo for the driver"
                  className="flex size-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-[#C5CEDD] bg-white p-0 text-[12.5px] font-semibold text-jdc-blue hover:border-jdc-blue active:bg-jdc-paper"
                  onClick={takePhoto}
                >
                  <ProtoIcon name="plus" size={16} />
                  Add
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : (
        <button type="button" className={ADD_ROW} aria-label="Add a photo for the driver" onClick={takePhoto}>
          <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-jdc-blue-tint text-jdc-blue min-[721px]:size-8">
            <ProtoIcon name="camera" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block whitespace-nowrap text-[14.5px] font-semibold text-jdc-navy min-[721px]:text-[15px]">Add a photo</span>
            <span className="block truncate text-[13px] leading-[1.35] text-jdc-muted min-[721px]:hidden">
              Optional · up to {MAX_DRIVER_PHOTOS}, e.g. your front door or gate
            </span>
          </span>
        </button>
      )}

      <PhotoViewer
        photo={viewing}
        index={viewing ? photos.findIndex((p) => p.id === viewing.id) : -1}
        onClose={() => setViewing(null)}
        onRemove={() => viewing && remove(viewing.id)}
      />

      <CameraSheet
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onShot={(file) => {
          setCameraOpen(false);
          accept([file]);
        }}
        galleryId={galleryId}
      />
    </div>
  );
}

/* One photo shown large (bottom sheet on phones), with Remove. */
function PhotoViewer({ photo, index, onClose, onRemove }) {
  return (
    <Dialog open={Boolean(photo)} onClose={onClose} labelledBy="photoViewTitle" width="lg">
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <h2 id="photoViewTitle" className="m-0 font-display text-[18px] font-bold text-jdc-navy">
          Photo {index + 1} for the driver
        </h2>
        <button
          type="button"
          aria-label="Close photo"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-jdc-paper text-jdc-navy"
          onClick={onClose}
        >
          <ProtoIcon name="close" size={15} />
        </button>
      </div>
      {photo ? (
        <div className="mx-5 flex max-h-[62vh] items-center justify-center overflow-hidden rounded-2xl bg-[#0F141C]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL) */}
          <img src={photo.url} alt={`Photo ${index + 1} for the driver`} className="max-h-[62vh] w-full object-contain" />
        </div>
      ) : null}
      <div className="flex justify-end gap-2.5 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          className="h-11 cursor-pointer rounded-full border border-jdc-line bg-white px-5 text-[14px] font-semibold text-[#D92D20] active:bg-jdc-paper"
          onClick={onRemove}
        >
          Remove photo
        </button>
        <button
          type="button"
          className="h-11 cursor-pointer rounded-full border-0 bg-jdc-blue px-5 text-[14px] font-semibold text-white"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </Dialog>
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
