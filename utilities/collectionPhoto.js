"use client";

/**
 * Optional photo for the driver (front door, gate, where the bags are left).
 *
 * Chosen on Place order, kept here while the customer moves through checkout (a File
 * cannot go in the Redux store), and uploaded on Payment just before the booking is
 * created: POST customer/uploadCollectionImages returns paths that go in
 * createBooking.collectionImageUrls. The agent sees them on the order.
 */

let pendingPhoto = null;

export const getPendingCollectionPhoto = () => pendingPhoto;

export const setPendingCollectionPhoto = (file) => {
  pendingPhoto = file || null;
};

export const clearPendingCollectionPhoto = () => {
  pendingPhoto = null;
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
    return blob ? new File([blob], "collection-photo.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}
