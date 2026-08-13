"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { useLazyGetAddressesByPostcodeQuery } from "../src/app/store/services/api";
import {
  filterAddresses,
  formatAddressListLabel,
  isFullUkPostcode,
  normalizePostcode,
  readSessionAddressCache,
  writeSessionAddressCache,
} from "../utilities/postcodeLookup";

export default function AddressFilterLookup({
  postcode = "",
  onAddressSelect,
  disabled = false,
  placeholder = "Search your address",
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [allAddresses, setAllAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [fetchAddresses] = useLazyGetAddressesByPostcodeQuery();

  useEffect(() => {
    let cancelled = false;

    const loadAddresses = async () => {
      setQuery("");

      if (!isFullUkPostcode(postcode)) {
        setAllAddresses([]);
        return;
      }

      const cached = readSessionAddressCache(postcode);
      if (cached?.addresses?.length) {
        setAllAddresses(cached.addresses);
        return;
      }

      setIsLoadingAddresses(true);
      try {
        const normalized = normalizePostcode(postcode);
        const result = await fetchAddresses(normalized).unwrap();
        const list = result?.data?.addresses || [];
        if (cancelled) return;

        if (list.length > 0) {
          writeSessionAddressCache(normalized, { addresses: list });
          setAllAddresses(list);
        } else {
          setAllAddresses([]);
        }
      } catch {
        if (!cancelled) setAllAddresses([]);
      } finally {
        if (!cancelled) setIsLoadingAddresses(false);
      }
    };

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [postcode, fetchAddresses]);

  const filteredAddresses = useMemo(
    () => filterAddresses(allAddresses, query),
    [allAddresses, query]
  );

  const handleSelectAddress = (address) => {
    onAddressSelect?.(address);
    setQuery("");
  };

  const hasPostcode = isFullUkPostcode(postcode);
  const hasAddresses = allAddresses.length > 0;
  const inputDisabled = disabled || !hasPostcode || isLoadingAddresses;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="relative border-2 border-theme-gray-2/25 rounded-lg w-full min-h-14 pl-3 pr-1 py-1 shrink-0">
        <div className="absolute top-1/2 -translate-y-1/2 left-3 z-10 pointer-events-none">
          <IoSearchOutline className="text-2xl text-theme-gray-2" />
        </div>

        <input
          className="relative z-20 w-full h-14 pl-14 pr-4 outline-none bg-transparent font-sf text-gray-900 disabled:opacity-50"
          type="text"
          placeholder={isLoadingAddresses ? "Loading addresses..." : placeholder}
          value={query}
          disabled={inputDisabled}
          onChange={(e) => setQuery(e.target.value)}
        />

        {isLoadingAddresses && (
          <div className="absolute top-1/2 -translate-y-1/2 right-3 z-20">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {!hasPostcode && (
        <p className="text-xs text-theme-psGray font-sf">
          Enter a full postcode on the form first.
        </p>
      )}

      {hasPostcode && isLoadingAddresses && (
        <div className="flex items-center justify-center py-8 border border-gray-200 rounded-lg bg-gray-50 min-h-[140px]">
          <Spinner size="md" />
        </div>
      )}

      {hasPostcode && !isLoadingAddresses && !hasAddresses && (
        <div className="flex items-center justify-center py-10 border border-gray-200 rounded-lg bg-gray-50 min-h-[120px]">
          <p className="text-sm text-theme-psGray font-sf text-center px-4">
            No addresses found for this postcode.
          </p>
        </div>
      )}

      {hasPostcode && hasAddresses && !isLoadingAddresses && (
        <>
          <div className="border border-gray-200 rounded-lg bg-white min-h-[140px] max-h-[240px] overflow-y-auto modal-scroll">
            {filteredAddresses.length > 0 ? (
              filteredAddresses.map((address, index) => (
                <button
                  key={address.suggestionId || address.id || index}
                  type="button"
                  onClick={() => handleSelectAddress(address)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <span className="font-sf text-sm text-gray-700 leading-snug break-words whitespace-normal block">
                    {formatAddressListLabel(address, postcode)}
                  </span>
                </button>
              ))
            ) : (
              <div className="flex items-center justify-center py-10 px-4">
                <p className="text-sm text-theme-psGray font-sf text-center">
                  No matching address. Try flat number or street name.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-theme-psGray font-sf">
            {query.trim()
              ? `${filteredAddresses.length} of ${allAddresses.length} addresses`
              : `${allAddresses.length} addresses at this postcode — type above to filter`}
          </p>
        </>
      )}
    </div>
  );
}
