"use client";
import React from "react";
import Header from "../../../components/Header";
import CategoryCard from "../../../components/CategoryCard";
import { MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
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

          <div className="w-full h-[320px] sm:h-[500px] 2xl:h-[800px] bg-pricing bg-cover bg-center bg-no-repeat"></div>

          <div className="bg-theme-skyBlue px-[16px] sm:px-[45px]">
            <div className="flex justify-center items-center gap-12 lg:gap-24 h-24 lg:h-36 2xl:h-[197px]">
              <div className="flex gap-2 items-center">
                <img src="/images/pricing/24h.png" alt="24h image" />
                <p className="font-sf font-medium text-xs sm:text-base lg:text-xl text-theme-brightBlue">
                  Free 24h delivery
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <img src="/images/pricing/bag.png" alt="bag image" />
                <p className="font-sf font-medium text-xs sm:text-base lg:text-xl text-theme-brightBlue">
                  $34 minimum Order
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <img src="/images/pricing/star.png" alt="star image" />
                <p className="font-sf font-medium text-xs sm:text-base lg:text-xl text-theme-brightBlue">
                  Service fee from $2.99
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[1290px] mx-auto px-[16px] sm:px-[45px] py-12 lg:py-[100px]">
            <div className="w-full grid lg:grid-cols-2 gap-5 sm:gap-10">
              {/* <CategoryCard
              bg="1"
              h="Dry Cleaning"
              Icon={MdOutlineDryCleaning}
              src="/images/pricing/c1.png"
              right="-right-16"
            />
            <CategoryCard
              bg="2"
              h="Ironing/ Press only"
              Icon={TbIroning}
              src="/images/pricing/c2.png"
              right="right-0"
            />
            <CategoryCard
              bg="3"
              h="Repair"
              Icon={AiOutlinePercentage}
              src="/images/pricing/c3.png"
              right="-right-14"
            />
            <CategoryCard
              bg="4"
              h="Service Wash"
              Icon={TbWash}
              src="/images/pricing/c4.png"
              right="-right-10"
            />
            <CategoryCard
              bg="5"
              h="Wash and Iron"
              Icon={TbIroningSteam}
              src="/images/pricing/c5.png"
              right="-right-6"
            /> */}

              {!isLoading ? (
                data?.data?.serviceData?.map((item) => {
                  return item?.id === 1 ? (
                    <CategoryCard
                      key={item?.id}
                      onClick={() => handleServiceDetail(item?.id)}
                      bg="2"
                      h={item?.name}
                      Icon={TbIroning}
                      src="/images/pricing/c2.png"
                      right="right-0"
                    />
                  ) : item?.id === 2 ? (
                    <CategoryCard
                      key={item?.id}
                      onClick={() => handleServiceDetail(item?.id)}
                      bg="1"
                      h={item?.name}
                      Icon={MdOutlineDryCleaning}
                      src="/images/pricing/c1.png"
                      right="-right-16"
                    />
                  ) : item?.id === 3 ? (
                    <CategoryCard
                      key={item?.id}
                      onClick={() => handleServiceDetail(item?.id)}
                      bg="4"
                      h={item?.name}
                      Icon={TbWash}
                      src="/images/pricing/c4.png"
                      right="-right-10"
                    />
                  ) : item?.id === 4 ? (
                    <CategoryCard
                      key={item?.id}
                      onClick={() => handleServiceDetail(item?.id)}
                      bg="4"
                      h={item?.name}
                      Icon={TbWash}
                      src="/images/pricing/c4.png"
                      right="-right-10"
                    />
                  ) : item?.id === 5 ? (
                    <CategoryCard
                      key={item?.id}
                      onClick={() => handleServiceDetail(item?.id)}
                      bg="5"
                      h={item?.name}
                      Icon={TbIroningSteam}
                      src="/images/pricing/c5.png"
                      right="-right-6"
                    />
                  ) : (
                    <CategoryCard
                      key={item?.id}
                      onClick={() => handleServiceDetail(item?.id)}
                      bg="1"
                      h={item?.name}
                      Icon={MdOutlineDryCleaning}
                      src="/images/pricing/c1.png"
                      right="-right-16"
                    />
                  );
                })
              ) : (
                <div className="col-span-2 text-xl font-semibold animate-pulse w-max mx-auto">
                  <MiniLoader />
                </div>
              )}
            </div>
          </div>

          {/*footer section  */}
          <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
        </div>
      </HomeClientWrapper>
    </>
  );
}
