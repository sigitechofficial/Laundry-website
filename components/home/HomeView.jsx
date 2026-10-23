"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import SiteHeader from "../ds/SiteHeader";
import SiteFooter from "../ds/SiteFooter";
import { PAGE_SCOPE } from "../ds/PageShell";
import HomeClientWrapper from "../../utilities/Test";
import { useGetServiceDetailsQuery } from "../../src/app/store/services/api";
import Hero from "./Hero";
import ServicesSection from "./ServicesSection";
import ServicesMarquee from "./ServicesMarquee";
import StudioBand from "./StudioBand";
import FirstPickup from "./FirstPickup";
import WhySection from "./WhySection";
import OfferPromo from "./OfferPromo";
import Mosaic from "./Mosaic";
import Guarantee from "./Guarantee";
import FaqSection from "./FaqSection";
import { buildServiceModel } from "./serviceModel";

/**
 * Marketing home page.
 *
 * Shown to everyone, signed in or not. It used to send signed-in customers
 * straight to their booking, which meant typing a URL or pressing the browser's
 * Back button always bounced them back to the services step. The booking CTAs
 * (useStartBooking) still take them to the right step.
 */
export default function HomeView() {
  const savedCollection = useSelector((state) => state?.cart?.orderData?.collectionData);
  const { data } = useGetServiceDetailsQuery({ lat: savedCollection?.lat, lng: savedCollection?.lng });
  const serviceData = data?.data?.serviceData ?? data?.serviceData;
  const services = useMemo(() => buildServiceModel(serviceData), [serviceData]);

  return (
    <HomeClientWrapper>
      <div className={PAGE_SCOPE}>
        <a href="#main" className={skipLinkClass}>
          Skip to content
        </a>
        <SiteHeader variant="overlay" />
        <main id="main" tabIndex={-1}>
          <Hero />
          <ServicesSection model={services} />
          <ServicesMarquee services={services.all} />
          <StudioBand />
          <FirstPickup />
          <WhySection />
          <OfferPromo />
          <Mosaic />
          <Guarantee />
          <FaqSection />
        </main>
        <SiteFooter />
      </div>
    </HomeClientWrapper>
  );
}

const skipLinkClass =
  "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold focus:text-jdc-navy focus:shadow-jdc-lg";
