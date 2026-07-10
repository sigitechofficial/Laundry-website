export const WASH_BLEED_DISCLAIMER_TEXT =
  "You are responsible if clothes colour bleeds due to the selected wash settings.";

export function parseServiceBooleanFlag(value) {
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return value === true || value === "true" || value === 1 || value === "1";
}

export function isMixedWashPreferenceValue(value) {
  return String(value ?? "").trim().toLowerCase() === "mixed wash";
}

export function isWashBleedDisclaimerEnabledForService(serviceMeta) {
  return parseServiceBooleanFlag(serviceMeta?.washBleedDisclaimerEnabled);
}

/** Admin flag on service + customer selected Mixed wash option. */
export function shouldShowWashBleedDisclaimer(serviceMeta, washPreferenceValue) {
  return (
    isWashBleedDisclaimerEnabledForService(serviceMeta) &&
    isMixedWashPreferenceValue(washPreferenceValue)
  );
}

export function cartHasMixedWashDisclaimer(preferencesData = [], serviceList = []) {
  return preferencesData.some((pref) => {
    const serviceMeta = serviceList.find((s) => s?.id === pref?.serviceId);
    if (!isWashBleedDisclaimerEnabledForService(serviceMeta)) return false;

    const display = pref?.preferencesDisplay;
    if (Array.isArray(display)) {
      return display.some((item) => isMixedWashPreferenceValue(item?.value));
    }

    const stored = pref?.preferencesArray;
    if (Array.isArray(stored)) {
      return stored.some((item) => isMixedWashPreferenceValue(item?.value));
    }

    return false;
  });
}
