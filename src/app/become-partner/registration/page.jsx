"use client";
import React, { useState, useEffect } from "react";
import Header from "../../../../components/Header";
import InputField from "../../../../components/InputHeroUi";
import SelectHero from "../../../../components/SelectHero";
import { ButtonContinueWith } from "../../../../components/Buttons";
import Footer from "../../../../components/Footer";
import { Spinner, addToast } from "@heroui/react";
import HomeClientWrapper from "../../../../utilities/Test";
import {
  useRegisterAgentMutation,
  useGetCountriesQuery,
  useGetCitiesByCountryQuery,
  useGetChargesQuery,
  useGetServicesQuery,
  useLazyGetAddressesByPostcodeQuery,
} from "@/app/store/services/api";
import { IoSearchOutline } from "react-icons/io5";
import PhoneInputComp from "../../../../components/PhoneInputComp";

const PROFILE_OPTIONS = [
  { key: "ALL IN HOUSE", label: "ALL IN HOUSE- Washing, Ironing and Dry cleaning all done by us" },
  { key: "OUTSOURCE DRY CLEANING", label: "OUTSOURCE DRY CLEANING- Washing and Drying handled in house" },
  { key: "OUTSOURCE ALL", label: "OUTSOURCE ALL- We are just a shop front that outsources all of the processing" },
  { key: "Other", label: "Other" },
];

const MACHINE_MAP = [
  { machineId: 1, name: "Washers", radioName: "washers" },
  { machineId: 2, name: "Dryers", radioName: "dryers" },
  { machineId: 3, name: "Dry cleaning Machines", radioName: "dryclean" },
  { machineId: 4, name: "Presser", radioName: "presser" },
];

const MACHINE_VALUE_TO_TOTAL = { "0": 0, "1-2": 2, "3-5": 4, "5+": 6 };

const SERVICE_MAP = [
  { serviceId: 1, name: "Wash & Fold", radioName: "washFold" },
  { serviceId: 2, name: "Dry Cleaning", radioName: "dryCleaning" },
  { serviceId: 3, name: "Wash & Iron", radioName: "washIron" },
  { serviceId: 4, name: "Pressing / Ironing", radioName: "pressing" },
];

const TAT_TO_HOURS = { na: 0, "24h": 1, "48h": 2, "48h+": 3 };

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function PartnerRegistration() {
  const [step, setStep] = useState(1);
  const [subStep3, setSubStep3] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const addressDropdownRef = React.useRef(null);
  const postcodeInputRef = React.useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    contact: "",
    countryId: "",
    countryCode: "+44",
    cityId: "",
    streetAddress: "",
    province: "",
    postalCode: "",
    district: "",
    lat: null,
    lng: null,
    zoneId: null,
    shopName: "",
    matchProfileOptions: "",
    otherText: "",
    services: [],
    machinery: { washers: "", dryers: "", dryclean: "", presser: "" },
    serviceTimes: { washFold: "", dryCleaning: "", washIron: "", pressing: "" },
  });

  const [registerAgent] = useRegisterAgentMutation();
  const { data: countriesData } = useGetCountriesQuery(undefined, { skip: step < 1 });
  const { data: citiesData } = useGetCitiesByCountryQuery(form.countryId, {
    skip: !form.countryId || step < 2,
  });
  const { data: zoneData } = useGetChargesQuery(
    { lat: form.lat, lng: form.lng },
    { skip: !form.lat || !form.lng }
  );
  const { data: servicesData } = useGetServicesQuery();
  const [getAddressesByPostcode, { data: postcodeAddresses, isLoading: isLoadingAddresses }] =
    useLazyGetAddressesByPostcodeQuery();

  useEffect(() => {
    if (step === 3) setSubStep3(1);
  }, [step]);

  useEffect(() => {
    const zoneId = zoneData?.data?.zoneId;
    if (zoneId != null) setForm((f) => ({ ...f, zoneId }));
  }, [zoneData?.data?.zoneId]);

  const countries = countriesData?.data ?? countriesData?.message ?? [];
  const countriesList = Array.isArray(countries)
    ? countries.map((c) => ({ key: String(c.id ?? c.countryId), label: c.name ?? c.countryName ?? "" }))
    : [];

  const cities = citiesData?.data ?? citiesData?.message ?? [];
  const citiesList = Array.isArray(cities)
    ? cities.map((c) => ({ key: String(c.id ?? c.cityId), label: c.name ?? c.cityName ?? "" }))
    : [];

  const rawServices = servicesData?.data ?? servicesData?.message ?? [];
  const servicesArray = Array.isArray(rawServices) ? rawServices : rawServices?.serviceData ?? rawServices?.services ?? [];
  const servicesOptions =
    servicesArray.length > 0
      ? servicesArray.map((s) => ({ key: String(s.id ?? s.serviceId), label: s.name ?? s.service?.name ?? "" })).filter((x) => x.label)
      : [
          { key: "1", label: "Wash & Fold" },
          { key: "2", label: "Dry Cleaning" },
          { key: "3", label: "Ironing / Pressing" },
        ];

  const handlePostcodeSubmit = async () => {
    if (!form.postalCode?.trim()) return;
    try {
      await getAddressesByPostcode(form.postalCode.trim()).unwrap();
      setShowAddressDropdown(true);
    } catch {
      setShowAddressDropdown(false);
    }
  };

  const handleAddressSelect = (address) => {
    setForm((f) => ({
      ...f,
      streetAddress: address.fullAddress || `${address.line1 || ""}, ${address.line2 || ""}`.trim(),
      district: address.locality || f.district,
      city: address.town || f.province,
      province: address.county || f.province,
      postalCode: address.postcode || f.postalCode,
      lat: address.latitude ?? address.lat ?? null,
      lng: address.longitude ?? address.lng ?? null,
    }));
    setShowAddressDropdown(false);
  };

  useEffect(() => {
    const addresses = postcodeAddresses?.data?.addresses;
    if (addresses && Array.isArray(addresses) && addresses.length > 0) setShowAddressDropdown(true);
    else setShowAddressDropdown(false);
  }, [postcodeAddresses]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        addressDropdownRef.current &&
        postcodeInputRef.current &&
        !addressDropdownRef.current.contains(e.target) &&
        !postcodeInputRef.current.contains(e.target)
      ) {
        setShowAddressDropdown(false);
      }
    };
    if (showAddressDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAddressDropdown]);

  const buildPayload = () => {
    const { firstName, lastName } = splitName(form.fullName);
    const machineryCount = MACHINE_MAP.filter((m) => form.machinery[m.radioName])
      .map((m) => ({
        machineId: m.machineId,
        total: MACHINE_VALUE_TO_TOTAL[form.machinery[m.radioName]] ?? 0,
      }))
      .filter((x) => x.total >= 0);

    const serviceTimes = SERVICE_MAP.filter((s) => form.serviceTimes[s.radioName] !== undefined)
      .map((s) => ({
        serviceId: s.serviceId,
        serviceTimeRequired: TAT_TO_HOURS[form.serviceTimes[s.radioName]] ?? 0,
      }));

    return {
      firstName,
      lastName,
      email: form.email,
      password: form.password,
      phoneNum: form.contact ? (form.contact.startsWith("+") ? form.contact : `+${form.contact}`) : "",
      countryId: Number(form.countryId) || 1,
      cityId: Number(form.cityId) || 1,
      countryCode: form.countryCode || "+1",
      shopName: form.shopName,
      matchProfileOptions: form.matchProfileOptions,
      otherText: form.matchProfileOptions === "Other" ? form.otherText : null,
      machineryCount,
      serviceTimes,
      streetAddress: form.streetAddress,
      province: form.province,
      postalCode: form.postalCode,
      district: form.district,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      coordinates: form.lat != null && form.lng != null ? `${form.lat},${form.lng}` : null,
      addressType: "Business",
      zoneId: form.zoneId ? Number(form.zoneId) : 1,
      services: (form.services || []).map((id) => ({ serviceId: Number(id) })),
    };
  };

  const handleSubmit = async () => {
    if (!form.fullName?.trim()) {
      addToast({ title: "Validation", description: "Full name is required", color: "danger" });
      return;
    }
    if (!form.email?.trim()) {
      addToast({ title: "Validation", description: "Email is required", color: "danger" });
      return;
    }
    if (!form.password?.trim()) {
      addToast({ title: "Validation", description: "Password is required", color: "danger" });
      return;
    }
    if (!form.contact?.trim()) {
      addToast({ title: "Validation", description: "Contact is required", color: "danger" });
      return;
    }
    if (!form.shopName?.trim()) {
      addToast({ title: "Validation", description: "Shop name is required", color: "danger" });
      return;
    }
    if (!form.matchProfileOptions) {
      addToast({ title: "Validation", description: "Please select your profile", color: "danger" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await registerAgent(payload).unwrap();
      if (res?.status === "1") {
        addToast({ title: "Success", description: res?.message || "Registration submitted successfully!", color: "success" });
        setForm({ fullName: "", email: "", password: "", contact: "", countryCode: "+44", countryId: "", cityId: "", streetAddress: "", province: "", postalCode: "", district: "", lat: null, lng: null, zoneId: null, shopName: "", matchProfileOptions: "", otherText: "", services: [], machinery: { washers: "", dryers: "", dryclean: "", presser: "" }, serviceTimes: { washFold: "", dryCleaning: "", washIron: "", pressing: "" } });
        setStep(1);
        setSubStep3(1);
      } else {
        addToast({ title: "Error", description: res?.error ?? res?.message ?? "Registration failed", color: "danger" });
      }
    } catch (err) {
      const msg = err?.data?.error ?? err?.data?.message ?? err?.message ?? "Something went wrong. Please try again.";
      addToast({ title: "Error", description: msg, color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

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
                We're excited to learn more about your dry cleaning facility. Please complete this brief questionnaire.
              </p>
            </div>
            <div className="absolute z-0 top-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent"></div>
          </div>
        </div>

        <div className="w-full py-8 sm:py-12 md:py-16 lg:py-[70px] px-5 sm:px-[45px]">
          <div className="w-full max-w-[1290px] mx-auto flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center relative gap-6 sm:gap-4">
            <hr className="bg-gray-400 h-[2px] rounded-full w-full absolute z-[-1] top-7 sm:top-8 left-0 hidden sm:block" />
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex flex-col justify-center items-start sm:items-center gap-3 sm:gap-5 bg-white cursor-pointer group ${step === s ? "w-auto sm:w-auto" : "hidden sm:flex sm:w-auto"}`}
                onClick={() => setStep(s)}
              >
                <div
                  className={`size-12 sm:size-14 md:size-[60px] rounded-full shrink-0 ${step >= s ? "bg-theme-blue text-white" : "bg-theme-gray text-black"} flex justify-center items-center font-sf font-semibold text-lg sm:text-xl md:text-2xl transition-all duration-200`}
                >
                  {s}
                </div>
                <p className="font-sf font-semibold text-sm sm:text-base md:text-xl text-center">
                  {s === 1 && "Add your Information"}
                  {s === 2 && "Add Address Details"}
                  {s === 3 && "Add Business Details"}
                </p>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="w-full max-w-[1290px] space-y-4 sm:space-y-5 mx-auto pt-8 sm:pt-12 md:pt-16">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Full Name</p>
                  <InputField label="Enter Your Name" type="text" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Email</p>
                  <InputField label="Your Email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Password</p>
                  <InputField label="Create Password" type="password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Contact</p>
                  <PhoneInputComp
                    country="gb"
                    value={form.contact}
                    onChange={(value, data) => {
                      setForm((f) => ({
                        ...f,
                        contact: value || "",
                        countryCode: data?.dialCode ? `+${data.dialCode}` : f.countryCode,
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Country</p>
                  {countriesList.length > 0 ? (
                    <SelectHero
                      label="Select Country"
                      list={countriesList}
                      value={form.countryId ? [String(form.countryId)] : []}
                      onChange={(e) => updateForm("countryId", e.target.value)}
                    />
                  ) : (
                    <InputField label="Country ID (number)" type="number" value={form.countryId} onChange={(e) => updateForm("countryId", e.target.value)} />
                  )}
                </div>
              </div>
              <div className="pt-8 sm:pt-10 md:pt-14">
                <ButtonContinueWith text="Continue" bg="bg-theme-blue" color="text-white" size="text-base sm:text-lg md:text-xl" onClick={() => setStep(2)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-[1290px] space-y-4 sm:space-y-5 mx-auto pt-8 sm:pt-12 md:pt-16">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Province</p>
                  <InputField label="Enter Province" type="text" value={form.province} onChange={(e) => updateForm("province", e.target.value)} />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">City</p>
                  {citiesList.length > 0 ? (
                    <SelectHero label="Select City" list={citiesList} value={form.cityId ? [String(form.cityId)] : []} onChange={(e) => updateForm("cityId", e.target.value)} />
                  ) : (
                    <InputField label="City ID (number)" type="number" value={form.cityId} onChange={(e) => updateForm("cityId", e.target.value)} />
                  )}
                </div>
              </div>
              <div className="relative" ref={postcodeInputRef}>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">Postal / Zip Code</p>
                    <div className="flex gap-2">
                      <InputField
                        label="Postal Code"
                        type="text"
                        value={form.postalCode}
                        onChange={(e) => updateForm("postalCode", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePostcodeSubmit())}
                      />
                      <button
                        type="button"
                        onClick={handlePostcodeSubmit}
                        className="h-[60px] w-[60px] bg-theme-blue rounded-[8px] flex justify-center items-center shrink-0"
                        disabled={isLoadingAddresses || !form.postalCode?.trim()}
                      >
                        {isLoadingAddresses ? <Spinner size="sm" className="text-white" /> : <IoSearchOutline className="text-xl text-white" />}
                      </button>
                    </div>
                  </div>
                </div>
                {showAddressDropdown && postcodeAddresses?.data?.addresses?.length > 0 && (
                  <div ref={addressDropdownRef} className="absolute z-[100] w-full mt-2 bg-white rounded-lg shadow-xl max-h-[250px] overflow-y-auto border border-gray-200">
                    {postcodeAddresses.data.addresses.map((addr, i) => (
                      <div key={i} onClick={() => handleAddressSelect(addr)} className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0">
                        <p className="font-sf font-semibold text-base">{addr.line1}</p>
                        {(addr.line2 || addr.fullAddress) && <p className="font-sf text-sm text-gray-600">{addr.line2 || addr.fullAddress}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">Street Address</p>
                  <InputField label="Street Address" type="text" value={form.streetAddress} onChange={(e) => updateForm("streetAddress", e.target.value)} />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                  <p className="font-semibold text-base sm:text-lg md:text-xl">District</p>
                  <InputField label="District" type="text" value={form.district} onChange={(e) => updateForm("district", e.target.value)} />
                </div>
              </div>
              <div className="pt-8 sm:pt-10 md:pt-14">
                <ButtonContinueWith text="Continue" bg="bg-theme-blue" color="text-white" size="text-base sm:text-lg md:text-xl" onClick={() => setStep(3)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="w-full max-w-[1290px] space-y-4 sm:space-y-5 mx-auto pt-8 sm:pt-12 md:pt-16">
              {subStep3 === 1 && (
                <>
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                    <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                      <p className="font-semibold text-base sm:text-lg md:text-xl">Shop Name <span className="text-red-500">*</span></p>
                      <InputField label="Enter Shop Name" type="text" value={form.shopName} onChange={(e) => updateForm("shopName", e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-2 sm:space-y-3 font-sf">
                      <p className="font-semibold text-base sm:text-lg md:text-xl">Services <span className="text-red-500">*</span></p>
                      <p className="text-xs text-theme-psGray">Select services you offer</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {servicesOptions.map((opt) => (
                          <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(form.services || []).includes(opt.key)}
                              onChange={(e) => {
                                setForm((f) => {
                                  const s = f.services || [];
                                  const next = e.target.checked ? [...s, opt.key] : s.filter((x) => x !== opt.key);
                                  return { ...f, services: next };
                                });
                              }}
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-6">
                    <ButtonContinueWith text="Next" bg="bg-theme-blue" color="text-white" size="text-base sm:text-lg md:text-xl" onClick={() => setSubStep3(2)} />
                  </div>
                </>
              )}

              {subStep3 === 2 && (
                <>
                  <div className="space-y-3 font-sf">
                    <p className="font-semibold text-base sm:text-lg md:text-xl">What matches your profile? <span className="text-red-500">*</span></p>
                    <div className="space-y-3">
                      {PROFILE_OPTIONS.map((opt) => (
                        <label key={opt.key} className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-theme-blue cursor-pointer">
                          <input type="radio" name="profile" value={opt.key} checked={form.matchProfileOptions === opt.key} onChange={() => updateForm("matchProfileOptions", opt.key)} className="accent-theme-darkBlue" />
                          <span className="text-sm sm:text-base">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {form.matchProfileOptions === "Other" && (
                      <div className="mt-4">
                        <InputField label="Please specify" value={form.otherText} onChange={(e) => updateForm("otherText", e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="pt-6">
                    <ButtonContinueWith text="Next" bg="bg-theme-blue" color="text-white" size="text-base sm:text-lg md:text-xl" onClick={() => setSubStep3(3)} />
                  </div>
                </>
              )}

              {subStep3 === 3 && (
                <>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <p className="font-semibold text-base sm:text-lg md:text-xl">Machinery count <span className="text-red-500">*</span></p>
                      <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200">
                        <div></div>
                        <div className="text-center">0</div>
                        <div className="text-center">1-2</div>
                        <div className="text-center">3-5</div>
                        <div className="text-center">5+</div>
                      </div>
                      {MACHINE_MAP.map((m) => (
                        <div key={m.machineId} className="grid grid-cols-5 gap-2 items-center p-3 bg-inputBg rounded-lg">
                          <span className="font-medium text-sm">{m.name}</span>
                          {["0", "1-2", "3-5", "5+"].map((val) => (
                            <label key={val} className="flex justify-center cursor-pointer">
                              <input type="radio" name={m.radioName} value={val} checked={form.machinery[m.radioName] === val} onChange={() => setForm((f) => ({ ...f, machinery: { ...f.machinery, [m.radioName]: val } }))} className="accent-theme-blue" />
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 space-y-4">
                      <p className="font-semibold text-base sm:text-lg md:text-xl">Turnaround time (TAT) <span className="text-red-500">*</span></p>
                      <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200">
                        <div></div>
                        <div className="text-center">N/A</div>
                        <div className="text-center">24h</div>
                        <div className="text-center">48h</div>
                        <div className="text-center">48h+</div>
                      </div>
                      {SERVICE_MAP.map((s) => (
                        <div key={s.serviceId} className="grid grid-cols-5 gap-2 items-center p-3 bg-inputBg rounded-lg">
                          <span className="font-medium text-sm">{s.name}</span>
                          {["na", "24h", "48h", "48h+"].map((val) => (
                            <label key={val} className="flex justify-center cursor-pointer">
                              <input type="radio" name={s.radioName} value={val} checked={form.serviceTimes[s.radioName] === val} onChange={() => setForm((f) => ({ ...f, serviceTimes: { ...f.serviceTimes, [s.radioName]: val } }))} className="accent-theme-blue" />
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6">
                    <ButtonContinueWith
                      text={isSubmitting ? "Submitting..." : "Submit"}
                      bg="bg-theme-blue"
                      color="text-white"
                      size="text-base sm:text-lg md:text-xl"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    />
                    {isSubmitting && <Spinner className="mt-4" />}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <Footer width="max-w-[1200px] px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
      </div>
    </HomeClientWrapper>
  );
}
