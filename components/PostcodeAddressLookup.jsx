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
  onPostcodeSelected,
}) {
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const autocompleteSeqRef = useRef(0);
  const skipNextAutocompleteRef = useRef(false);
  const suggestionTypeRef = useRef("postcode");
  // Only suggest after the user edits the field; a pre-filled / saved
  // postcode must not pop the suggestions list open on page load.
  const userEditedRef = useRef(false);

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
      const normalizedQuery = normalizePostcode(trimmed) || trimmed;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      if (normalizedQuery.length < 2) {
        autocompleteSeqRef.current += 1;
        setPostcodeSuggestions([]);
        setShowPostcodeSuggestions(false);
        return;
      }

      const fetchSuggestions = async (queryForFetch) => {
        const requestSeq = ++autocompleteSeqRef.current;
        const apiQuery = normalizePostcode(queryForFetch) || queryForFetch.trim();

        try {
          const result = await fetchAutocomplete(apiQuery, {
            forceRefetch: true,
            subscribe: false,
          }).unwrap();

          if (requestSeq !== autocompleteSeqRef.current) {
            return;
          }

          // Hide the postcode that is already entered (e.g. "NW119ES" == "NW11 9ES").
          const current = normalizePostcode(queryForFetch) || "";
          const suggestions = (result?.data?.suggestions || []).filter(
            (s) => (normalizePostcode(s) || s) !== current
          );
          suggestionTypeRef.current = result?.data?.suggestionType || "postcode";
          setPostcodeSuggestions(suggestions);
          setShowPostcodeSuggestions(suggestions.length > 0);
        } catch {
          if (requestSeq !== autocompleteSeqRef.current) {
            return;
          }
          setPostcodeSuggestions([]);
          setShowPostcodeSuggestions(false);
        }
      };

      const fetchImmediately =
        immediate || isFullUkPostcode(normalizedQuery);

      if (fetchImmediately) {
        void fetchSuggestions(normalizedQuery);
        return;
      }

      debounceRef.current = setTimeout(() => {
        void fetchSuggestions(normalizedQuery);
      }, 400);
    },
    [fetchAutocomplete]
  );

  useEffect(() => {
    if (skipNextAutocompleteRef.current) {
      skipNextAutocompleteRef.current = false;
      return;
    }
    if (!userEditedRef.current) return;
    runAutocomplete(value);
  }, [value, runAutocomplete]);

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
      const normalized = normalizePostcode(rawPostcode);
      const willOpenModal =
        onPostcodeSelected && isFullUkPostcode(normalized);

      if (willOpenModal) {
        onPostcodeSelected(rawPostcode);
      }

      await loadAddressesForPostcode(rawPostcode, { silent: willOpenModal });
    },
    [loadAddressesForPostcode, onPostcodeSelected, value]
  );

  const handlePostcodeChange = (nextValue) => {
    userEditedRef.current = true;
    onChange?.(nextValue);
  };

  const handlePostcodeSuggestionSelect = (suggestion) => {
    skipNextAutocompleteRef.current = true;
    onChange?.(suggestion);

    if (suggestionTypeRef.current === "outcode") {
      setPostcodeSuggestions([]);
      runAutocomplete(suggestion, { immediate: true });
      return;
    }

    setShowPostcodeSuggestions(false);
    setPostcodeSuggestions([]);
    void loadAddressesForPostcode(suggestion, { silent: true });
    onPostcodeSelected?.(suggestion);
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
            <div className="absolute z-[10001] w-full mt-1 bg-white rounded-[14px] shadow-[0_18px_40px_rgba(27,34,48,0.14)] max-h-[220px] overflow-y-auto border border-jdc-line">
              {postcodeSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handlePostcodeSuggestionSelect(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-jdc-mist cursor-pointer border-b border-jdc-line last:border-b-0 text-[15px] font-body text-jdc-navy"
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
            compact ? "h-14 w-14" : "h-[58px] w-[58px]"
          } bg-jdc-blue rounded-[14px] flex items-center justify-center hover:bg-jdc-blue-dark disabled:bg-[#9CC8FF] disabled:cursor-not-allowed transition-colors shrink-0`}
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
