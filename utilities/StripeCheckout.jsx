"use client";
import React, { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { addToast, Spinner } from "@heroui/react";
import { useCreateIntentMutation, useGetPaymentMethodsQuery } from "@/app/store/services/api";
import { cx } from "../components/ds/cx";

/*
 * Payment form in the checkout "Card details" popup:
 *  1. Saved cards (customer/payment-methods) — pick one, nothing to type.
 *  2. "Use a new payment method": Apple Pay / Google Pay buttons (Stripe Express
 *     Checkout, only where the device supports them), then Stripe's Payment Element
 *     with every method enabled in the Stripe Dashboard (card, Link, …), styled like the site.
 * Methods that send the customer to their bank/app come back here (return_url) and the
 * order is placed then (see the return handler in StripeCheckout below).
 * Previous version: see git history (before the 2026 redesign)
 */

// Stripe public key - only initialize if key exists
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2;

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Payment Element look: site font, colours, 12px corners, thin borders, no shadows
const APPEARANCE = {
  theme: "stripe",
  variables: {
    fontFamily: "Figtree, system-ui, sans-serif",
    fontSizeBase: "15px",
    colorPrimary: "#0278FE",
    colorText: "#1B2230",
    colorTextSecondary: "#56617A",
    colorTextPlaceholder: "#8A93A6",
    colorDanger: "#C0392B",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #DDE3EE", boxShadow: "none", padding: "14px" },
    ".Input:focus": { borderColor: "#0278FE", boxShadow: "0 0 0 3px rgba(2,120,254,0.14)" },
    ".Label": { fontSize: "13.5px", fontWeight: "500", color: "#56617A" },
    ".AccordionItem": { border: "1px solid #DDE3EE", boxShadow: "none" },
    ".Tab": { border: "1px solid #DDE3EE", boxShadow: "none" },
  },
};

const ELEMENTS_OPTIONS = {
  appearance: APPEARANCE,
  fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap" }],
};

const LABEL = "m-0 text-[12px] font-bold uppercase tracking-[0.1em] text-jdc-muted";
const OPTION =
  "flex w-full cursor-pointer items-center gap-3 border-0 border-b border-jdc-line bg-white px-4 py-3.5 text-left last:border-b-0 hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-55";
const RADIO = "flex size-[18px] flex-none items-center justify-center rounded-full border-[1.5px] border-[#C5CEDD]";
const RADIO_ON = "border-jdc-blue after:size-2.5 after:rounded-full after:bg-jdc-blue after:content-['']";

const BRAND = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover", diners: "Diners", jcb: "JCB", unionpay: "UnionPay" };
const cardLabel = (c) => `${BRAND[c?.brand] || (c?.brand ? c.brand[0].toUpperCase() + c.brand.slice(1) : "Card")} •••• ${c?.last4 || "····"}`;
const cardExpiry = (c) => (c?.expMonth && c?.expYear ? `${String(c.expMonth).padStart(2, "0")}/${String(c.expYear).slice(-2)}` : "");

const CheckoutForm = forwardRef(function CheckoutForm(
  {
    clientSecret,
    savedCards = [],
    defaultCardId = null,
    cardsReady = true,
    setModal,
    booking,
    onOpen,
    intentMode = "payment",
    intentId = "",
    beforePay,
    onCompleteChange,
    onProcessingChange,
  },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();
  const formRef = useRef(null);
  const [isProcessing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [peComplete, setPeComplete] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState(false);

  /*
   * Order in the popup: 1) saved cards (default only, "Show more" for the rest),
   * 2) Apple Pay / Google Pay, 3) Card, 4) other methods (3 and 4 are Stripe's Payment
   * Element with card first). It works as one choice: opening a Payment Element method
   * deselects the saved card ("new"), picking a saved card closes the Payment Element.
   */
  const usable = savedCards.filter((c) => !c.isExpired);
  const [selected, setSelected] = useState("");
  const pickedByUser = useRef(false);
  const choose = (id) => {
    pickedByUser.current = true;
    setSelected(id);
    if (id !== "new") elements?.getElement(PaymentElement)?.collapse();
  };
  // Pre-select the default card once the list has loaded (it arrives after the form mounts)
  useEffect(() => {
    if (pickedByUser.current) return;
    const pick = usable.find((c) => c.paymentMethodId === defaultCardId) || usable[0];
    setSelected(pick ? pick.paymentMethodId : "new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCards.length, defaultCardId]);
  const useNew = selected === "new" || !usable.length;

  // When the customer opens Card (or another method) further down the popup, bring its
  // fields into view instead of making them scroll. Not on the popup's first render.
  const peWrapRef = useRef(null);
  const openTypeRef = useRef(null);
  const peSeenRef = useRef(false);
  const revealOpenedMethod = (event) => {
    const type = event?.collapsed === false ? event?.value?.type || "open" : null;
    const changed = type && type !== openTypeRef.current;
    openTypeRef.current = type;
    if (!peSeenRef.current) {
      peSeenRef.current = true; // first event is Stripe's initial state, not a tap
      return;
    }
    if (!changed) return;
    // wait for the accordion to expand, then scroll the popup body
    setTimeout(() => peWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 220);
  };

  // Default card first, then the others; expired cards last. Only the default shows, the rest behind "Show more".
  const SHOWN_CARDS = 1;
  const [showAllCards, setShowAllCards] = useState(false);
  const orderedCards = useMemo(
    () =>
      [...savedCards].sort(
        (a, b) =>
          Number(b.paymentMethodId === defaultCardId) - Number(a.paymentMethodId === defaultCardId) ||
          Number(a.isExpired) - Number(b.isExpired)
      ),
    [savedCards, defaultCardId]
  );
  const visibleCards = showAllCards
    ? orderedCards
    : orderedCards.filter((c, i) => i < SHOWN_CARDS || c.paymentMethodId === selected);
  const hiddenCount = orderedCards.length - visibleCards.length;

  useEffect(() => {
    onCompleteChange?.(useNew ? peComplete : Boolean(selected));
  }, [useNew, peComplete, selected, onCompleteChange]);

  useImperativeHandle(ref, () => ({
    requestSubmit: () => formRef.current?.requestSubmit(),
  }));

  useEffect(() => {
    onProcessingChange?.(isProcessing);
  }, [isProcessing, onProcessingChange]);

  const placeBooking = async (payData) => {
    try {
      await booking(payData);
      setProcessing(false);
      setMessage("");
      setModal({ page: "success", modType: "success" });
      onOpen();
      return true;
    } catch (err) {
      setMessage(err?.message || "Booking failed. Please try again.");
      setProcessing(false);
      return false;
    }
  };

  // After Stripe confirms a new method: create the booking with what Stripe returned.
  const finishBooking = async ({ error, setupIntent, paymentIntent }) => {
    if (error) {
      setMessage(error.message);
      setProcessing(false);
      return false;
    }
    const intent = setupIntent || paymentIntent;
    const ok =
      intentMode === "setup"
        ? intent?.status === "succeeded"
        : intent?.status === "requires_capture" || intent?.status === "succeeded";
    if (!ok) {
      setMessage(`${intentMode === "setup" ? "Setup" : "Payment"} status: ${intent?.status}`);
      setProcessing(false);
      return false;
    }
    return placeBooking(
      intentMode === "setup"
        ? { setupIntentId: intent?.id || intentId, paymentMethodId: intent?.payment_method }
        : { paymentIntentId: intent?.id || intentId, paymentMethodId: intent?.payment_method }
    );
  };

  const confirmNewMethod = async () => {
    const params = {
      elements,
      clientSecret,
      // methods that open the customer's bank/app return to this page to finish
      confirmParams: { return_url: window.location.href.split("?")[0] },
      redirect: "if_required",
    };
    return intentMode === "setup" ? stripe.confirmSetup(params) : stripe.confirmPayment(params);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage("Payment form is still loading. Please wait…");
      return;
    }
    if (typeof beforePay === "function" && beforePay() === false) return;

    setProcessing(true);
    setMessage("");
    try {
      if (!useNew) {
        // saved card: the backend charges it after the items are weighed
        await placeBooking({ paymentMethodId: selected });
        return;
      }
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage(submitError.message);
        setProcessing(false);
        return;
      }
      await finishBooking(await confirmNewMethod());
    } catch (err) {
      console.error("Payment error:", err);
      setMessage(err?.message || "An error occurred during payment");
      setProcessing(false);
    }
  };

  // Apple Pay / Google Pay
  const onWalletClick = (event) => {
    if (typeof beforePay === "function" && beforePay() === false) return;
    setMessage("");
    event.resolve();
  };
  const onWalletConfirm = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      await finishBooking(await confirmNewMethod());
    } catch (err) {
      setMessage(err?.message || "An error occurred during payment");
      setProcessing(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid w-full gap-[18px]">
      {usable.length || savedCards.length ? (
        <div className="grid gap-2.5">
          <p className={LABEL}>Saved cards</p>
          <div className="overflow-hidden rounded-2xl border border-jdc-line" role="radiogroup" aria-label="Saved cards">
            {visibleCards.map((c) => {
              const on = selected === c.paymentMethodId;
              return (
                <button
                  key={c.paymentMethodId}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={c.isExpired}
                  className={OPTION}
                  onClick={() => choose(c.paymentMethodId)}
                >
                  <span className={cx(RADIO, on && RADIO_ON)} />
                  <span className="min-w-0 flex-1">
                    <b className="block text-[15px] font-semibold text-jdc-navy">{cardLabel(c)}</b>
                    <small className="block text-[13px] text-jdc-muted">
                      {c.isExpired ? "Expired" : `Expires ${cardExpiry(c)}`}
                    </small>
                  </span>
                  {c.isDefault ? (
                    <span className="flex-none rounded-jdc-pill bg-[#F1F3F7] px-2.5 py-1 text-[11.5px] font-bold text-jdc-navy">Default</span>
                  ) : null}
                </button>
              );
            })}
            {hiddenCount > 0 || showAllCards ? (
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-0 border-b border-jdc-line bg-[#F7F8FA] px-4 py-2.5 text-[13.5px] font-bold text-jdc-navy hover:bg-[#EEF2F8]"
                onClick={() => setShowAllCards((v) => !v)}
                aria-expanded={showAllCards}
              >
                {showAllCards ? "Show fewer cards" : `Show ${hiddenCount} more saved card${hiddenCount === 1 ? "" : "s"}`}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  aria-hidden="true"
                  className={showAllCards ? "rotate-180" : ""}
                >
                  <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 2) Apple Pay / Google Pay — only rendered visibly where the device supports them */}
      <div className={walletsAvailable ? "grid gap-2.5" : "hidden"}>
        <p className={LABEL}>Express checkout</p>
        <ExpressCheckoutElement
            options={{
              buttonHeight: 48,
              buttonType: { applePay: "plain", googlePay: "plain" },
              paymentMethods: { applePay: "auto", googlePay: "auto", link: "never", paypal: "never", amazonPay: "never", klarna: "never" },
              layout: { maxColumns: 2, maxRows: 1, overflow: "never" },
            }}
            onReady={({ availablePaymentMethods }) => setWalletsAvailable(Boolean(availablePaymentMethods))}
            onClick={onWalletClick}
            onConfirm={onWalletConfirm}
          />
      </div>

      {/* 3) Card, 4) other methods. Closed while a saved card is chosen; opening one selects it. */}
      <div ref={peWrapRef} className="grid scroll-mt-3 gap-2.5">
        {usable.length || walletsAvailable ? <p className={LABEL}>{usable.length ? "Or pay another way" : "Card or other ways to pay"}</p> : null}
        {/* mounted after the saved cards have loaded, so it starts closed when there is a saved card */}
        {!cardsReady ? (
          <p className="m-0 text-[13.5px] text-jdc-muted">Loading payment options…</p>
        ) : (
        <PaymentElement
          options={{
            layout: { type: "accordion", defaultCollapsed: usable.length > 0, radios: true, spacedAccordionItems: true },
            paymentMethodOrder: ["card"],
            wallets: { applePay: "never", googlePay: "never" },
          }}
          onChange={(event) => {
            setPeComplete(Boolean(event?.complete));
            if (event && event.collapsed === false && selected !== "new") choose("new");
            revealOpenedMethod(event);
          }}
          onLoadError={(error) => setMessage(error?.error?.message || error?.message || "Couldn't load the payment form.")}
        />
        )}
      </div>

      {message ? <p className="m-0 text-[13.5px] text-jdc-danger">{message}</p> : null}
    </form>
  );
});

const StripeCheckout = ({
  setModal,
  modal,
  booking,
  totalAmount,
  onOpen,
  customerId,
  beforePay,
  stripeSubmitRef,
  onCompleteChange,
  onProcessingChange,
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [intentMode, setIntentMode] = useState("payment"); // "payment" | "setup"
  const [intentId, setIntentId] = useState(""); // Payment Intent ID or Setup Intent ID extracted from client secret
  const [createPaymentIntent, { isLoading }] = useCreateIntentMutation();
  const [initError, setInitError] = useState("");
  const { data: savedData, isFetching: cardsLoading } = useGetPaymentMethodsQuery(undefined, { skip: !customerId });
  const savedCards = savedData?.data?.cards || [];
  const defaultCardId = savedData?.data?.defaultPaymentMethodId || null;

  // Back from a bank/app redirect (some payment methods): finish placing the order.
  const returnHandledRef = useRef(false);
  useEffect(() => {
    if (returnHandledRef.current || typeof window === "undefined" || !stripePromise) return;
    const params = new URLSearchParams(window.location.search);
    const setupSecret = params.get("setup_intent_client_secret");
    const paySecret = params.get("payment_intent_client_secret");
    if (!setupSecret && !paySecret) return;
    returnHandledRef.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    (async () => {
      const stripe = await stripePromise;
      const res = setupSecret ? await stripe.retrieveSetupIntent(setupSecret) : await stripe.retrievePaymentIntent(paySecret);
      const intent = res?.setupIntent || res?.paymentIntent;
      const ok = ["succeeded", "requires_capture", "processing"].includes(intent?.status);
      if (!ok) {
        addToast({ title: "Payment not completed", description: "Please try again or choose another way to pay.", color: "warning" });
        return;
      }
      try {
        await booking(
          setupSecret
            ? { setupIntentId: intent.id, paymentMethodId: intent.payment_method }
            : { paymentIntentId: intent.id, paymentMethodId: intent.payment_method }
        );
      } catch {
        // handleCreateBooking already shows the error
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIntent = async () => {
    if (!customerId) {
      setInitError("Customer profile is missing. Please sign in again to continue.");
      return;
    }

    try {
      const res = await createPaymentIntent({
        amount: Number.isFinite(Number(totalAmount)) ? Number(totalAmount) : 0,
        customerId,
      }).unwrap();

      if (res?.status === "1") {
        const secret = res?.data?.clientSecret;

        // Accept Payment Intent (pi_) or Setup Intent (seti_) from API
        if (!secret || (!secret.startsWith("pi_") && !secret.startsWith("seti_"))) {
          addToast({
            title: "Payment Error",
            description: "Invalid payment or setup intent received from server",
            color: "danger",
          });
          return;
        }

        // "pi_xxx_secret_yyy" -> "pi_xxx", "seti_xxx_secret_yyy" -> "seti_xxx"
        setClientSecret(secret);
        setInitError("");
        setIntentMode(secret.startsWith("seti_") ? "setup" : "payment");
        setIntentId(secret.split("_secret_")[0]);
        setModal({ ...modal, page: "stripe" });
      } else {
        addToast({
          title: "Payment Error",
          description: res?.message || "Failed to initialize payment",
          color: "danger",
        });
        setInitError(res?.message || "Failed to initialize payment");
      }
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || "Failed to initialize payment";
      addToast({ title: "Payment Error", description: errorMessage, color: "danger" });
      setInitError(errorMessage);
    }
  };

  useEffect(() => {
    // A setup intent (save the card, charge later) doesn't depend on the total,
    // so keep it: fetching a new one swapped the form for a spinner mid-order.
    if (customerId && !(clientSecret && intentMode === "setup")) {
      getIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount, customerId]);

  if (!stripePublishableKey) {
    return (
      <div className="p-4 text-[14px] text-jdc-danger">
        Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2 environment variable.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 text-[14px] text-jdc-muted">
        <Spinner size="sm" />
        <span>Loading payment options…</span>
      </div>
    );
  }

  if (!clientSecret) {
    return <div className="p-4 text-[14px] text-jdc-danger">{initError || "Failed to initialize payment. Please try again."}</div>;
  }

  return (
    <div className="w-full">
      <Elements key={clientSecret} options={{ ...ELEMENTS_OPTIONS, clientSecret }} stripe={stripePromise}>
        <CheckoutForm
          ref={stripeSubmitRef}
          clientSecret={clientSecret}
          savedCards={savedCards}
          defaultCardId={defaultCardId}
          cardsReady={!cardsLoading}
          setModal={setModal}
          booking={booking}
          onOpen={onOpen}
          intentMode={intentMode}
          intentId={intentId}
          beforePay={beforePay}
          onCompleteChange={onCompleteChange}
          onProcessingChange={onProcessingChange}
        />
      </Elements>
    </div>
  );
};

export default StripeCheckout;
