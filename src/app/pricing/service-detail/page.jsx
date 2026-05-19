"use client";
import React, { useEffect, useState } from "react";
import Header from "../../../../components/Header";
import ServiceChip from "../../../../components/ServiceChip";
import { useSearchParams } from "next/navigation";
import { MdArrowBackIos } from "react-icons/md";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa6";
import Footer from "../../../../components/Footer";
import HomeClientWrapper from "../../../../utilities/Test";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { useGetServiceDetailsQuery } from "@/app/store/services/api";
import { MiniLoader } from "../../../../components/Loader";

export const dynamic = "force-dynamic";

export default function ServiceDetail() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const dispatch = useDispatch();

  const { data, isLoading } = useGetServiceDetailsQuery();
  const services = data?.data?.serviceData ?? [];

  const [selectedServiceId, setSelectedServiceId] = useState(
    urlId ? Number(urlId) : null
  );

  useEffect(() => {
    if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].serviceId);
    }
  }, [services, selectedServiceId]);

  const [activeTab, setActiveTab] = useState(1);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (subCat, categoryName, serviceId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === subCat.id && i.serviceId === serviceId);
      if (existing) {
        return prev.map((i) =>
          i.id === subCat.id && i.serviceId === serviceId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          id: subCat.id,
          name: subCat.name,
          price: parseFloat(subCat.price),
          quantity: 1,
          categoryName,
          serviceId,
        },
      ];
    });
  };

  const changeQty = (id, serviceId, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id && i.serviceId === serviceId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id, serviceId) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.serviceId === serviceId)));
  };

  const estimatedTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const selectedService =
    services.find((s) => s.serviceId === selectedServiceId) ?? services[0];

  return (
    <HomeClientWrapper>
      {isLoading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <MiniLoader />
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full relative">
            <div className="max-xl:fixed max-xl:z-50 w-full">
              <Header type="service" />
            </div>

            <div className="w-full max-w-[1290px] mx-auto font-sf px-5 sm:px-[45px] pt-20 sm:pt-24 pb-12 lg:pb-16">
              <Link
                href="/pricing"
                onClick={() => dispatch(setPage(true))}
                className="inline-flex items-center gap-2 mb-6 sm:mb-8 text-black hover:opacity-70 transition-opacity"
              >
                <MdArrowBackIos size={18} />
                <span className="font-sf text-base sm:text-lg">Service List</span>
              </Link>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-1">
                {services.map((svc) => (
                  <ServiceChip
                    key={svc.serviceId}
                    label={svc.service.name}
                    isSelected={svc.serviceId === selectedServiceId}
                    onClick={() => {
                      setSelectedServiceId(svc.serviceId);
                      setActiveTab(1);
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-6 sm:mb-8">
                    <button
                      type="button"
                      onClick={() => setActiveTab(1)}
                      className={`font-youth font-bold text-3xl sm:text-4xl text-left transition-colors ${
                        activeTab === 1 ? "text-black" : "text-theme-psGray hover:text-black"
                      }`}
                    >
                      Prices
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab(2)}
                      className={`font-sf text-base sm:text-lg transition-colors ${
                        activeTab === 2
                          ? "text-black font-semibold underline underline-offset-4"
                          : "text-theme-psGray hover:text-black"
                      }`}
                    >
                      About Service
                    </button>
                  </div>

                  {activeTab === 1 && (
                    <>
                      {selectedService?.categories?.length ? (
                        selectedService.categories.map((cat, idx) => (
                          <div
                            key={cat.categoryId ?? idx}
                            className="border-b border-theme-gray pb-6 mb-6 last:mb-0"
                          >
                            <h2 className="font-youth font-bold text-xl sm:text-2xl text-black mb-4">
                              {cat.category.name}
                            </h2>
                            {cat.subCategories?.length ? (
                              <div className="space-y-5">
                                {cat.subCategories.map((subCat) => {
                                  const cartItem = cartItems.find(
                                    (i) =>
                                      i.id === subCat.id &&
                                      i.serviceId === selectedServiceId
                                  );
                                  return (
                                    <div
                                      key={subCat.id}
                                      className="flex justify-between items-start gap-4"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-sf font-semibold text-base sm:text-lg text-black">
                                          {subCat.name}
                                        </h3>
                                        <p className="font-sf text-sm text-theme-psGray mt-1 leading-snug">
                                          {cat.category.description?.trim() ||
                                            "Professional care for your garments."}
                                        </p>
                                      </div>
                                      <div className="flex gap-3 sm:gap-4 items-center shrink-0">
                                        <p className="font-sf font-semibold text-base sm:text-lg text-black">
                                          ${parseFloat(subCat.price).toFixed(2)}
                                        </p>
                                        {cartItem ? (
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                changeQty(subCat.id, selectedServiceId, -1)
                                              }
                                              className="rounded-lg border border-theme-gray flex justify-center items-center size-9 sm:size-10 hover:bg-theme-gray transition-colors"
                                            >
                                              <FaMinus size={12} />
                                            </button>
                                            <span className="w-6 text-center font-semibold text-base">
                                              {cartItem.quantity}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                changeQty(subCat.id, selectedServiceId, 1)
                                              }
                                              className="rounded-lg border border-theme-gray flex justify-center items-center size-9 sm:size-10 hover:bg-theme-gray transition-colors"
                                            >
                                              <FaPlus size={12} />
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addToCart(
                                                subCat,
                                                cat.category.name,
                                                selectedServiceId
                                              )
                                            }
                                            className="rounded-lg border border-theme-gray flex justify-center items-center size-10 sm:size-11 hover:bg-theme-gray transition-colors text-black"
                                          >
                                            <FaPlus size={18} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="font-sf text-sm text-theme-psGray">
                                {cat.category.description?.trim() ||
                                  "Pricing available on request."}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="font-sf text-base text-theme-psGray">
                          No pricing available for this service yet.
                        </p>
                      )}
                    </>
                  )}

                  {activeTab === 2 && (
                    <div className="space-y-4">
                      <p className="font-sf text-base sm:text-lg text-theme-psGray leading-relaxed">
                        {selectedService?.service?.description}
                      </p>
                      {selectedService?.categories?.length > 0 && (
                        <div className="space-y-3">
                          <h2 className="font-youth font-bold text-xl text-black">
                            Available categories
                          </h2>
                          <ul className="list-disc pl-5 space-y-1 font-sf text-base text-theme-psGray">
                            {selectedService.categories.map((cat) => (
                              <li key={cat.categoryId}>{cat.category.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab(1)}
                        className="font-sf text-base text-theme-blue underline underline-offset-4"
                      >
                        View prices
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
                  <div className="sticky top-24 rounded-2xl border border-theme-gray shadow-theme-shadow-light overflow-hidden">
                    <div className="bg-theme-gray px-5 py-4">
                      <h2 className="font-youth font-bold text-lg text-black">
                        Order Summary
                      </h2>
                      {cartItems.length > 0 && (
                        <p className="text-sm text-black/60 mt-0.5 font-sf">
                          {cartItems.reduce((s, i) => s + i.quantity, 0)} item
                          {cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <div className="px-5 py-4 bg-white min-h-[120px]">
                      {cartItems.length === 0 ? (
                        <p className="text-black/40 text-base text-center py-6 font-sf">
                          Add items to see your estimate
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {cartItems.map((item) => (
                            <li
                              key={`${item.serviceId}-${item.id}`}
                              className="flex items-start gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight">
                                  {item.name}
                                </p>
                                <p className="text-xs text-black/50">{item.categoryName}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.id, item.serviceId, -1)}
                                  className="size-7 rounded border border-theme-gray flex justify-center items-center hover:bg-theme-gray transition-colors"
                                >
                                  <FaMinus size={10} />
                                </button>
                                <span className="w-5 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.id, item.serviceId, 1)}
                                  className="size-7 rounded border border-theme-gray flex justify-center items-center hover:bg-theme-gray transition-colors"
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-semibold w-14 text-right">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id, item.serviceId)}
                                  className="text-black/30 hover:text-red-500 transition-colors"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {cartItems.length > 0 && (
                      <div className="border-t border-theme-gray px-5 py-4 bg-white">
                        <div className="flex justify-between items-center font-sf text-base font-semibold">
                          <span>Estimated Total</span>
                          <span className="text-theme-blue text-lg">
                            ${estimatedTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      )}
    </HomeClientWrapper>
  );
}
