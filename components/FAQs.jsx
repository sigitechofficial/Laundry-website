"use client";
import { Accordion, AccordionItem } from "@heroui/react";
import { FiPlus, FiMinus, FiHelpCircle } from "react-icons/fi";
import { useGetFAQsQuery } from "../src/app/store/services/api";

const extractFaqsArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.message)) return data.message;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.faqs)) return data.faqs;
  if (Array.isArray(data?.faq)) return data.faq;
  if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    const inner = data.data;
    if (Array.isArray(inner?.faqs)) return inner.faqs;
    if (Array.isArray(inner?.faq)) return inner.faq;
    if (Array.isArray(inner?.items)) return inner.items;
    if (Array.isArray(inner?.records)) return inner.records;
    if (typeof inner === "object" && inner !== null) return Object.values(inner);
  }
  return [];
};

export default function FAQs() {
  const { data, isLoading, isError } = useGetFAQsQuery();

  const faqs = extractFaqsArray(data);

  return (
    <div className="w-full bg-white flex justify-center items-center">
      <div className="shadow-theme-shadow rounded-[40px] my-10 sm:my-16 w-full max-w-[625px] px-1 sm:px-3 pb-2">
        <div className="py-5 sm:py-10 sm:space-y-4">
          <h4 className="font-youth font-bold text-2xl sm:text-5xl tracking-tighter uppercase text-center">
            FAQS
          </h4>

          <p className="font-sf text-xl sm:text-[40px] font-medium text-center">
            Wants to know more?
          </p>
        </div>

        <div>
          {isLoading ? (
            <div className="py-10 text-center font-sf text-theme-gray">
              Loading FAQs...
            </div>
          ) : isError ? (
            <div className="py-10 text-center font-sf text-red-500">
              Unable to load FAQs. Please try again later.
            </div>
          ) : !faqs?.length ? (
            <div className="py-10 text-center font-sf text-theme-gray">
              No FAQs available at the moment.
            </div>
          ) : (
            <Accordion>
              {faqs
                .filter((faq) => faq?.status !== false)
                .map((faq, index) => (
                  <AccordionItem
                    key={faq.id ?? faq.faqId ?? index}
                    aria-label={faq.question}
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
                        <FiHelpCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-black" aria-hidden />
                        <p>{faq.question}</p>
                      </div>
                    }
                  >
                    <div className="px-10 pb-4 font-sf text-base sm:text-lg text-theme-gray-3">
                      {faq.answer}
                    </div>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
