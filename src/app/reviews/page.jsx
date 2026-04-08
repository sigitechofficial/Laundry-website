"use client";
import React, { useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";
import { FaQuoteLeft } from "react-icons/fa6";
import Link from "next/link";

const ALL_REVIEWS = [
  {
    id: 1,
    name: "Samantha Johnson",
    rating: 5,
    date: "March 2025",
    service: "Wash & Fold",
    quote:
      "With a toddler at home and a full-time job, finding time for laundry was nearly impossible. Now, with scheduled pickups and deliveries, I have one less thing to worry about. Thank you for making my life easier!",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    date: "February 2025",
    service: "Dry Cleaning",
    quote:
      "The dry cleaning quality is exceptional. My suits look brand new every time. The team is professional and the turnaround is always on time. Highly recommend!",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 5,
    date: "January 2025",
    service: "Wash & Fold",
    quote:
      "I've tried many laundry services and this is by far the best. The folding is perfect, clothes smell fresh, and the prices are fair. My whole family uses them now.",
  },
  {
    id: 4,
    name: "James Wilson",
    rating: 5,
    date: "December 2024",
    service: "Ironing",
    quote:
      "Outstanding ironing service! My work shirts are always crisp and ready. Saves me so much time in the morning. Great customer service too.",
  },
  {
    id: 5,
    name: "Sarah Thompson",
    rating: 5,
    date: "November 2024",
    service: "Wash & Fold",
    quote:
      "Eco-friendly products and top-notch care for my clothes. I feel good about using a service that cares about the environment. Will keep coming back!",
  },
  {
    id: 6,
    name: "David Patel",
    rating: 4,
    date: "October 2024",
    service: "Dry Cleaning",
    quote:
      "Very reliable service. My delicate fabrics came back in perfect condition. The app makes booking super easy and the driver was friendly and on time.",
  },
  {
    id: 7,
    name: "Olivia Martinez",
    rating: 5,
    date: "October 2024",
    service: "Wash & Fold",
    quote:
      "Absolutely love this service. The clothes come back beautifully folded and smelling wonderful. Customer support is responsive and helpful.",
  },
  {
    id: 8,
    name: "Thomas Brown",
    rating: 4,
    date: "September 2024",
    service: "Ironing",
    quote:
      "Really good value for money. My office wear is always perfectly pressed. The only small thing is I wish there were more time slot options, but otherwise great!",
  },
  {
    id: 9,
    name: "Natalie Clarke",
    rating: 5,
    date: "August 2024",
    service: "Dry Cleaning",
    quote:
      "Took a risk with my expensive designer coat and I'm so glad I did. It came back spotless and perfectly pressed. These guys really know what they're doing.",
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, count: 187 },
  { stars: 4, count: 42 },
  { stars: 3, count: 12 },
  { stars: 2, count: 4 },
  { stars: 1, count: 2 },
];

const TOTAL = RATING_BREAKDOWN.reduce((s, r) => s + r.count, 0);
const AVERAGE =
  RATING_BREAKDOWN.reduce((s, r) => s + r.stars * r.count, 0) / TOTAL;

function StarRow({ rating, size = "sm" }) {
  const iconClass = size === "lg" ? "size-6" : "size-4";
  return (
    <div className="flex items-center gap-0.5 text-yellow-400">
      {[1, 2, 3, 4, 5].map((i) => {
        if (rating >= i) return <IoStar key={i} className={iconClass} />;
        if (rating >= i - 0.5)
          return <IoStarHalf key={i} className={iconClass} />;
        return <IoStarOutline key={i} className={iconClass} />;
      })}
    </div>
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  return (
    (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
  ).toUpperCase();
}

const BG_COLORS = [
  "bg-theme-blue",
  "bg-theme-blue-2",
  "bg-theme-brightBlue",
  "bg-[#000099]",
  "bg-[#146EF5]",
];

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState(0);

  const filtered =
    activeFilter === 0
      ? ALL_REVIEWS
      : ALL_REVIEWS.filter((r) => r.rating === activeFilter);

  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="reviews" />
        </div>

        {/* ── Hero banner ── */}
        <div className="w-full bg-theme-blue pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 px-5 md:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto flex flex-col lg:flex-row items-center gap-10">
            {/* Left — headline */}
            <div className="flex-1 text-white">
              <p className="font-sf text-sm sm:text-base text-white/70 mb-2 uppercase tracking-widest">
                What our customers say
              </p>
              <h1 className="font-youth font-black text-4xl sm:text-5xl xl:text-6xl uppercase leading-tight mb-4">
                Customer <br />
                <span className="text-yellow-400">Reviews</span>
              </h1>
              <p className="font-sf text-base sm:text-lg text-white/80 max-w-[460px]">
                Real experiences from real customers. See why thousands of
                people trust us with their laundry every week.
              </p>
            </div>

            {/* Right — overall rating card */}
            <div className="w-full lg:w-auto shrink-0 bg-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center gap-4 min-w-[280px]">
              <p className="font-sf font-semibold text-theme-gray-3 text-sm uppercase tracking-wider">
                Overall Rating
              </p>
              <div className="flex items-end gap-2">
                <span className="font-youth font-black text-6xl text-theme-blue leading-none">
                  {AVERAGE.toFixed(1)}
                </span>
                <span className="font-sf text-theme-gray-2 text-lg mb-1">
                  / 5
                </span>
              </div>
              <StarRow rating={AVERAGE} size="lg" />
              <p className="font-sf text-sm text-theme-gray-2">
                Based on {TOTAL.toLocaleString()} reviews
              </p>

              {/* Breakdown bars */}
              <div className="w-full space-y-2 pt-2">
                {RATING_BREAKDOWN.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="font-sf text-xs text-theme-gray-3 w-3 shrink-0">
                      {stars}
                    </span>
                    <IoStar className="size-3 text-yellow-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-theme-gray overflow-hidden">
                      <div
                        className="h-full rounded-full bg-theme-blue"
                        style={{ width: `${(count / TOTAL) * 100}%` }}
                      />
                    </div>
                    <span className="font-sf text-xs text-theme-gray-2 w-6 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter chips ── */}
        <div className="w-full bg-theme-skyBlue px-5 md:px-[45px] py-4">
          <div className="w-full max-w-[1290px] mx-auto flex items-center gap-3 flex-wrap">
            <span className="font-sf text-sm text-theme-gray-3 mr-1">
              Filter:
            </span>
            {[0, 5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setActiveFilter(star)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sf text-sm transition-all ${
                  activeFilter === star
                    ? "bg-theme-blue text-white shadow"
                    : "bg-white text-theme-gray-3 border border-gray-200 hover:border-theme-blue"
                }`}
              >
                {star === 0 ? (
                  "All reviews"
                ) : (
                  <>
                    {star}
                    <IoStar className="size-3.5 text-yellow-400" />
                  </>
                )}
              </button>
            ))}
            <span className="ml-auto font-sf text-sm text-theme-gray-2">
              {filtered.length} review{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Review cards grid ── */}
        <div className="w-full bg-white px-5 md:px-[45px] py-10 sm:py-14">
          <div className="w-full max-w-[1290px] mx-auto">
            {filtered.length === 0 ? (
              <p className="text-center font-sf text-theme-gray-2 py-20">
                No reviews found for this rating.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filtered.map((review, idx) => (
                  <div
                    key={review.id}
                    className="flex flex-col gap-4 bg-theme-gray rounded-2xl p-5 sm:p-6 shadow-theme-shadow hover:shadow-md transition-shadow"
                  >
                    {/* Quote icon + stars */}
                    <div className="flex items-start justify-between">
                      <FaQuoteLeft className="size-6 text-theme-blue/20" />
                      <StarRow rating={review.rating} />
                    </div>

                    {/* Review text */}
                    <p className="font-sf text-sm sm:text-base text-theme-gray-3 leading-relaxed flex-1">
                      &ldquo;{review.quote}&rdquo;
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Author row */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-full shrink-0 flex items-center justify-center text-white font-sf font-semibold text-sm ${
                          BG_COLORS[idx % BG_COLORS.length]
                        }`}
                      >
                        {getInitials(review.name)}
                      </div>
                      <div>
                        <p className="font-sf font-semibold text-sm text-theme-gray-3">
                          {review.name}
                        </p>
                        <p className="font-sf text-xs text-theme-gray-2">
                          {review.service} · {review.date}
                        </p>
                      </div>
                      {review.rating === 5 && (
                        <span className="ml-auto text-[10px] font-sf font-semibold bg-theme-blue/10 text-theme-blue px-2 py-0.5 rounded-full whitespace-nowrap">
                          Verified ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div className="w-full bg-theme-skyBlue px-5 md:px-[45px] py-10 sm:py-16">
          <div className="w-full max-w-[1290px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-youth font-bold text-2xl sm:text-3xl xl:text-4xl uppercase text-theme-blue">
                Love our service?
              </h3>
              <p className="font-sf text-base text-theme-gray-3 mt-2">
                Book your first pickup today and experience the difference.
              </p>
            </div>
            <Link
              href="/place-order"
              className="shrink-0 h-[52px] px-8 rounded-full bg-theme-blue text-white font-sf font-semibold text-base flex items-center justify-center hover:bg-theme-blue-2 transition-colors"
            >
              Book a Pickup
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
