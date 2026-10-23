"use client";

import { useEffect, useState } from "react";

/**
 * Muted, looping decorative video with a still poster.
 *
 * The poster renders on the server, and the video source is picked on the
 * client: SD on small screens or Save-Data, HD otherwise. Visitors who
 * prefer reduced motion keep the still image only.
 */
export default function BackgroundVideo({ poster, hd, sd, className }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const saveData = navigator.connection?.saveData === true;
    const small = window.matchMedia("(max-width: 900px)").matches;
    setSrc(saveData || small ? sd || hd : hd || sd);
  }, [hd, sd]);

  if (!src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={poster} alt="" aria-hidden="true" />;
  }

  return (
    <video
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
