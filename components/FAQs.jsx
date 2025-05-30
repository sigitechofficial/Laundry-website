"use client";
import { Accordion, AccordionItem } from "@heroui/react";
import { HiChevronDown } from "react-icons/hi2";
import { FiPlus, FiMinus } from "react-icons/fi";

export default function FAQs() {
  return (
    <div className="w-full bg-white flex justify-center items-center px-5 md:px-[40px]">
      <div className="shadow-theme-shadow rounded-[40px] my-16 w-full max-w-[625px] px-3 pb-10">
        <div className="py-8 sm:py-10">
          <h4 className="font-youth font-bold text-2xl sm:text-5xl tracking-tighter uppercase text-center">
            FAQS
          </h4>

          <p className="font-sf text-xl sm:text-[40px] font-medium text-center">
            Wants to know more?
          </p>
        </div>

        <div>
          <Accordion>
            <AccordionItem
              key="1"
              aria-label="Accordion 1"
              indicator={({ isOpen }) =>
                isOpen ? (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center rotate-90">
                    <FiMinus size={25} color="black" />
                  </div>
                ) : (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center">
                    <FiPlus size={25} color="black" />
                  </div>
                )
              }
              title={
                <div className="flex items-center gap-2 sm:gap-x-4 font-sf font-medium text-base sm:text-xl px-2">
                  <img
                    className="w-6 sm:w-7"
                    src="/images/landingPage/starBadge.png"
                    alt=""
                  />
                  <p>Care of Laundry</p>
                </div>
              }
            >
              <div className="px-10"> rsdsd</div>
            </AccordionItem>
            <AccordionItem
              key="2"
              aria-label="Accordion 2"
              indicator={({ isOpen }) =>
                isOpen ? (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center rotate-90">
                    <FiMinus size={25} color="black" />
                  </div>
                ) : (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center">
                    <FiPlus size={25} color="black" />
                  </div>
                )
              }
              title={
                <div className="flex items-center gap-2 sm:gap-x-4 font-sf font-medium text-base sm:text-xl px-2">
                  <img
                    className="w-6 sm:w-7"
                    src="/images/landingPage/dollar.png"
                    alt=""
                  />
                  <p>Pricing & Payment</p>
                </div>
              }
            >
              <div className="px-10"> rsdsd</div>
            </AccordionItem>
            <AccordionItem
              key="3"
              aria-label="Accordion 3"
              indicator={({ isOpen }) =>
                isOpen ? (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center rotate-90">
                    <FiMinus size={25} color="black" />
                  </div>
                ) : (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center">
                    <FiPlus size={25} color="black" />
                  </div>
                )
              }
              title={
                <div className="flex items-center gap-2 sm:gap-x-4 font-sf font-medium text-base sm:text-xl px-2">
                  <img
                    className="w-6 sm:w-7"
                    src="/images/landingPage/car.png"
                    alt=""
                  />
                  <p>Pickup/Drop-off</p>
                </div>
              }
            >
              <div className="px-10"> rsdsd</div>
            </AccordionItem>
            <AccordionItem
              key="4"
              aria-label="Accordion 4"
              indicator={({ isOpen }) =>
                isOpen ? (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center rotate-90">
                    <FiMinus size={25} color="black" />
                  </div>
                ) : (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center">
                    <FiPlus size={25} color="black" />
                  </div>
                )
              }
              title={
                <div className="flex items-center gap-2 sm:gap-x-4 font-sf font-medium text-base sm:text-xl px-2">
                  <img
                    className="w-6 sm:w-7"
                    src="/images/landingPage/card.png"
                    alt=""
                  />
                  <p>Laundry Support</p>
                </div>
              }
            >
              <div className="px-10"> rsdsd</div>
            </AccordionItem>
            <AccordionItem
              key="5"
              aria-label="Accordion 5"
              indicator={({ isOpen }) =>
                isOpen ? (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center rotate-90">
                    <FiMinus size={25} color="black" />
                  </div>
                ) : (
                  <div className="bg-theme-gray size-8 sm:size-10 rounded-full flex justify-center items-center">
                    <FiPlus size={25} color="black" />
                  </div>
                )
              }
              title={
                <div className="flex items-center gap-2 sm:gap-x-4 font-sf font-medium text-base sm:text-xl px-2">
                  <img
                    className="w-6 sm:w-7"
                    src="/images/landingPage/bitBucket.png"
                    alt=""
                  />
                  <p>Limitation</p>
                </div>
              }
            >
              <div className="px-10"> rsdsd</div>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
