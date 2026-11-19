"use client";

import { useEffect, useState } from "react";
import { getPendingCollectionPhotos } from "../../utilities/collectionPhoto";

/**
 * Read-only thumbnails of the photos for the driver chosen on Place order, so the
 * customer can see they are attached before paying. Renders nothing when there are none.
 */
export default function DriverPhotosSummary({ className }) {
  const [photos, setPhotos] = useState([]);

  // the photos live in this tab only (utilities/collectionPhoto.js): read them after mount
  useEffect(() => {
    const list = getPendingCollectionPhotos().map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos(list);
    return () => list.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  if (!photos.length) return null;

  return (
    <div className={className}>
      <p className="m-0 mb-2 text-[13.5px] text-jdc-muted">
        {photos.length === 1 ? "1 photo for the driver" : `${photos.length} photos for the driver`}
      </p>
      <ul className="m-0 flex list-none gap-2 p-0">
        {photos.map((p, i) => (
          <li key={p.url} className="size-12 flex-none overflow-hidden rounded-[10px] border border-jdc-line bg-jdc-paper">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL) */}
            <img src={p.url} alt={`Photo ${i + 1} for the driver`} className="size-full object-cover" />
          </li>
        ))}
      </ul>
    </div>
  );
}
