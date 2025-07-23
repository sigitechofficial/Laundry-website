"use client";
import React, { useState } from "react";
import Header from "../../../../components/Header";
import InputField from "../../../../components/InputHeroUi";
import SelectHero from "../../../../components/SelectHero";
import { ButtonContinueWith } from "../../../../components/Buttons";
import Footer from "../../../../components/Footer";
import RadioBtn from "../../../../components/RadioBtn";
import { Switch } from "@heroui/react";
import { MiniLoader } from "../../../../components/Loader";

export default function PartnerRegistration() {
  const [step, setStep] = useState(1);
  return (
    <div className="w-full relative">
      <div className="max-xl:fixed max-xl:z-50 w-full">
        <Header />
      </div>
      <div className="w-full flex justify-center items-center bg-registration bg-cover bg-center bg-no-repeat relative px-5 sm:px-[45px]">
        <div className="flex justify-center items-center w-full h-[500px] sm:h-[700px] max-w-[1290px] mx-auto pt-10 md:pt-14 lg:pt-16 xl:pt-0">
          <div className="text-white relative z-10">
            <h2 className="font-youth font-bold text-[70px] leading-tight 2xl:leading-[70px]">
              Thanks for your interest in partnering with Just Dry Cleaner!
            </h2>
            <p className="text-2xl font-medium">
              We’re excited to learn more about your dry cleaning facility.
              Please complete this brief questionnaire so we can make sure our
              partnership is a great match.
            </p>
          </div>

          <div className="absolute z-0 top-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent"></div>
        </div>
      </div>

      <div className="w-full py-[70px]">
        <div className="w-full max-w-[1290px] mx-auto flex justify-between items-center relative">
          <hr className="bg-gray-400 h-[2px] rounded-full w-full absolute z-[-1] top-7 left-0" />
          <div className="flex flex-col justify-center items-center gap-5 bg-white">
            <div
              className={`size-[60px] rounded-full shrink-0 ${
                step >= 1
                  ? "bg-theme-blue text-white"
                  : "bg-theme-gray text-black"
              } flex justify-center items-center font-sf font-semibold text-2xl`}
            >
              1
            </div>

            <p className="font-sf font-semibold text-xl text-center">
              Add your <br /> Information
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-5 bg-white">
            <div
              className={`size-[60px] rounded-full shrink-0 ${
                step >= 2
                  ? "bg-theme-blue text-white"
                  : "bg-theme-gray text-black"
              } flex justify-center items-center font-sf font-semibold text-2xl`}
            >
              2
            </div>

            <p className="font-sf font-semibold text-xl text-center">
              Add Address <br /> Details
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-5 bg-white">
            <div
              className={`size-[60px] rounded-full shrink-0 ${
                step >= 3
                  ? "bg-theme-blue text-white"
                  : "bg-theme-gray text-black"
              } flex justify-center items-center font-sf font-semibold text-2xl`}
            >
              3
            </div>

            <p className="font-sf font-semibold text-xl text-center">
              Add Business <br /> Details
            </p>
          </div>
        </div>

        {step === 1 ? (
          <div className="w-full max-w-[1290px] space-y-5 mx-auto pt-16">
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Full Name</p>
                <InputField label="Enter Your Name" type="text" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Full Name</p>
                <InputField label="Your Email" type="email" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Full Name</p>
                <InputField label="Your Contact" type="number" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Full Name</p>
                <SelectHero label="Select Country" type="text" />

                <div className="pt-14">
                  <ButtonContinueWith
                    text="Continue"
                    bg="bg-theme-blue"
                    color="text-white"
                    size="text-xl"
                    onClick={() => setStep(2)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="w-full max-w-[1290px] space-y-5 mx-auto pt-16">
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Province</p>
                <InputField label="Enter Province" type="text" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">City</p>
                <InputField label="Your City" type="email" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Street Address</p>
                <InputField label="Street Address" type="text" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">Zip Code</p>
                <InputField label="Zip Code" type="number" />

                <div className="pt-14">
                  <ButtonContinueWith
                    text="Continue"
                    bg="bg-theme-blue"
                    color="text-white"
                    size="text-xl"
                    onClick={() => setStep(3)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : step === 3 ? (
          <div className="w-full max-w-[1290px] space-y-5 mx-auto pt-16">
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">
                  Registered Business Name{" "}
                  <span className="text-theme-psGray font-normal">
                    (Shop Name)
                  </span>{" "}
                  <span class="text-red-500">*</span>
                </p>
                <InputField label="Enter Shop Name" type="text" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">
                  Add Services <span class="text-red-500">*</span>
                </p>
                <InputField label="Add Services" type="text" />
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] space-y-3 font-sf">
                <p className="font-semibold text-xl">
                  Please select what matches your profile{" "}
                  <span class="text-red-500">*</span>
                </p>

                <div className="space-y-5 font-sf">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="profile"
                      value="student"
                      className="accent-theme-darkBlue"
                    />
                    <span className="text-base">
                      ALL IN HOUSE- Washing, Ironing and Dry cleaning all done
                      by us
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="profile"
                      value="professional"
                      className="accent-theme-darkBlue"
                    />
                    <span className="text-base">
                      OUTSOURCE DRY CLEANING- Washing and Drying handled in
                      house
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="profile"
                      value="business"
                      className="accent-theme-darkBlue"
                    />
                    <span className="text-base">
                      OUTSOURCE ALL- We are just a shop front that outsources
                      all of the processing
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="profile"
                      value="other"
                      className="accent-theme-darkBlue"
                    />
                    <span className="text-base">Other</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] font-sf space-y-5">
                <p className="font-semibold text-xl">
                  What days of the week are you open{" "}
                  <span class="text-red-500">*</span>
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm" defaultSelected></Switch>
                    </div>
                    <span>Monday</span>
                  </div>
                  <input
                    type="text"
                    value="7:00 AM - 8:00 PM"
                    class="border rounded px-2 py-1 text-sm w-[150px]"
                    readonly
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm"></Switch>
                    </div>
                    <span>Tuesday</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm"></Switch>
                    </div>
                    <span>Wednesday</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm"></Switch>
                    </div>
                    <span>Thursday</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm"></Switch>
                    </div>
                    <span>Friday</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm"></Switch>
                    </div>
                    <span>Saturday</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <Switch size="sm"></Switch>
                    </div>
                    <span>Sunday</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px]  max-w-2xl font-sf space-y-6">
                <p class="font-semibold text-xl">
                  What is your count of machinery?{" "}
                  <span class="text-red-500">*</span>
                </p>

                <div class="grid grid-cols-6 gap-4 text-sm font-medium">
                  <div class="col-start-3">0</div>
                  <div class="">1 - 2</div>
                  <div class="">3 - 5</div>
                  <div class="">5+</div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32">Washers</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32">Dryers</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32 leading-tight">
                      Dry cleaning
                      <br />
                      Machines
                    </div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32">Presser</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-theme-shadow-light rounded-xl px-6 py-8">
              <div className="w-[565px] max-w-2xl font-sf space-y-6">
                <p class="font-semibold text-xl">
                  What is your Turnaround time (TAT)?
                  <span class="text-red-500"> *</span>
                </p>

                <div class="grid grid-cols-6 gap-4 text-sm font-medium">
                  <div class="col-start-3">N/A</div>
                  <div class="">24h</div>
                  <div class="">48h</div>
                  <div class="">More than 48h</div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32">Wash & Fold</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="washers"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32">Dry Cleaning</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryers"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32 leading-tight">Wash & Iron</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="dryclean"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div class="col-span-6 bg-inputBg rounded-md flex items-center px-4 py-3 gap-6">
                    <div class="w-32">Pressing / Ironing (If Applicable</div>
                    <div class="flex justify-around flex-1">
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="presser"
                          class="accent-theme-blue"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <ButtonContinueWith
                    text="Continue"
                    bg="bg-theme-blue"
                    color="text-white"
                    size="text-xl"
                    onClick={() => setStep(4)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-96 flex justify-center items-center">
          <MiniLoader/>
          </div>
        )}
      </div>
      {/*footer section  */}
      <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
    </div>
  );
}
