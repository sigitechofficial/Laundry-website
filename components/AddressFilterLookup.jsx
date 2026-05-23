"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [allAddresses, setAllAddresses] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [fetchAddresses] = useLazyGetAddressesByPostcodeQuery();

  useEffect(() => {
    let cancelled = false;

    const loadAddresses = async () => {
      setQuery("");
      setShowDropdown(false);

      if (!isFullUkPostcode(postcode)) {
        setAllAddresses([]);
        return;
      }

      const cached = readSessionAddressCache(postcode);
      if (cached?.addresses?.length) {
        setAllAddresses(cached.addresses);
        setShowDropdown(true);
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
          setShowDropdown(true);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAddresses = useMemo(
    () => filterAddresses(allAddresses, query),
    [allAddresses, query]
  );

  const handleQueryChange = (nextValue) => {
    setQuery(nextValue);
    if (allAddresses.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSelectAddress = (address) => {
    onAddressSelect?.(address);
    setShowDropdown(false);
    setQuery("");
  };

  const hasPostcode = isFullUkPostcode(postcode);
  const hasAddresses = allAddresses.length > 0;
  const inputDisabled = disabled || !hasPostcode || isLoadingAddresses;

  return (
    <div className={`relative z-[100] ${className}`} ref={containerRef}>
      <div className="relative border-2 border-theme-gray-2/25 rounded-lg w-full min-h-14 pl-3 pr-1 py-1">
        <div className="absolute top-1/2 -translate-y-1/2 left-3 z-10 pointer-events-none">
          <IoSearchOutline className="text-2xl text-theme-gray-2" />
        </div>

        <input
          className="relative z-20 w-full h-14 pl-14 pr-4 outline-none bg-transparent font-sf text-gray-900 disabled:opacity-50"
          type="text"
          placeholder={isLoadingAddresses ? "Loading addresses..." : placeholder}
          value={query}
          disabled={inputDisabled}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (hasAddresses && filteredAddresses.length > 0) {
              setShowDropdown(true);
            }
          }}
        />

        {isLoadingAddresses && (
          <div className="absolute top-1/2 -translate-y-1/2 right-3 z-20">
            <Spinner size="sm" />
          </div>
        )}

        {showDropdown && filteredAddresses.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-[10001] mt-1 bg-white rounded-lg shadow-xl max-h-[250px] overflow-y-auto border border-gray-200">
            {filteredAddresses.map((address, index) => (
              <button
                key={address.suggestionId || address.id || index}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <span className="font-sf text-sm text-gray-700 leading-snug break-words whitespace-normal block">
                  {formatAddressListLabel(address, postcode)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasPostcode && (
        <p className="text-xs text-theme-psGray mt-2 font-sf">
          Enter a full postcode on the form first.
        </p>
      )}

      {hasPostcode && !isLoadingAddresses && !hasAddresses && (
        <p className="text-xs text-theme-psGray mt-2 font-sf">
          No addresses found for this postcode.
        </p>
      )}

      {hasPostcode && hasAddresses && !isLoadingAddresses && (
        <p className="text-xs text-theme-psGray mt-2 font-sf">
          {allAddresses.length} addresses at this postcode — tap to browse or type to filter.
        </p>
      )}

      {hasAddresses && showDropdown && query.trim() && filteredAddresses.length === 0 && (
        <p className="text-xs text-theme-psGray mt-2 font-sf">
          No matching address. Try flat number or street name.
        </p>
      )}
    </div>
  );
}
