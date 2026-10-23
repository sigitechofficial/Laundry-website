"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetServiceDetailsQuery } from "../../src/app/store/services/api";
import { currencyFromResponse } from "../../utilities/formatPrice";
import { buildPricingModel } from "./pricingModel";

/**
 * Live services and prices for the pricing pages. Uses the customer's
 * saved collection point when there is one, so zone pricing applies.
 */
export function usePricingData() {
  const collection = useSelector((state) => state?.cart?.orderData?.collectionData);
  const query = useGetServiceDetailsQuery({ lat: collection?.lat, lng: collection?.lng });
  const { data } = query;

  const services = useMemo(
    () => buildPricingModel(data?.data?.serviceData ?? data?.serviceData),
    [data]
  );
  const currency = useMemo(() => currencyFromResponse(data), [data]);

  return {
    services,
    currency,
    isLoading: query.isLoading,
    // 404 means "no services" (shown as empty), not a loading error
    isError: query.isError && !data && query.error?.status !== 404,
    refetch: query.refetch,
  };
}
