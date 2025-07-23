"use client";
import React, { useEffect, useState } from "react";
import Header from "../../../../components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { MdArrowBackIos, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbIroningSteam, TbWash } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { FaArrowRightLong, FaPlus } from "react-icons/fa6";
import Footer from "../../../../components/Footer";
import HomeClientWrapper from "../../../../utilities/Test";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { useGetServiceByIdQuery } from "@/app/store/services/api";
import { MiniLoader } from "../../../../components/Loader";
export const dynamic = "force-dynamic";

export default function ServiceDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [pageData, setPageData] = useState({
    tab: 1,
  });
  const { data, isLoading, refetch } = useGetServiceByIdQuery(id, {
    skip: !id, // don't run until id exists
  });
  const dispatch = useDispatch();

  const handleServiceDetail = (serviceId) => {
    if (serviceId != id) {
      dispatch(setPage(true));
      router.push(`/pricing/service-detail?id=${serviceId}`);
    }
  };

  // useEffect(() => {
  //   if (id) refetch(); // only if you really want to force refresh
  // }, [id]);
  return (
    <>
      <HomeClientWrapper>
        {isLoading ? (
          <div className="w-full h-screen flex justify-center items-center">
             <MiniLoader/>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full relative">
              <div className="max-xl:fixed max-xl:z-50 w-full">
                <Header type="service" />
              </div>

              <div className="w-full max-w-[1290px] mx-auto font-sf px-5 sm:px-[45px]">
                <Link
                  href="/pricing"
                  onClick={() => {
                    dispatch(setPage(true));
                  }}
                  className="flex items-center gap-2 my-[40px]"
                >
                  <MdArrowBackIos size={20} />
                  <p className="text-xl">Service List</p>
                </Link>

                <div className="grid grid-cols-5 gap-5">
                  <div
                    onClick={() => handleServiceDetail(3)}
                    className={`flex h-[56px] items-center gap-x-3 cursor-pointer ${
                      id == 3 ? "bg-theme-blue text-white" : "text-black"
                    } rounded px-2 border-2 border-theme-gray`}
                  >
                    <div className="bg-theme-blue-2 rounded-full shrink-0 size-10 flex justify-center items-center">
                      <TbWash size="25" />
                    </div>

                    <p className={`font-semibold text-xl `}>Wash</p>
                  </div>

                  <div className="flex h-[56px] items-center gap-x-3 rounded px-2 border-2 border-theme-gray">
                    <div className="bg-card-pink rounded-full shrink-0 size-10 flex justify-center items-center">
                      <TbIroningSteam size="25" />
                    </div>

                    <p className="font-semibold text-xl">Wash & Iron</p>
                  </div>

                  <div
                    onClick={() => handleServiceDetail(1)}
                    className={`flex h-[56px] items-center gap-x-3 rounded px-2 border-2 border-theme-gray cursor-pointer ${
                      id == 1 ? "bg-theme-blue text-white" : "text-black"
                    }`}
                  >
                    <div className="bg-[#FFD06D] rounded-full shrink-0 size-10 flex justify-center items-center">
                      <TbIroning size="25" />
                    </div>

                    <p className="font-semibold text-xl">Iron</p>
                  </div>

                  <div
                    onClick={() => handleServiceDetail(2)}
                    className={`flex h-[56px] items-center gap-x-3 rounded px-2 border-2 border-theme-gray cursor-pointer ${
                      id == 2 ? "bg-theme-blue text-white" : "text-black"
                    }`}
                  >
                    <div className="bg-card-green rounded-full shrink-0 size-10 flex justify-center items-center">
                      <MdOutlineDryCleaning size="25" />
                    </div>

                    <p className="font-semibold text-xl">Dry Cleaning</p>
                  </div>

                  <div className="flex h-[56px] items-center gap-x-3 rounded px-2 border-2 border-theme-gray">
                    <div className="bg-theme-skyBlue rounded-full shrink-0 size-10 flex justify-center items-center">
                      <AiOutlinePercentage size="20" />
                    </div>

                    <p className="font-semibold text-xl">Deals</p>
                  </div>
                </div>

                <div className="w-full rounded-none bg-[#BAEBFF] flex justify-between items-center px-2 py-4 my-8">
                  <div>
                    <h4 className="font-semibold text-[40px] text-theme-blue">
                      {data?.data?.serviceData[0]?.service?.name}
                    </h4>
                    <p className="text-2xl text-theme-darkBlue">
                      For everyday laundry, bedsheets and towels.
                    </p>
                  </div>

                  {id == 3 ? (
                    <div className="bg-[#0890F1] rounded-full shrink-0 size-20 flex justify-center items-center">
                      <TbWash size="55" />
                    </div>
                  ) : id == 1 ? (
                    <div className="bg-[#FFD06D] rounded-full shrink-0 size-20 flex justify-center items-center">
                      <TbIroning size="55" />
                    </div>
                  ) : (
                    <div className="bg-card-green rounded-full shrink-0 size-20 flex justify-center items-center">
                      <MdOutlineDryCleaning size="55" />
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <div className="flex items-center gap-5">
                    <p
                      onClick={() => {
                        setPageData({ ...pageData, tab: 1 });
                      }}
                      className={`text-xl font-semibold cursor-pointer ${
                        pageData?.tab === 1
                          ? "underline underline-offset-4"
                          : ""
                      } `}
                    >
                      Prices
                    </p>
                    <p
                      onClick={() => {
                        setPageData({ ...pageData, tab: 2 });
                      }}
                      className={`text-xl font-semibold cursor-pointer ${
                        pageData?.tab === 2
                          ? "underline underline-offset-4"
                          : ""
                      } `}
                    >
                      About Service
                    </p>
                  </div>

                  {data?.data?.serviceData?.map((cat, idx) => (
                    <div
                      key={idx}
                      className="my-6 border-b-2 border-theme-gray"
                    >
                      <p className="text-2xl font-semibold mb-4">{cat?.name}</p>

                      {cat?.category?.name && (
                        <p className="text-xl font-bold mb-2 text-theme-blue font-youth">
                          {cat.category.name}
                        </p>
                      )}
                      {cat?.category?.subCategories?.map((subCat, subIdx) => (
                        <div
                          key={subIdx}
                          className="flex justify-between items-end my-5"
                        >
                          <div>
                            <h4 className="text-2xl">{subCat?.name}</h4>
                            <p className="text-xl text-theme-psGray">
                              Light and dark clothes washed together at 30°C.
                              You can request 45°C instead.
                            </p>
                          </div>
                          <div className="flex gap-5 items-center">
                            <p>{parseFloat(subCat?.price)?.toFixed(2)}$</p>
                            <p className="rounded-lg border-2 border-theme-gray flex justify-center items-center font-semibold size-12">
                              <FaPlus size={25} />
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="grid grid-cols-5 gap-5">
                    <div className="flex h-[56px] items-center gap-x-3 rounded-lg px-2 border-2 border-theme-gray-2">
                      <div className="bg-[#BAEBFF] rounded-full shrink-0 size-10 flex justify-center items-center">
                        <AiOutlinePercentage size="20" />
                      </div>

                      <p>Save up to 30 %</p>
                    </div>

                    <div className="flex h-[56px] items-center justify-between gap-x-3 rounded-lg px-2 border-2 border-theme-gray-2 cursor-pointer">
                      <div>
                        <p>20 Loads</p>
                        <p>$17.34/ load</p>
                      </div>
                      <div className="flex items-end h-full p-2">
                        <FaArrowRightLong className="text-2xl text-[#0890F1]" />
                      </div>
                    </div>
                    <div className="flex h-[56px] items-center justify-between gap-x-3 rounded-lg px-2 border-2 border-theme-gray-2 cursor-pointer">
                      <div>
                        <p>10 Loads</p>
                        <p>$17.34/ load</p>
                      </div>
                      <div className="flex items-end h-full p-2">
                        <FaArrowRightLong className="text-2xl text-[#0890F1]" />
                      </div>
                    </div>
                    <div className="flex h-[56px] items-center justify-between gap-x-3 rounded-lg px-2 border-2 border-theme-gray-2 cursor-pointer">
                      <div>
                        <p>5 Loads</p>
                        <p>$17.34/ load</p>
                      </div>
                      <div className="flex items-end h-full p-2">
                        <FaArrowRightLong className="text-2xl text-[#0890F1]" />
                      </div>
                    </div>
                  </div>

                  {/* <div className="w-full my-10 space-y-5">
                    <hr className="w-full h-[2px] bg-theme-gray rounded-full" />
                    <div className="">
                      <h4 className="text-2xl">Mixed wash (up to 6 kg)</h4>
                      <p className="text-xl text-theme-psGray">
                        Light and dark clothes washed together at 30 C. You can
                        request 45 C instead.
                      </p>
                    </div>
                    <hr className="w-full h-[2px] bg-theme-gray rounded-full" />
                    <div className="">
                      <h4 className="text-2xl">Mixed wash (up to 6 kg)</h4>
                      <p className="text-xl text-theme-psGray">
                        Light and dark clothes washed together at 30 C. You can
                        request 45 C instead.
                      </p>
                    </div>
                    <hr className="w-full h-[2px] bg-theme-gray rounded-full" />
                  </div> */}

                  <div className="w-full h-[56px] bg-theme-blue text-white rounded-lg px-4 flex flex-col justify-center my-10 cursor-pointer">
                    <p>Not sure how much you have?</p>
                    <h6 className="font-semibold">Get an estimate</h6>
                  </div>
                </div>
              </div>
            </div>

            {/*footer section  */}
            <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
          </div>
        )}
      </HomeClientWrapper>
    </>
  );
}
