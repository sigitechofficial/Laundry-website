"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const STATIC_REVIEWS = [
  {
    id: 1,
    name: "Samantha Johnson",
    quote:
      "With a toddler at home and a full-time job, finding time for laundry was nearly impossible. Now, with scheduled pickups and deliveries, I have one less thing to worry about. Thank you for making my life easier!",
    image: "/images/landingPage/clientPic.png",
  },
  {
    id: 2,
    name: "Michael Chen",
    quote:
      "The dry cleaning quality is exceptional. My suits look brand new every time. The team is professional and the turnaround is always on time. Highly recommend Bubbles Laundry!",
    image: "/images/landingPage/clientPic.png",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    quote:
      "I've tried many laundry services and this is by far the best. The folding is perfect, clothes smell fresh, and the prices are fair. My whole family uses them now.",
    image: "/images/landingPage/clientPic.png",
  },
  {
    id: 4,
    name: "James Wilson",
    quote:
      "Outstanding ironing service! My work shirts are always crisp and ready. Saves me so much time in the morning. Great customer service too.",
    image: "/images/landingPage/clientPic.png",
  },
  {
    id: 5,
    name: "Sarah Thompson",
    quote:
      "Eco-friendly products and top-notch care for my clothes. I feel good about using a service that cares about the environment. Will keep coming back!",
    image: "/images/landingPage/clientPic.png",
  },
];

const ClientSwiper = ({ clients = [] }) => {
  const reviews =
    clients?.length > 0 && typeof clients[0] === "object" ? clients : STATIC_REVIEWS;

  return (
    <div className="relative">
      <Swiper
        slidesPerView={1}
        spaceBetween={15}
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        modules={[Pagination, Autoplay]}
        className="mySwiper"
      >
        {reviews?.map((review) => (
          <SwiperSlide key={review.id ?? review.name}>
            <div className="w-full">
              <div className="flex justify-between items-center">
                <p className="text-base text-theme-darkBlue font-sf">
                  What our client says
                </p>
                <img src="/images/landingPage/quotes.png" alt="" />
              </div>

              <h4 className="font-youth font-bold text-sm sm:text-xl lg:text-3xl uppercase tracking-tight py-4 sm:py-8">
                &ldquo;{review.quote}&rdquo;
              </h4>

              <div className="flex justify-between items-center border-black/30 border-t-1 pt-5">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full shrink-0 overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={review.image || "/images/landingPage/clientPic.png"}
                      alt={review.name}
                    />
                  </div>
                  <p className="font-semibold text-sm sm:text-xl font-sf">
                    {review.name}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ClientSwiper;
