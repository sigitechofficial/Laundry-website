"use client";
import React from "react";
import Header from "../../../components/Header";
import PriceServiceCard from "../../../components/PriceServiceCard";
import Footer from "../../../components/Footer";
import { useGetServicesQuery } from "../store/services/api";
import { useRouter } from "next/navigation";
import HomeClientWrapper from "../../../utilities/Test";
import { useDispatch } from "react-redux";
import { setPage } from "../store/slices/cartItemSlice";
import { MiniLoader } from "../../../components/Loader";

export default function Pricing() {
  const { data, isLoading } = useGetServicesQuery();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleServiceDetail = (id) => {
    dispatch(setPage(true));
    router.push(`/pricing/service-detail?id=${id}`);
  };

  return (
    <>
      <HomeClientWrapper>
        <div className="w-full relative">
          <div className="max-xl:fixed max-xl:z-50 w-full">
            <Header type="service" />
          </div>

          <div className="w-full max-w-[1290px] mx-auto px-[16px] sm:px-[45px] pt-20 sm:pt-24 pb-10 sm:pb-12 lg:pb-16">
            <h1 className="font-youth font-bold text-3xl sm:text-4xl 2xl:text-5xl text-black mb-6 sm:mb-8">
              Prices
            </h1>

            {!isLoading ? (
              <div className="flex flex-col gap-4 sm:gap-5">
                {data?.data?.serviceData?.map((item) => (
                  <PriceServiceCard
                    key={item?.id}
                    name={item?.name}
                    description={item?.description}
                    onClick={() => handleServiceDetail(item?.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 flex justify-center">
                <MiniLoader />
              </div>
            )}
          </div>

          <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
        </div>
      </HomeClientWrapper>
    </>
  );
}
