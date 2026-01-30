"use client";
import React, { useState, useEffect } from "react";
import Header from "../../../../components/Header";
import InputField from "../../../../components/InputHeroUi";
import SelectHero from "../../../../components/SelectHero";
import { ButtonContinueWith } from "../../../../components/Buttons";
import Footer from "../../../../components/Footer";
import RadioBtn from "../../../../components/RadioBtn";
import { Switch } from "@heroui/react";
import { MiniLoader } from "../../../../components/Loader";
import HomeClientWrapper from "../../../../utilities/Test";

export default function PartnerRegistration() {
  const [step, setStep] = useState(1);
  const [subStep3, setSubStep3] = useState(1);

  // Reset subStep3 when entering step 3
  useEffect(() => {
    if (step === 3) {
      setSubStep3(1);
    }
  }, [step]);
  return (
    <HomeClientWrapper>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header />
        </div>
        <div className="w-full flex justify-center items-center bg-registration bg-cover bg-center bg-no-repeat relative px-5 sm:px-[45px]">
          <div className="flex justify-center items-center w-full min-h-[400px] sm:min-h-[500px] md:h-[600px] lg:h-[700px] max-w-[1290px] mx-auto pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16">
            <div className="text-white relative z-10 w-full max-w-[1290px]">
              <h2 className="font-youth font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-[70px] leading-tight">
                Thanks for your interest in partnering with Just Dry Cleaner!
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mt-4 sm:mt-6">
                We're excited to learn more about your dry cleaning facility.
                Please complete this brief questionnaire so we can make sure our
                partnership is a great match.
              </p>
            </div>

            <div className="absolute z-0 top-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent"></div>
          </div>
        </div>

        <div className="w-full py-8 sm:py-12 md:py-16 lg:py-[70px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center relative gap-6 sm:gap-4">
            <hr className="bg-gray-400 h-[2px] rounded-full w-full absolute z-[-1] top-7 sm:top-8 left-0 hidden sm:block" />

            {/* Step 1 - Show on mobile only if current step is 1, always show on desktop */}
            <div
              className={`flex flex-col justify-center items-start sm:items-center gap-3 sm:gap-5 bg-white cursor-pointer group ${step === 1 ? 'w-auto sm:w-auto' : 'hidden sm:flex sm:w-auto'}`}
              onClick={() => setStep(1)}
            >
              <div
                className={`size-12 sm:size-14 md:size-[60px] rounded-full shrink-0 ${step >= 1
                  ? "bg-theme-blue text-white"
                  : "bg-theme-gray text-black"
                  } flex justify-center items-center font-sf font-semibold text-lg sm:text-xl md:text-2xl transition-all duration-200 group-hover:scale-110 ${step >= 1 ? "group-hover:bg-theme-darkBlue" : "group-hover:bg-gray-400"
                  }`}
              >
                1
              </div>

              <p className="font-sf font-semibold text-sm sm:text-base md:text-xl text-center group-hover:text-theme-blue transition-colors">
                Add your <br className="hidden sm:block" /> Information
              </p>
            </div>

            {/* Step 2 - Show on mobile only if current step is 2, always show on desktop */}
            <div
              className={`flex flex-col justify-center items-start sm:items-center gap-3 sm:gap-5 bg-white cursor-pointer group ${step === 2 ? 'w-auto sm:w-auto' : 'hidden sm:flex sm:w-auto'}`}
              onClick={() => setStep(2)}
            >
              <div
                className={`size-12 sm:size-14 md:size-[60px] rounded-full shrink-0 ${step >= 2
                  ? "bg-theme-blue text-white"
                  : "bg-theme-gray text-black"
                  } flex justify-center items-center font-sf font-semibold text-lg sm:text-xl md:text-2xl transition-all duration-200 group-hover:scale-110 ${step >= 2 ? "group-hover:bg-theme-darkBlue" : "group-hover:bg-gray-400"
                  }`}
              >
                2
              </div>

              <p className="font-sf font-semibold text-sm sm:text-base md:text-xl text-center group-hover:text-theme-blue transition-colors">
                Add Address <br className="hidden sm:block" /> Details
              </p>
            </div>

            {/* Step 3 - Show on mobile only if current step is 3, always show on desktop */}
            <div
              className={`flex flex-col justify-center items-start sm:items-center gap-3 sm:gap-5 bg-white cursor-pointer group ${step === 3 ? 'w-auto sm:w-auto' : 'hidden sm:flex sm:w-auto'}`}
              onClick={() => setStep(3)}
            >
              <div
                className={`size-12 sm:size-14 md:size-[60px] rounded-full shrink-0 ${step >= 3
                  ? "bg-theme-blue text-white"
                  : "bg-theme-gray text-black"
                  } flex justify-center items-center font-sf font-semibold text-lg sm:text-xl md:text-2xl transition-all duration-200 group-hover:scale-110 ${step >= 3 ? "group-hover:bg-theme-darkBlue" : "group-hover:bg-gray-400"
                  }`}
              >
                3
              </div>

              <p className="font-sf font-semibold text-sm sm:text-base md:text-xl text-center group-hover:text-theme-blue transition-colors">
                Add Business <br className="hidden sm:block" /> Details
              </p>
            </div>
          </div>

          {step === 1 ? (
            <div className="w-full max-w-[1290px] space-y-4 sm:space-y-5 mx-auto pt-8 sm:pt-12 md:pt-16 px-0 sm:px-0">
              {/* Row 1: Full Name and Email */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Full Name</p>
                  <InputField label="Enter Your Name" type="text" />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Email</p>
                  <InputField label="Your Email" type="email" />
                </div>
              </div>

              {/* Row 2: Contact and Country */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Contact</p>
                  <InputField label="Your Contact" type="number" />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Country</p>
                  <SelectHero label="Select Country" type="text" />
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-8 sm:pt-10 md:pt-14">
                <ButtonContinueWith
                  text="Continue"
                  bg="bg-theme-blue"
                  color="text-white"
                  size="text-base sm:text-lg md:text-xl"
                  onClick={() => setStep(2)}
                />
              </div>
            </div>
          ) : step === 2 ? (
            <div className="w-full max-w-[1290px] space-y-4 sm:space-y-5 mx-auto pt-8 sm:pt-12 md:pt-16 px-0 sm:px-0">
              {/* Row 1: Province and City */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Province</p>
                  <InputField label="Enter Province" type="text" />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">City</p>
                  <InputField label="Your City" type="text" />
                </div>
              </div>

              {/* Row 2: Street Address and Zip Code */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Street Address</p>
                  <InputField label="Street Address" type="text" />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Zip Code</p>
                  <InputField label="Zip Code" type="number" />
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-8 sm:pt-10 md:pt-14">
                <ButtonContinueWith
                  text="Continue"
                  bg="bg-theme-blue"
                  color="text-white"
                  size="text-base sm:text-lg md:text-xl"
                  onClick={() => setStep(3)}
                />
              </div>
            </div>
          ) : step === 3 ? (
            <div className="w-full max-w-[1290px] space-y-4 sm:space-y-5 mx-auto pt-8 sm:pt-12 md:pt-16 px-0 sm:px-0">
              {/* Sub-step 1: Registered Business Name and Add Services */}
              {subStep3 === 1 && (
                <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                  <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">
                      Registered Business Name{" "}
                      <span className="text-theme-psGray font-normal">
                        (Shop Name)
                      </span>{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <InputField label="Enter Shop Name" type="text" />
                  </div>
                  <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">
                      Add Services <span className="text-red-500">*</span>
                    </p>
                    <InputField label="Add Services" type="text" />
                  </div>
                </div>
              )}

              {/* Sub-step 2: Profile Selection and Days of Week */}
              {subStep3 === 2 && (
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
                  {/* Left Column: Profile Selection */}
                  <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">
                      Please select what matches your profile{" "}
                      <span className="text-red-500">*</span>
                    </p>

                    <div className="space-y-3 sm:space-4 font-sf">
                      <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-theme-blue transition-colors cursor-pointer group">
                        <input
                          type="radio"
                          name="profile"
                          value="student"
                          className="accent-theme-darkBlue w-4 h-4 sm:w-5 sm:h-5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 flex-1">
                          ALL IN HOUSE- Washing, Ironing and Dry cleaning all done
                          by us
                        </span>
                      </label>

                      <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-theme-blue transition-colors cursor-pointer group">
                        <input
                          type="radio"
                          name="profile"
                          value="professional"
                          className="accent-theme-darkBlue w-4 h-4 sm:w-5 sm:h-5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 flex-1">
                          OUTSOURCE DRY CLEANING- Washing and Drying handled in
                          house
                        </span>
                      </label>

                      <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-theme-blue transition-colors cursor-pointer group">
                        <input
                          type="radio"
                          name="profile"
                          value="business"
                          className="accent-theme-darkBlue w-4 h-4 sm:w-5 sm:h-5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 flex-1">
                          OUTSOURCE ALL- We are just a shop front that outsources
                          all of the processing
                        </span>
                      </label>

                      <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-theme-blue transition-colors cursor-pointer group">
                        <input
                          type="radio"
                          name="profile"
                          value="other"
                          className="accent-theme-darkBlue w-4 h-4 sm:w-5 sm:h-5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 flex-1">Other</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Days of Week */}
                  <div className="flex-1 font-sf space-y-3 sm:space-y-4">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">
                      What days of the week are you open{" "}
                      <span className="text-red-500">*</span>
                    </p>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm" defaultSelected></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Monday</span>
                        </div>
                        <input
                          type="text"
                          value="7:00 AM - 8:00 PM"
                          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm w-full sm:w-[150px] bg-white text-gray-700 focus:outline-none focus:border-theme-blue"
                          readOnly
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm"></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Tuesday</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm"></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Wednesday</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm"></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Thursday</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm"></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Friday</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm"></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Saturday</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch size="sm"></Switch>
                          <span className="text-sm sm:text-base font-medium text-gray-700">Sunday</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-step 3: Machinery Count and Turnaround Time */}
              {subStep3 === 3 && (
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
                  {/* Left Column: Machinery Count */}
                  <div className="flex-1 font-sf space-y-4 sm:space-y-6">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">
                      What is your count of machinery?{" "}
                      <span className="text-red-500">*</span>
                    </p>

                    <div className="space-y-3 sm:space-y-4 overflow-x-auto">
                      {/* Header Row */}
                      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200 min-w-[400px]">
                        <div className="col-span-1"></div>
                        <div className="text-center">0</div>
                        <div className="text-center">1 - 2</div>
                        <div className="text-center">3 - 5</div>
                        <div className="text-center">5+</div>
                      </div>

                      {/* Washers Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700">Washers</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washers"
                                value="0"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washers"
                                value="1-2"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washers"
                                value="3-5"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washers"
                                value="5+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Dryers Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700">Dryers</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryers"
                                value="0"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryers"
                                value="1-2"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryers"
                                value="3-5"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryers"
                                value="5+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Dry Cleaning Machines Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700 leading-tight">
                            Dry cleaning<br />Machines
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryclean"
                                value="0"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryclean"
                                value="1-2"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryclean"
                                value="3-5"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryclean"
                                value="5+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Presser Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700">Presser</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="presser"
                                value="0"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="presser"
                                value="1-2"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="presser"
                                value="3-5"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="presser"
                                value="5+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Turnaround Time */}
                  <div className="flex-1 font-sf space-y-4 sm:space-y-6">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">
                      What is your Turnaround time (TAT)?
                      <span className="text-red-500"> *</span>
                    </p>

                    <div className="space-y-3 sm:space-y-4 overflow-x-auto">
                      {/* Header Row */}
                      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200 min-w-[400px]">
                        <div className="col-span-1"></div>
                        <div className="text-center">N/A</div>
                        <div className="text-center">24h</div>
                        <div className="text-center">48h</div>
                        <div className="text-center text-[10px] sm:text-xs">More than 48h</div>
                      </div>

                      {/* Wash & Fold Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700">Wash & Fold</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washFold"
                                value="na"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washFold"
                                value="24h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washFold"
                                value="48h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washFold"
                                value="48h+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Dry Cleaning Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700">Dry Cleaning</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryCleaning"
                                value="na"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryCleaning"
                                value="24h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryCleaning"
                                value="48h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="dryCleaning"
                                value="48h+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Wash & Iron Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700 leading-tight">Wash & Iron</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washIron"
                                value="na"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washIron"
                                value="24h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washIron"
                                value="48h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="washIron"
                                value="48h+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Pressing / Ironing Row */}
                      <div className="bg-inputBg rounded-lg border border-gray-200 hover:border-theme-blue transition-colors">
                        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-3 sm:py-4 min-w-[400px]">
                          <div className="font-medium text-sm sm:text-base text-gray-700 leading-tight">Pressing / Ironing<br />(If Applicable)</div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="pressing"
                                value="na"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="pressing"
                                value="24h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="pressing"
                                value="48h"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name="pressing"
                                value="48h+"
                                className="accent-theme-blue w-5 h-5 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Button */}
              <div className="pt-6 sm:pt-8 md:pt-10">
                {subStep3 === 3 ? (
                  <ButtonContinueWith
                    text="Submit"
                    bg="bg-theme-blue"
                    color="text-white"
                    size="text-base sm:text-lg md:text-xl"
                    onClick={() => setStep(4)}
                  />
                ) : (
                  <ButtonContinueWith
                    text="Next"
                    bg="bg-theme-blue"
                    color="text-white"
                    size="text-base sm:text-lg md:text-xl"
                    onClick={() => setSubStep3(subStep3 + 1)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto h-96 flex justify-center items-center">
              <MiniLoader />
            </div>
          )}
        </div>
        {/*footer section  */}
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </HomeClientWrapper>
  );
}
