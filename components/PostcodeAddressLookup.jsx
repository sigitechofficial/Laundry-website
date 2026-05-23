"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spinner, addToast } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import InputHeroUi from "./InputHeroUi";
import {
  useLazyGetAddressesByPostcodeQuery,
  useLazyGetPostcodeAutocompleteQuery,
} from "../src/app/store/services/api";
import {
  getRetryAfterSeconds,
  isFullUkPostcode,
  normalizePostcode,
  readSessionAddressCache,
  writeSessionAddressCache,
} from "../utilities/postcodeLookup";

export default function PostcodeAddressLookup({
  value = "",
  onChange,
  disabled = false,
  label = "Post Code",
  placeholder,
  showLabel = true,
  className = "",
  compact = false,
  onAddressesLoaded,
}) {
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const suggestionTypeRef = useRef("postcode");

  const [postcodeSuggestions, setPostcodeSuggestions] = useState([]);
  const [showPostcodeSuggestions, setShowPostcodeSuggestions] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const [fetchAutocomplete, { isFetching: isAutocompleteLoading }] =
    useLazyGetPostcodeAutocompleteQuery();
  const [fetchAddresses, { isFetching: isLoadingAddresses }] =
    useLazyGetAddressesByPostcodeQuery();

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPostcodeSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runAutocomplete = useCallback(
    (query, { immediate = false } = {}) => {
      const trimmed = (query || "").trim();
      if (trimmed.length < 2 || isFullUkPostcode(trimmed)) {
        setPostcodeSuggestions([]);
        setShowPostcodeSuggestions(false);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const fetchSuggestions = async () => {
        try {
          const result = await fetchAutocomplete(trimmed).unwrap();
          const suggestions = result?.data?.suggestions || [];
          suggestionTypeRef.current = result?.data?.suggestionType || "postcode";
          setPostcodeSuggestions(suggestions);
          setShowPostcodeSuggestions(suggestions.length > 0);
        } catch {
          setPostcodeSuggestions([]);
          setShowPostcodeSuggestions(false);
        }
      };

      if (immediate) {
        void fetchSuggestions();
        return;
      }

      debounceRef.current = setTimeout(() => {
        void fetchSuggestions();
      }, 400);
    },
    [fetchAutocomplete]
  );

  const loadAddressesForPostcode = useCallback(
    async (rawPostcode, { silent = false } = {}) => {
      const normalized = normalizePostcode(rawPostcode);
      if (!normalized) return false;

      if (!isFullUkPostcode(normalized)) {
        if (!silent) {
          addToast({
            title: "Enter a full UK postcode (e.g. SW1A 1AA).",
            color: "warning",
          });
        }
        return false;
      }

      if (cooldownSeconds > 0) {
        if (!silent) {
          addToast({
            title: `Please wait ${cooldownSeconds}s before searching again.`,
            color: "warning",
          });
        }
        return false;
      }

      const cached = readSessionAddressCache(normalized);
      if (cached?.addresses?.length) {
        onAddressesLoaded?.(cached.addresses, normalized);
        if (!silent) {
          const count = cached.addresses.length;
          addToast({
            title: `${count} address${count === 1 ? "" : "es"} found. Open Address to choose yours.`,
            color: "success",
          });
        }
        return true;
      }

      try {
        const result = await fetchAddresses(normalized).unwrap();
        const list = result?.data?.addresses || [];

        if (list.length > 0) {
          writeSessionAddressCache(normalized, { addresses: list });
          onAddressesLoaded?.(list, normalized);
          if (!silent) {
            const count = result?.data?.addressCount ?? list.length;
            addToast({
              title: `${count} address${count === 1 ? "" : "es"} found. Open Address to choose yours.`,
              color: "success",
            });
          }
          return true;
        }

        if (!silent) {
          addToast({
            title: "No addresses found for this postcode.",
            color: "warning",
          });
        }
        return false;
      } catch (error) {
        const retryAfter = getRetryAfterSeconds(error);
        if (retryAfter) {
          setCooldownSeconds(retryAfter);
        }
        if (!silent) {
          addToast({
            title:
              error?.data?.message ||
              error?.data?.error ||
              "Could not fetch addresses. Please try again.",
            color: "danger",
          });
        }
        return false;
      }
    },
    [cooldownSeconds, fetchAddresses, onAddressesLoaded]
  );

  const handleAddressSearch = useCallback(
    async (rawPostcode = value) => {
      await loadAddressesForPostcode(rawPostcode, { silent: false });
    },
    [loadAddressesForPostcode, value]
  );

  const handlePostcodeChange = (nextValue) => {
    onChange?.(nextValue);
    runAutocomplete(nextValue);
  };

  const handlePostcodeSuggestionSelect = (suggestion) => {
    onChange?.(suggestion);

    if (suggestionTypeRef.current === "outcode") {
      setPostcodeSuggestions([]);
      runAutocomplete(suggestion, { immediate: true });
      return;
    }

    setShowPostcodeSuggestions(false);
    setPostcodeSuggestions([]);
  };

  const searchDisabled =
    disabled || isLoadingAddresses || cooldownSeconds > 0 || !value?.trim();

  return (
    <div className={`relative z-50 ${className}`} ref={containerRef}>
      <div className={`flex gap-2 items-end ${compact ? "h-14" : ""}`}>
        <div className="flex-1 relative min-w-0">
          {showLabel ? (
            <InputHeroUi
              type="text"
              label={label}
              placeholder={placeholder}
              value={value}
              isDisabled={disabled}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddressSearch();
                }
              }}
            />
          ) : (
            <input
              className="w-full h-full pl-14 pr-2 outline-none bg-transparent"
              type="text"
              placeholder={placeholder || "Enter UK postcode"}
              value={value}
              disabled={disabled}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddressSearch();
                }
              }}
            />
          )}

          {showPostcodeSuggestions && postcodeSuggestions.length > 0 && (
            <div className="absolute z-[10001] w-full mt-1 bg-white rounded-lg shadow-xl max-h-[180px] overflow-y-auto border border-gray-200">
              {postcodeSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handlePostcodeSuggestionSelect(suggestion)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm font-sf"
                >
                  {suggestion}
                </button>
              ))}
              {isAutocompleteLoading && (
                <p className="px-4 py-2 text-xs text-gray-500">Searching postcodes...</p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleAddressSearch()}
          className={`${
            compact ? "h-14 w-14" : "h-[60px] w-[60px]"
          } bg-theme-blue rounded-[8px] flex items-center justify-center hover:bg-theme-darkBlue disabled:bg-blue-200 disabled:cursor-not-allowed transition-colors shrink-0`}
          disabled={searchDisabled}
          aria-label="Search postcode"
        >
          {isLoadingAddresses ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <IoSearchOutline className="text-xl text-white" />
          )}
        </button>
      </div>

      {cooldownSeconds > 0 && (
        <p className="text-xs text-theme-psGray mt-1 font-sf">
          You can search another postcode in {cooldownSeconds}s
        </p>
      )}
    </div>
  );
}
