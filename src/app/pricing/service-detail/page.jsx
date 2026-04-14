"use client";
import React, { useEffect, useState } from "react";
import Header from "../../../../components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { MdArrowBackIos, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbIroningSteam, TbWash } from "react-icons/tb";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa6";
import Footer from "../../../../components/Footer";
import HomeClientWrapper from "../../../../utilities/Test";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPage } from "@/app/store/slices/cartItemSlice";
import { useGetServiceDetailsQuery } from "@/app/store/services/api";
import { MiniLoader } from "../../../../components/Loader";
export const dynamic = "force-dynamic";

// Map backend serviceId → icon + colour tokens
const SERVICE_CONFIG = {
  1: { Icon: TbWash, bannerBg: "bg-[#0890F1]", iconBg: "bg-theme-blue-2" },
  2: { Icon: TbIroningSteam, bannerBg: "bg-card-pink", iconBg: "bg-card-pink" },
  3: { Icon: MdOutlineDryCleaning, bannerBg: "bg-card-green", iconBg: "bg-card-green" },
  4: { Icon: TbIroning, bannerBg: "bg-[#FFD06D]", iconBg: "bg-[#FFD06D]" },
};
const DEFAULT_CONFIG = { Icon: TbWash, bannerBg: "bg-theme-blue", iconBg: "bg-theme-blue-2" };

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

  // cartItems: { id, name, price, quantity, categoryName, serviceId }
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

  const estimatedTotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const selectedService =
    services.find((s) => s.serviceId === selectedServiceId) ?? services[0];
  const cfg = SERVICE_CONFIG[selectedServiceId] ?? DEFAULT_CONFIG;
  const { Icon, bannerBg, iconBg } = cfg;

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

            <div className="w-full max-w-[1290px] mx-auto font-sf px-5 sm:px-[45px] pt-20 sm:pt-[90px] lg:pt-20">
              {/* Back link */}
              <Link
                href="/pricing"
                onClick={() => dispatch(setPage(true))}
                className="flex items-center gap-2 mb-[40px]"
              >
                <MdArrowBackIos size={20} />
                <p className="text-xl">Service List</p>
              </Link>

              {/* Dynamic service tabs */}
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(services.length, 5)}, minmax(0, 1fr))`,
                }}
              >
                {services.map((svc) => {
                  const tabCfg = SERVICE_CONFIG[svc.serviceId] ?? DEFAULT_CONFIG;
                  const TabIcon = tabCfg.Icon;
                  const isActive = svc.serviceId === selectedServiceId;
                  return (
                    <div
                      key={svc.serviceId}
                      onClick={() => {
                        setSelectedServiceId(svc.serviceId);
                        setActiveTab(1);
                      }}
                      className={`flex h-[56px] items-center gap-x-3 cursor-pointer rounded px-2 border-2 border-theme-gray transition-colors ${
                        isActive ? "bg-theme-blue text-white" : "text-black"
                      }`}
                    >
                      <div className={`${tabCfg.iconBg} rounded-full shrink-0 size-10 flex justify-center items-center`}>
                        <TabIcon size="25" />
                      </div>
                      <p className="font-semibold text-lg truncate">{svc.service.name}</p>
                    </div>
                  );
                })}
              </div>

              {/* Banner */}
              {selectedService && (
                <div className="w-full rounded-none bg-[#BAEBFF] flex justify-between items-center px-4 py-4 my-8 gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-youth font-bold text-2xl sm:text-3xl text-theme-blue leading-tight">
                      {selectedService.service.name}
                    </h4>
                    <p className="text-sm sm:text-base text-theme-darkBlue mt-1">
                      {selectedService.service.description}
                    </p>
                  </div>
                  <div className={`${bannerBg} rounded-full shrink-0 size-20 flex justify-center items-center`}>
                    <Icon size="55" />
                  </div>
                </div>
              )}

              {/* Two-column layout: items list + cart card */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* LEFT — Prices / About Service */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-5 mb-2">
                    <p
                      onClick={() => setActiveTab(1)}
                      className={`text-xl font-semibold cursor-pointer ${activeTab === 1 ? "underline underline-offset-4" : ""}`}
                    >
                      Prices
                    </p>
                    <p
                      onClick={() => setActiveTab(2)}
                      className={`text-xl font-semibold cursor-pointer ${activeTab === 2 ? "underline underline-offset-4" : ""}`}
                    >
                      About Service
                    </p>
                  </div>

                  {/* Prices tab */}
                  {activeTab === 1 && (
                    <>
                      {selectedService?.categories?.length ? (
                        selectedService.categories.map((cat, idx) => (
                          <div key={cat.categoryId ?? idx} className="my-6 border-b-2 border-theme-gray">
                            <p className="text-xl font-bold mb-2 text-theme-blue font-youth">
                              {cat.category.name}
                            </p>
                            {cat.subCategories?.length ? (
                              cat.subCategories.map((subCat) => {
                                const cartItem = cartItems.find(
                                  (i) => i.id === subCat.id && i.serviceId === selectedServiceId
                                );
                                return (
                                  <div key={subCat.id} className="flex justify-between items-center my-5">
                                    <div>
                                      <h4 className="text-2xl">{subCat.name}</h4>
                                      <p className="text-xl text-theme-psGray">
                                        {cat.category.description?.trim() || "Professional care for your garments."}
                                      </p>
                                    </div>
                                    <div className="flex gap-4 items-center shrink-0">
                                      <p className="font-semibold text-lg">
                                        ${parseFloat(subCat.price).toFixed(2)}
                                      </p>
                                      {cartItem ? (
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => changeQty(subCat.id, selectedServiceId, -1)}
                                            className="rounded-lg border-2 border-theme-gray flex justify-center items-center size-10 hover:bg-theme-gray transition-colors"
                                          >
                                            <FaMinus size={14} />
                                          </button>
                                          <span className="w-6 text-center font-semibold text-lg">
                                            {cartItem.quantity}
                                          </span>
                                          <button
                                            onClick={() => changeQty(subCat.id, selectedServiceId, 1)}
                                            className="rounded-lg border-2 border-theme-gray flex justify-center items-center size-10 hover:bg-theme-gray transition-colors"
                                          >
                                            <FaPlus size={14} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => addToCart(subCat, cat.category.name, selectedServiceId)}
                                          className="rounded-lg border-2 border-theme-gray flex justify-center items-center font-semibold size-12 hover:bg-theme-gray transition-colors"
                                        >
                                          <FaPlus size={25} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-theme-psGray text-lg my-4">
                                {cat.category.description?.trim() || "Pricing available on request."}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-theme-psGray text-lg mt-6">
                          No pricing available for this service yet.
                        </p>
                      )}
                    </>
                  )}

                  {/* About Service tab */}
                  {activeTab === 2 && (
                    <div className="mt-6 space-y-4">
                      <p className="text-xl text-black/80 leading-relaxed">
                        {selectedService?.service?.description}
                      </p>
                      {selectedService?.categories?.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <h4 className="font-semibold text-lg">Available categories:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-black/70 text-base">
                            {selectedService.categories.map((cat) => (
                              <li key={cat.categoryId}>{cat.category.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* RIGHT — Order summary card (sticky) */}
                <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
                  <div className="sticky top-24 rounded-2xl border border-theme-gray shadow-theme-shadow-light overflow-hidden">
                    {/* Card header */}
                    <div className="bg-theme-gray px-5 py-4">
                      <h4 className="font-youth font-bold text-lg text-black">
                        Order Summary
                      </h4>
                      {cartItems.length > 0 && (
                        <p className="text-sm text-black/60 mt-0.5">
                          {cartItems.reduce((s, i) => s + i.quantity, 0)} item
                          {cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 bg-white min-h-[120px]">
                      {cartItems.length === 0 ? (
                        <p className="text-black/40 text-base text-center py-6">
                          Add items to see your estimate
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {cartItems.map((item) => (
                            <li key={`${item.serviceId}-${item.id}`} className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight">{item.name}</p>
                                <p className="text-xs text-black/50">{item.categoryName}</p>
                              </div>

                              {/* Qty controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => changeQty(item.id, item.serviceId, -1)}
                                  className="size-7 rounded border border-theme-gray flex justify-center items-center hover:bg-theme-gray transition-colors"
                                >
                                  <FaMinus size={10} />
                                </button>
                                <span className="w-5 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => changeQty(item.id, item.serviceId, 1)}
                                  className="size-7 rounded border border-theme-gray flex justify-center items-center hover:bg-theme-gray transition-colors"
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>

                              {/* Line total + remove */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-semibold w-14 text-right">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button
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

                    {/* Totals + CTA */}
                    {cartItems.length > 0 && (
                      <div className="border-t border-theme-gray px-5 py-4 bg-white space-y-3">
                        <div className="flex justify-between items-center text-base font-semibold">
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
