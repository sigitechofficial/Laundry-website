import React, { useState } from "react";
import { GoArrowUp, GoClock } from "react-icons/go";
import { IoBagCheck, IoLocation } from "react-icons/io5";
import { PurpleButton } from "../Buttons";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function OrderHistory() {
  const [order, setOrder] = useState("");
  return (
    <section className="w-full mt-16 px-10">
      <h2 className="font-youth font-medium text-[40px] mb-4">
        Here's What You've Ordered
      </h2>

      <div className="w-full flex gap-5">
        <div className="w-full font-sf space-y-5">
          <div
            onClick={() => setOrder(1)}
            className="w-full max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-5 py-3 space-y-2"
          >
            <h6 className="font-youth font-bold text-lg">
              Order ID: 13225451212314
            </h6>

            <div className="w-full flex justify-between items-center">
              <button className="bg-theme-skyBlue rounded-full shrink-0 text-[#0391C4] font-youth font-bold text-sm p-3">
                Confirmed
              </button>

              <p className="font-youth font-bold text-base">Est $105.00</p>
            </div>

            <div className="w-full flex justify-between items-center border-b">
              <div className="flex gap-2 items-center py-2">
                <GoArrowUp size={25} />
                <div>
                  <p className="font-sf text-lg text-theme-psGray leading-tight">
                    Pick up
                  </p>
                  <p className="font-sf text-xl">Tue 18 Jan</p>
                </div>
              </div>

              <p className="font-youth font-bold text-base flex items-center gap-2">
                <GoClock size="20" />
                7:00 - 8:00
              </p>
            </div>

            <div className="w-full flex justify-between items-center">
              <div className="flex gap-2 items-center py-2">
                <GoArrowUp size={25} />
                <div>
                  <p className="font-sf text-lg text-theme-psGray leading-tight">
                    Drop off
                  </p>
                  <p className="font-sf text-xl">Wed 18 Jan</p>
                </div>
              </div>

              <p className="font-youth font-bold text-base flex items-center gap-2">
                <GoClock size="20" />
                7:00 - 8:00
              </p>
            </div>

            <p className="font-sf text-base text-theme-psGray">
              Driver Instruction
            </p>
          </div>
          <div
            onClick={() => setOrder(2)}
            className="w-full max-w-[859px] rounded-2xl bg-[#FBFBFB] shadow-theme-shadow-light px-5 py-3 space-y-2"
          >
            <h6 className="font-youth font-bold text-lg">
              Order ID: 13225451212314
            </h6>

            <div className="w-full flex justify-between items-center">
              <button className="bg-[#319F4333] rounded-full shrink-0 text-[#23A538] font-youth font-bold text-sm p-3">
                Delivered
              </button>

              <p className="font-youth font-bold text-base text-[#23A538]">
                Est $105.00
              </p>
            </div>

            <div className="w-full flex justify-between items-center border-b">
              <div className="flex gap-2 items-center py-2">
                <GoArrowUp size={25} />
                <div>
                  <p className="font-sf text-lg text-theme-psGray leading-tight">
                    Pick up
                  </p>
                  <p className="font-sf text-xl">Tue 18 Jan</p>
                </div>
              </div>

              <p className="font-youth font-bold text-base flex items-center gap-2">
                <GoClock size="20" />
                7:00 - 8:00
              </p>
            </div>

            <div className="w-full flex justify-between items-center">
              <div className="flex gap-2 items-center py-2">
                <GoArrowUp size={25} />
                <div>
                  <p className="font-sf text-lg text-theme-psGray leading-tight">
                    Drop off
                  </p>
                  <p className="font-sf text-xl">Wed 18 Jan</p>
                </div>
              </div>

              <p className="font-youth font-bold text-base flex items-center gap-2">
                <GoClock size="20" />
                7:00 - 8:00
              </p>
            </div>

            <p className="font-sf text-base text-theme-psGray">
              Driver Instruction
            </p>
          </div>
        </div>

        {order ? (
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
                  <h4 className="text-sm text-theme-psGray">Additional fee</h4>
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
        ) : (
          ""
        )}
      </div>
    </section>
  );
}
