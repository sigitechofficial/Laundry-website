import Image from "next/image";
import { MOSAIC } from "./content";

const SIZES = [
  "(max-width: 1080px) 50vw, 34vw",
  "(max-width: 1080px) 50vw, 17vw",
  "(max-width: 1080px) 50vw, 34vw",
  "(max-width: 1080px) 50vw, 17vw",
  "(max-width: 1080px) 50vw, 17vw",
  "(max-width: 1080px) 50vw, 34vw",
];

/* Grid placement per tile (desktop bento; auto-flow from 1080px down) */
const TILE = [
  "col-[span_2] row-[span_2]",
  "col-[span_1]",
  "col-[span_2]",
  "col-[span_1] row-[span_2]",
  "col-[span_1]",
  "col-[span_2]",
];

/** Decorative photo band between sections. */
export default function Mosaic() {
  return (
    <div
      className="grid auto-rows-[230px] grid-cols-[repeat(6,1fr)] gap-[6px] bg-jdc-navy-deep [&_img]:object-cover [&_img]:[filter:brightness(0.8)_saturate(0.9)] max-[1080px]:auto-rows-[150px] max-[1080px]:grid-cols-[repeat(2,1fr)]"
      aria-hidden="true"
    >
      {MOSAIC.map((src, i) => (
        <figure
          key={src}
          className={`relative m-0 overflow-hidden ${TILE[i]} max-[1080px]:col-auto max-[1080px]:row-auto`}
        >
          <Image src={src} alt="" fill sizes={SIZES[i]} />
        </figure>
      ))}
    </div>
  );
}
