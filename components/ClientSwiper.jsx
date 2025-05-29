"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { BASE_URL } from "../utilities/URL";

const ClientSwiper = ({ clients = [] }) => {
  return (
    <div className="relative">
      <Swiper
        slidesPerView={1} // default for screens > 640px
        navigation={{
          nextEl: ".dis-custom-swiper-button-next",
          prevEl: ".dis-custom-swiper-button-prev",
        }}
        spaceBetween={15}
        pagination={{
          clickable: true,
        }}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
      >
        {clients?.map((item) => (
          <SwiperSlide>
            <div className="w-full">
              <div className="flex justify-between items-center">
                <p className="text-base text-theme-darkBlue font-sf">
                  What our client says
                </p>
                <img src="/images/landingPage/quotes.png" alt="" />
              </div>

              <h4 className="font-youth font-bold text-sm sm:text-xl lg:text-3xl uppercase tracking-tight py-4 sm:py-8">
                "With a toddler at home and a full-time job, finding time for
                laundry was nearly impossible. Now, with scheduled pickups and
                deliveries, I have one less thing to worry about. Thank you for
                making my life easier!"
              </h4>

              <div className="flex justify-between items-center border-black/30 border-t-1 pt-5">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full shrink-0 overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src="/images/landingPage/clientPic.png"
                      alt="client image"
                    />
                  </div>

                  <p className="font-semibold text-sm sm:text-xl font-sf">
                    Samantha Johnson
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mySwiper-btn">
        <div className="dis-custom-swiper-button-prev">
          <FaArrowLeftLong
            size={10}
            className="absolute -bottom-2 right-12 z-10 transform -translate-y-1/2 text-theme-red p-2.5 cursor-pointer bg-white size-10 rounded-full border-gray-400 border-1"
          />
        </div>
        <div className="dis-custom-swiper-button-next">
          <FaArrowLeftLong
            size={10}
            className="absolute -bottom-2 -right-0 z-10 rotate-180 transform -translate-y-1/2 text-theme-red p-2.5 cursor-pointer bg-white size-10 rounded-full border-gray-400 border-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientSwiper;
