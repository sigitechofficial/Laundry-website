"use client";

/**
 * Optional photos for the driver (front door, gate, where the bags are left).
 *
 * Chosen on Place order, kept here while the customer moves through checkout (Files
 * cannot go in the Redux store), shown on Payment, and uploaded there just before the
 * booking is created: POST customer/uploadCollectionImages (field "images", up to 3)
 * returns paths that go in createBooking.collectionImageUrls. The agent sees them on
 * the order.
 */

/** The backend keeps at most 3 per booking (MAX_COLLECTION_IMAGES). */
export const MAX_DRIVER_PHOTOS = 3;

let pendingPhotos = [];

export const getPendingCollectionPhotos = () => pendingPhotos;

export const setPendingCollectionPhotos = (files) => {
  pendingPhotos = Array.isArray(files) ? files.filter(Boolean).slice(0, MAX_DRIVER_PHOTOS) : [];
};

export const clearPendingCollectionPhotos = () => {
  pendingPhotos = [];
};

/**
 * A smaller JPEG for the upload (phone photos are 2–6 MB; the server takes up to 8 MB).
 * Returns the original file when the browser cannot decode or re-encode it.
 */
export async function shrinkPhoto(file, maxSide = 1600, quality = 0.85) {
  try {
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    return blob ? new File([blob], "driver-photo.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}
