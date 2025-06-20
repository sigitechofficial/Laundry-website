import React from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { PurpleButton } from "../../../../components/Buttons";
import { IoBagCheck, IoLocation } from "react-icons/io5";

export default function Order() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="order" />
        </div>

        <div className="w-full max-w-[1290px] mx-auto py-[70px] px-5 sm:px-[45px]">
          <h4 className="font-bold font-youth text-6xl">
            Let us know which services you need:
          </h4>

          <div className="flex gap-20 pt-14">
            {/* Cards */}
            <div className="w-full space-y-5">
              <CategoryCard
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
              />
            </div>

            {/* Order */}
            <div className="w-[600px] px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
              <h6 className="font-youth font-bold text-[32px]">
                Order ID: 41212455454
              </h6>

              <div className="flex justify-between items-center font-sf pt-3 pb-6">
                <button className="bg-theme-skyBlue rounded-full shrink-0 text-[#0391C4] font-youth font-bold text-sm p-3">
                  Confirmed
                </button>

                <p className="underline underline-offset-4 text-theme-psGray">
                  Track your order
                </p>
              </div>

              <div className="space-y-4">
                <div className="font-sf space-y-3">
                  <p className="font-youth font-bold">Collection</p>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoLocation size="20" />
                    </div>

                    <p className="text-sm font-medium">Tue 18 Jan</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoLocation size="20" />
                    </div>

                    <p className="text-sm font-medium">Tue 18 Jan</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoLocation size="20" />
                    </div>

                    <p className="text-sm font-medium">Tue 18 Jan</p>
                  </div>
                </div>
                <div className="font-sf space-y-3">
                  <p className="font-youth font-bold">Delivery</p>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoLocation size="20" />
                    </div>

                    <p className="text-sm font-medium">Tue 18 Jan</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoLocation size="20" />
                    </div>

                    <p className="text-sm font-medium">Tue 18 Jan</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoLocation size="20" />
                    </div>

                    <p className="text-sm font-medium">Tue 18 Jan</p>
                  </div>
                </div>
                <div className="font-sf space-y-3">
                  <p className="font-youth font-bold">Address</p>
                  <div className="flex gap-4 items-center">
                    <div>
                      <IoBagCheck />
                    </div>

                    <p className="text-sm font-medium">
                      49 king west, park London, UK
                    </p>
                  </div>
                </div>
                <div className="font-sf space-y-3">
                  <p className="font-youth font-bold">Driver Instruction</p>

                  <p className="text-sm font-medium font-sf">
                    49 king west, park London, UK
                  </p>
                </div>
                <div className="font-sf space-y-3">
                  <p className="font-youth font-bold">Order frequency</p>

                  <p className="text-sm font-medium font-sf">Just once</p>
                </div>
                <PurpleButton text="Track Order" />
                <PurpleButton
                  text="Manage Order"
                  bg="bg-theme-blue"
                  color="text-white"
                />
              </div>

              <div className="space-y-3 mt-8">
                <div className="flex justify-between items-center border-b py-2">
                  <div className="font-sf">
                    <h6 className="font-semibold text-xl">Order details</h6>
                    <p className="text-theme-psGray">6 items</p>
                  </div>

                  <MdKeyboardArrowRight size="25" />
                </div>

                <div className="space-y-1 font-sf border-b pb-3">
                  <div className="flex justify-between items-center ">
                    <h4 className="font-semibold">Subtotal</h4>
                    <p className="font-semibold">CHF 69.00</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-theme-psGray">
                      Minimum order fee
                    </h4>
                    <p className="text-sm text-theme-psGray">CHF 0.00</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-theme-psGray">Service fee</h4>
                    <p className="text-sm text-theme-psGray">CHF 0.00</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm text-theme-psGray">
                      Additional fee
                    </h4>
                    <p className="text-sm text-theme-psGray">CHF 0.00</p>
                  </div>
                </div>

                <div className="space-y-1 font-sf border-b pb-3">
                  <h4 className="font-semibold text-2xl">Payment</h4>

                  <div className="flex justify-between items-center">
                    <div>
                      <h6>MasterCard *******2356</h6>
                      <p>07/13/23, 12:25</p>
                    </div>

                    <p>$18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
