"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../ds/Icon";
import { Container } from "../ds/Layout";
import { useGetWebBannersQuery } from "../../src/app/store/services/api";
import { BASE_URL } from "../../utilities/URL";
import { useStartBooking } from "../../utilities/useStartBooking";

/**
 * Offer banners from the admin panel (placement "Website" or "Both"), under the hero.
 *
 * Renders nothing until there is at least one banner, so an empty list or a failed
 * request leaves the page as it was. The hero fills the first screen, so the strip
 * appearing after load does not move anything the visitor is looking at; each slide
 * has a fixed 3:1 frame, so images loading do not shift it either.
 */

const AUTOPLAY_MS = 6000;

function imageUrl(path) {
  if (!path || typeof path !== "string") return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function badgeText(b) {
  if (b.offerLabel) return b.offerLabel;
  if (b.offerType === "free_delivery") return "Free delivery";
  const value = Number(b.discountValue);
  if (!Number.isFinite(value) || value <= 0) return null;
  const amount = Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (b.offerType === "percentage") return `${amount}% off`;
  // A flat banner not linked to a promotion carries no currency in the API (linked ones
  // come with offerLabel, built in the promotion's currency), so the amount has no symbol.
  return `${amount} off`;
}

function toSlides(data) {
  const list = data?.data?.banners ?? data?.banners ?? [];
  if (!Array.isArray(list)) return [];
  return list
    .map((b) => ({ ...b, src: imageUrl(b.image ?? b.webImage) }))
    .filter((b) => b.src);
}

const ARROW =
  "absolute top-1/2 z-[2] flex h-[44px] w-[44px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[50%] border-0 bg-[rgba(255,255,255,0.92)] text-jdc-navy shadow-jdc-md [transition:background_0.2s] hover:bg-jdc-white max-[720px]:hidden";

export default function WebBanners() {
  const { data } = useGetWebBannersQuery();
  const slides = toSlides(data);
  const startBooking = useStartBooking();
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback((i) => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }, []);

  // Keep the dots in step with swipes and scroll-snap.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = window.setInterval(() => goTo((index + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, index, paused, goTo]);

  if (!count) return null;

  return (
    <section
      aria-label="Current offers"
      className="pt-[48px] max-[1080px]:pt-[32px] max-[720px]:pt-[20px]"
    >
      <Container>
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-jdc-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[720px]:rounded-[16px]"
          >
            {slides.map((b, i) => {
              const badge = badgeText(b);
              return (
                <button
                  key={b.id ?? i}
                  type="button"
                  onClick={() => startBooking()}
                  aria-label={`${b.title}${badge ? `, ${badge}` : ""}. Book a collection`}
                  className="relative block aspect-[3/1] w-full flex-[0_0_100%] cursor-pointer snap-start overflow-hidden border-0 bg-jdc-navy p-0 text-left text-jdc-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- backend upload on the API host */}
                  <img
                    src={b.src}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 [background:linear-gradient(90deg,rgba(3,20,67,0.78)_0%,rgba(3,20,67,0.45)_45%,rgba(3,20,67,0)_75%)]" />
                  <span className="relative flex h-full max-w-[62%] flex-col justify-center gap-[10px] p-[0_32px_0_84px] max-[1080px]:gap-[6px] max-[1080px]:p-[0_24px_0_76px] max-[720px]:gap-[4px] max-[720px]:p-[0_14px]">
                    {badge ? (
                      <span className="inline-flex h-[30px] items-center self-start rounded-jdc-pill bg-jdc-white px-[12px] text-[12.5px] font-bold uppercase tracking-[0.07em] text-jdc-blue max-[720px]:h-[20px] max-[720px]:px-[8px] max-[720px]:text-[10px]">
                        {badge}
                      </span>
                    ) : null}
                    <span className="line-clamp-2 font-display text-[length:clamp(22px,2.6vw,40px)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em] max-[720px]:text-[16px]">
                      {b.title}
                    </span>
                    {b.description ? (
                      <span className="line-clamp-2 text-[16px] leading-[1.45] text-[rgba(255,255,255,0.9)] max-[1080px]:hidden">
                        {b.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous offer"
                onClick={() => goTo((index - 1 + count) % count)}
                className={`${ARROW} left-[16px] [&_svg]:rotate-180`}
              >
                <Icon name="caretRight" size={18} />
              </button>
              <button
                type="button"
                aria-label="Next offer"
                onClick={() => goTo((index + 1) % count)}
                className={`${ARROW} right-[16px]`}
              >
                <Icon name="caretRight" size={18} />
              </button>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="mt-[12px] flex justify-center gap-[6px]">
            {slides.map((b, i) => (
              <button
                key={b.id ?? i}
                type="button"
                aria-label={`Show offer ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
                className="flex h-[24px] cursor-pointer items-center border-0 bg-transparent p-[0_2px]"
              >
                <span
                  className={`block h-[6px] rounded-jdc-pill [transition:width_0.25s,background_0.25s] ${
                    i === index ? "w-[22px] bg-jdc-blue" : "w-[6px] bg-jdc-line"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
