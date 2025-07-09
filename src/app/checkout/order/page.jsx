"use client";
import React, { useState } from "react";
import Header from "../../../../components/Header";
import CategoryCard from "../../../../components/CategoryCard";
import { MdKeyboardArrowRight, MdOutlineDryCleaning } from "react-icons/md";
import { TbIroning, TbWash, TbIroningSteam } from "react-icons/tb";
import { AiOutlinePercentage } from "react-icons/ai";
import { ButtonYouth70018, PurpleButton } from "../../../../components/Buttons";
import { IoBagCheck, IoLocation, IoShirt } from "react-icons/io5";
import { useGetServicesQuery } from "@/app/store/services/api";
import { Spinner, useDisclosure } from "@heroui/react";
import ReusableModal from "../../../../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  setDriverInstruction,
  setDriverTip,
  setPage,
  updatePreference,
} from "@/app/store/slices/cartItemSlice";
import { FaTruck } from "react-icons/fa6";
import { formatDate, to24Hour } from "../../../../utilities/ConversionFunction";
import FAQs from "../../../../components/FAQs";
import Footer from "../../../../components/Footer";
import { useRouter } from "next/navigation";
import HomeClientWrapper from "../../../../utilities/Test";
import InputField from "../../../../components/InputHeroUi";

export default function Order() {
  const dispatch = useDispatch();
  const orderData = useSelector((state) => state.cart.orderData);
  const preferencesData = useSelector((state) => state.cart.preferences);
  const router = useRouter();
  const { data, isLoading } = useGetServicesQuery();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalScroll, setModalScroll] = useState(false);
  const [modal, setModal] = useState({
    modType: "wash",
    step: "",
  });
  const [preferences, setPreferences] = useState({
    detergent: "scented",
    fabricSoftener: true,
    oxiClean: true,
    washService: "mixed",
    temperature: "30 C",
    additionalInstructions: "",
    //for ironing
    ironingAfter: "hung", // or "folded"
    ironingTemperature: "30 C",
    additionalInstructionsIroning: "",
  });

  function handleModalScroll(e) {
    const isScrolled = e.target.scrollTop > 50;
    setModalScroll((prev) => {
      if (prev !== isScrolled) return isScrolled;
      return prev;
    });
  }

  function closePreferenceModal() {
    if (modal.modType === "wash") {
      // Only pick wash-related preferences
      const washPrefs = {
        serviceName: "Wash",
        detergent: preferences.detergent,
        fabricSoftener: preferences.fabricSoftener,
        oxiClean: preferences.oxiClean,
        washService: preferences.washService,
        temperature: preferences.temperature,
        additionalInstructions: preferences.additionalInstructions,
      };
      // Dispatch to redux
      dispatch(updatePreference({ serviceId: 3, data: washPrefs }));
      // Reset only wash-related keys in local state
      setPreferences((prev) => ({
        ...prev,
        detergent: "scented",
        fabricSoftener: true,
        oxiClean: true,
        washService: "mixed",
        temperature: "30 C",
        additionalInstructions: "",
      }));
    } else if (modal.modType === "iron") {
      // Only pick ironing-related preferences
      const ironPrefs = {
        serviceName: "iron",
        ironingAfter: preferences.ironingAfter,
        ironingTemperature: preferences.ironingTemperature,
        additionalInstructionsIroning:
          preferences.additionalInstructionsIroning,
      };
      // Dispatch to redux
      dispatch(updatePreference({ serviceId: 1, data: ironPrefs }));
      // Reset only ironing-related keys in local state
      setPreferences((prev) => ({
        ...prev,
        ironingAfter: "hung",
        ironingTemperature: "30 C",
        additionalInstructionsIroning: "",
      }));
    }
    // You can add similar logic for iron or other services if needed
    setModal({ ...modal, modType: "" });
    onClose();
  }

  return (
    <>
      <HomeClientWrapper>
        <div className="w-full relative">
          <div className="max-xl:fixed max-xl:z-50 w-full">
            <Header type="order" />
          </div>

          <div className="w-full px-5 sm:px-[45px]">
            <div className="w-full max-w-[1290px] mx-auto pt-32 md:pb-[50px] 2xl:py-[70px]">
              <h4 className="font-bold font-youth text-3xl 2xl:text-6xl">
                Let us know which services you need:
              </h4>

              <div className="flex flex-col lg:flex-row gap-10 2xl:gap-20 pt-10">
                {/* Cards */}
                <div className="w-full space-y-5">
                  {!isLoading ? (
                    data?.data?.serviceData?.map((item) => {
                      return item?.id === 1 ? (
                        <CategoryCard
                          onClick={() => {
                            setModal({ ...modal, modType: "iron" });
                            onOpen();
                          }}
                          bg="2"
                          h={item?.name}
                          Icon={TbIroning}
                          src="/images/pricing/c2.png"
                          right="right-0"
                          type={
                            preferencesData?.some(
                              (elem) => elem?.serviceId === 1
                            )
                              ? "check"
                              : "plus"
                          }
                          serviceId={item?.id}
                        />
                      ) : item?.id === 2 ? (
                        <CategoryCard
                          onClick={() => {
                            setModal({ ...modal, modType: "dry cleaning" });
                            onOpen();
                          }}
                          bg="1"
                          h={item?.name}
                          Icon={MdOutlineDryCleaning}
                          src="/images/pricing/c1.png"
                          right="-right-16"
                          type={"plus"}
                          serviceId={item?.id}
                        />
                      ) : item?.id === 3 ? (
                        <CategoryCard
                          onClick={() => {
                            setModal({ ...modal, modType: "wash" });
                            onOpen();
                          }}
                          bg="4"
                          h={item?.name}
                          Icon={TbWash}
                          src="/images/pricing/c4.png"
                          right="-right-10"
                          type={
                            preferencesData?.some(
                              (elem) => elem?.serviceId === 3
                            )
                              ? "check"
                              : "plus"
                          }
                          serviceId={item?.id}
                        />
                      ) : item?.id === 4 ? (
                        <CategoryCard
                          onClick={() => {
                            setModal({ ...modal, modType: "" });
                            onOpen();
                          }}
                          bg="4"
                          h={item?.name}
                          Icon={TbWash}
                          src="/images/pricing/c4.png"
                          right="-right-10"
                          type={"plus"}
                          serviceId={item?.id}
                        />
                      ) : item?.id === 5 ? (
                        <CategoryCard
                          onClick={() => {
                            setModal({ ...modal, modType: "" });
                            onOpen();
                          }}
                          bg="5"
                          h={item?.name}
                          Icon={TbIroningSteam}
                          src="/images/pricing/c5.png"
                          right="-right-6"
                          type={"plus"}
                          serviceId={item?.id}
                        />
                      ) : (
                        "loading..."
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-xl font-semibold w-max mx-auto">
                      <Spinner
                        classNames={{
                          label:
                            "text-foreground mt-4 font-youth font-semibold text-theme-blue animate-pulse",
                        }}
                        size="lg"
                        label="Loading..."
                        variant="wave"
                      />
                    </div>
                  )}
                </div>

                {/* Order */}

                <div className="lg:w-[600px] space-y-4">
                  <div className="px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
                    <div className="flex items-center gap-x-3 my-2">
                      <FaTruck size={20} />

                      <p className="font-sf font-semibold">Pickup</p>
                    </div>

                    <div className="space-y-4">
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Scheduled for</p>
                        <p className="text-theme-psGray">Collection</p>
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoLocation size="20" />
                          </div>

                          <p className="text-sm font-medium">
                            {formatDate(
                              orderData?.collectionData?.collectionDate
                            )}
                          </p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoLocation size="20" />
                          </div>

                          <p className="text-sm font-medium">
                            {to24Hour(
                              orderData?.collectionData?.collectionTimeFrom
                            )}{" "}
                            -{" "}
                            {to24Hour(
                              orderData?.collectionData?.collectionTimeTo
                            )}
                          </p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoLocation size="20" />
                          </div>

                          <p className="text-sm font-medium">
                            {
                              orderData?.collectionData
                                ?.driverInstructionOptions
                            }
                          </p>
                        </div>
                      </div>
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Delivery</p>
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoLocation size="20" />
                          </div>

                          <p className="text-sm font-medium">
                            {formatDate(orderData?.deliveryData?.deliveryDate)}
                          </p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoLocation size="20" />
                          </div>

                          <p className="text-sm font-medium">
                            {to24Hour(
                              orderData?.deliveryData?.deliveryTimeFrom
                            )}{" "}
                            -{" "}
                            {to24Hour(orderData?.deliveryData?.deliveryTimeTo)}
                          </p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div>
                            <IoLocation size="20" />
                          </div>

                          <p className="text-sm font-medium">
                            {orderData?.deliveryData?.driverInstructionOptions1}
                          </p>
                        </div>
                      </div>
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Address</p>

                        <div className="flex gap-4 items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <div>
                              <IoBagCheck />
                            </div>

                            <p className="text-sm font-medium line-clamp-1">
                              {orderData?.collectionData?.streetAddress}
                            </p>
                          </div>

                          <p
                            onClick={() => {
                              history.replaceState(
                                { customData: { step: "get-started" } },
                                ""
                              );
                              router.push("/order-registration");
                            }}
                            className="uppercase cursor-pointer text-theme-blue font-sf font-normal px-2 py-1 border border-black rounded-full shrink-0 text-sm"
                          >
                            Modify
                          </p>
                        </div>
                      </div>
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Driver instructions</p>

                        <div className="flex gap-4 items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <div>
                              <IoBagCheck />
                            </div>

                            <p className="text-sm font-medium">
                              {orderData?.driverInstruction}
                            </p>
                          </div>

                          <p
                            onClick={() => {
                              setModal({
                                ...modal,
                                modType: "driverInstructions",
                              });
                              onOpen();
                            }}
                            className="text-white font-sf font-normal px-3 capitalize py-1 bg-black rounded-full shrink-0 text-sm cursor-pointer"
                          >
                            add
                          </p>
                        </div>
                      </div>
                      <div className="font-sf space-y-3">
                        <p className="text-theme-psGray">Collection Method</p>

                        <p className="text-sm font-medium font-sf">
                          {orderData?.collectionData?.driverInstructionOptions}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ///////////////service preferences///////////// */}

                  <div className="px-4 py-4 shadow-theme-shadow-light rounded-[20px]">
                    <div className="flex items-center justify-center gap-x-3 my-2">
                      <IoShirt size={20} />

                      <p className="font-sf font-semibold">
                        Services Requested
                      </p>
                    </div>

                    {preferencesData?.length > 0 ? (
                      <div>
                        {preferencesData?.map((item, idx) =>
                          item?.serviceId == 3 ? (
                            <div
                              key={idx}
                              className="font-sf pt-3 border-b-2 border-theme-gray pb-3"
                            >
                              {/* Service Name as heading */}
                              {item?.washService && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Service
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.serviceName}
                                  </p>
                                </>
                              )}
                              {/* Preferences Listing */}
                              {item?.washService && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Preferences
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.washService}
                                  </p>
                                </>
                              )}
                              {item?.temperature && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Temperature
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.temperature}
                                  </p>
                                </>
                              )}
                              {item?.detergent && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Detergent
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.detergent}
                                  </p>
                                </>
                              )}
                              {"fabricSoftener" in item && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Fabric Softener
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.fabricSoftener ? "Yes" : "No"}
                                  </p>
                                </>
                              )}
                              {"oxiClean" in item && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Oxi Clean
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.oxiClean ? "Yes" : "No"}
                                  </p>
                                </>
                              )}
                            </div>
                          ) : item?.serviceId == 1 ? (
                            <div
                              key={idx}
                              className="font-sf pt-3 border-b-2 border-theme-gray pb-3"
                            >
                              {/* Ironing preferences */}

                              {item?.serviceName && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Service
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.serviceName}
                                  </p>
                                </>
                              )}

                              {item?.ironingAfter && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    After Ironing
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.ironingAfter}
                                  </p>
                                </>
                              )}
                              {item?.ironingTemperature && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Iron Temperature
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.ironingTemperature}
                                  </p>
                                </>
                              )}
                              {item?.additionalInstructions && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Instructions
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.additionalInstructions}
                                  </p>
                                </>
                              )}
                              {item?.additionalInstructionsIroning && (
                                <>
                                  <p className="text-theme-psGray font-sf">
                                    Instructions
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {item?.additionalInstructionsIroning}
                                  </p>
                                </>
                              )}
                            </div>
                          ) : (
                            "in progress..."
                          )
                        )}
                      </div>
                    ) : (
                      <div className="font-sf pt-3">
                        <p className="text-theme-psGray">Service</p>
                        <p className="text-sm font-medium">Not selected</p>
                      </div>
                    )}

                    <div className="py-3">
                      <ButtonYouth70018
                        isDisabled={
                          preferencesData?.length > 0 &&
                          orderData?.collectionData?.streetAddress
                            ? false
                            : true
                        }
                        text="Continue"
                        onClick={() => {
                          dispatch(setPage(true));
                          router.push("/checkout/payment");
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*FAQs section  */}

          <div className="w-full px-5 sm:px-[45px]">
            <FAQs />
          </div>

          {/*footer section  */}
          <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
        </div>
      </HomeClientWrapper>

      {/* =======================Modal======================== */}

      <ReusableModal
        isDismissable={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        showHeader={true}
        headerTitle="Service Preferences"
        modalScroll={modalScroll}
        onBack={false}
        onClose={false}
        showFooter={true}
        footerContent={
          <div className="w-full flex items-center gap-5 pt-2 mx-6 mb-6">
            <ButtonYouth70018
              text="continue"
              onClick={() => {
                closePreferenceModal();
              }}
            />
          </div>
        }
        onFooterAction={() => false}
        size="xl"
        backdrop="blur"
        className="custom-modal-class max-h-[90vh] overflow-auto"
      >
        {modal?.modType === "wash" ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Service Preferences
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6 font-sf">
              <div className="space-y-2">
                <p className="font-sf text-lg">Detergent</p>
                <div className="grid grid-cols-2 h-[53px]">
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        detergent: "scented",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.detergent === "scented"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    Scented
                  </div>
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        detergent: "hypoallergenic",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.detergent === "hypoallergenic"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    Hypoallergenic
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="space-y-2 w-full">
                    <p className="font-sf text-lg">Fabric Softener</p>
                    <div className="grid grid-cols-2 h-[53px]">
                      <div
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            fabricSoftener: true,
                          }))
                        }
                        className={`flex justify-center items-center cursor-pointer ${
                          preferences.fabricSoftener === true
                            ? "bg-theme-blue text-white"
                            : "bg-theme-gray"
                        }`}
                      >
                        Yes
                      </div>
                      <div
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            fabricSoftener: false,
                          }))
                        }
                        className={`flex justify-center items-center cursor-pointer ${
                          preferences.fabricSoftener === false
                            ? "bg-theme-blue text-white"
                            : "bg-theme-gray"
                        }`}
                      >
                        No
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <p className="font-sf text-lg">Oxi Clean</p>
                    <div className="grid grid-cols-2 h-[53px]">
                      <div
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            oxiClean: true,
                          }))
                        }
                        className={`flex justify-center items-center cursor-pointer ${
                          preferences.oxiClean === true
                            ? "bg-theme-blue text-white"
                            : "bg-theme-gray"
                        }`}
                      >
                        Yes
                      </div>
                      <div
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            oxiClean: false,
                          }))
                        }
                        className={`flex justify-center items-center cursor-pointer ${
                          preferences.oxiClean === false
                            ? "bg-theme-blue text-white"
                            : "bg-theme-gray"
                        }`}
                      >
                        No
                      </div>
                    </div>
                  </div>
                </div>

                <p className="font-sf text-lg">Wash Service</p>
                <div className="grid grid-cols-2 h-[53px]">
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        washService: "mixed",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.washService === "mixed"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    Mixed
                  </div>
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        washService: "white separate",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.washService === "white separate"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    White separate
                  </div>
                </div>
                <div className="grid grid-cols-2 h-[53px]">
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        washService: "dark separate",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.washService === "dark separate"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    Dark separate
                  </div>
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        washService: "white + light mixed",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.washService === "white + light mixed"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    White + light mixed
                  </div>
                </div>

                <p className="font-sf text-lg">Choose Temperature</p>
                <div className="grid grid-cols-4 h-[53px]">
                  {["30 C", "40 C", "50 C", "60 C"].map((temp) => (
                    <div
                      key={temp}
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          temperature: temp,
                        }))
                      }
                      className={`flex justify-center items-center cursor-pointer ${
                        preferences.temperature === temp
                          ? "bg-theme-blue text-white"
                          : "bg-theme-gray"
                      }`}
                    >
                      {temp}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <p className="font-sf text-lg pb-3">
                  Additional Service instructions
                </p>

                <textarea
                  className="w-full h-40 bg-theme-gray rounded-lg p-5 text-base text-theme-gray-2 resize-none outline-none"
                  type="text"
                  name=""
                  id=""
                  placeholder="Enter your instructions"
                  value={preferences.additionalInstructions}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      additionalInstructions: e.target.value,
                    }))
                  }
                />

                <p className="font-sf pb-5 text-sm text-theme-psGray">
                  The user is responsible if the clothes color bleeds due to the
                  selected wash settings and temperature.
                </p>
              </div>
            </div>
          </div>
        ) : modal?.modType === "iron" ? (
          <div
            onScroll={handleModalScroll}
            className="modal-scroll overflow-auto"
          >
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold text-[22px] text-center">
                Service Preferences
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6 font-sf">
              <div className="space-y-2">
                <p className="font-sf text-lg">After ironing:</p>
                <div className="grid grid-cols-2 h-[53px]">
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        ironingAfter: "hung",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.ironingAfter === "hung"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    Hung
                  </div>
                  <div
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        ironingAfter: "folded",
                      }))
                    }
                    className={`flex justify-center items-center cursor-pointer ${
                      preferences.ironingAfter === "folded"
                        ? "bg-theme-blue text-white"
                        : "bg-theme-gray"
                    }`}
                  >
                    Folded
                  </div>
                </div>

                <p className="font-sf text-lg">Choose Iron Temperature</p>
                <div className="grid grid-cols-4 h-[53px]">
                  {["30 C", "40 C", "50 C", "60 C"].map((temp) => (
                    <div
                      key={temp}
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          ironingTemperature: temp,
                        }))
                      }
                      className={`flex justify-center items-center cursor-pointer ${
                        preferences.ironingTemperature === temp
                          ? "bg-theme-blue text-white"
                          : "bg-theme-gray"
                      }`}
                    >
                      {temp}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <p className="font-sf text-lg pb-3">
                  Additional Service instructions
                </p>

                <textarea
                  className="w-full h-40 bg-theme-gray rounded-lg p-5 text-base text-theme-gray-2 resize-none outline-none"
                  type="text"
                  name=""
                  id=""
                  placeholder="Enter your instructions"
                  value={preferences.additionalInstructionsIroning}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      additionalInstructionsIroning: e.target.value,
                    }))
                  }
                />

                <p className="font-sf pb-5 text-sm text-theme-psGray">
                  The user is responsible if the clothes color bleeds due to the
                  selected wash settings and temperature.
                </p>
              </div>
            </div>
          </div>
        ) : modal.modType === "dry cleaning" ? (
          "Dry cleaning preferences will be added soon."
        ) : modal.modType === "driverInstructions" ? (
          <div className="">
            <div className="h-[58px] flex items-center justify-center relative border-b border-theme-gray-2">
              <h4 className="font-youth font-bold sm:text-[22px] text-center">
                Driver instruction
              </h4>

              <p
                onClick={() => onClose()}
                className="font-sf text-base absolute top-4 right-4 cursor-pointer"
              >
                Cancel
              </p>
            </div>

            <div className="w-full px-6 py-6">
              <div className="">
                <p className="font-sf text-lg pb-5">
                  Add instructions for the driver
                </p>

                <textarea
                  className="w-full h-40 bg-theme-gray rounded-lg p-5 text-base text-theme-gray-2 resize-none outline-none"
                  type="text"
                  name=""
                  id=""
                  value={orderData?.driverInstruction}
                  onChange={(e) => {
                    dispatch(setDriverInstruction(e.target.value));
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </ReusableModal>
    </>
  );
}
