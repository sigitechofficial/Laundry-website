"use client";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { addToast, Spinner } from "@heroui/react";
import { useCreateIntentMutation } from "@/app/store/services/api";

// Stripe public key - only initialize if key exists
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2;

// Debug log (remove in production)
if (typeof window !== "undefined") {
  console.log("Stripe Publishable Key loaded:", stripePublishableKey ? "✅ Yes" : "❌ No");
  if (stripePublishableKey) {
    // Extract account ID from publishable key for verification
    const accountId = stripePublishableKey.split('_')[2]?.substring(0, 24);
    console.log("Stripe Account ID (first 24 chars):", accountId);
  }
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CheckoutForm = ({ setModal, modal, booking, onOpen, intentMode = "payment", intentId = "", displayAmount = "" }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe is not loaded. Please wait...");
      return;
    }

    if (!isPaymentElementReady) {
      setMessage("Payment form is not ready. Please wait...");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      if (intentMode === "setup") {
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: "if_required",
        });

        if (error) {
          setMessage(error.message);
          setProcessing(false);
          return;
        }

        if (setupIntent?.status === "succeeded") {
          booking({
            setupIntentId: setupIntent?.id || intentId, // Use confirmed ID or fallback to extracted ID
            paymentMethodId: setupIntent?.payment_method,
          });
          setProcessing(false);
          setMessage("");
          setModal({ page: "success", modType: "success" });
          onOpen();
        } else {
          setMessage(`Setup status: ${setupIntent?.status}`);
          setProcessing(false);
        }
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded") {
        booking({
          paymentIntentId: paymentIntent?.id || intentId, // Use confirmed ID or fallback to extracted ID
          paymentMethodId: paymentIntent?.payment_method,
        });
        setProcessing(false);
        setMessage("");
        setModal({ page: "success", modType: "success" });
        onOpen();
      } else {
        setMessage(`Payment status: ${paymentIntent?.status}`);
        setProcessing(false);
      }

      if (error) {
        setMessage(error.message);
        setProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage(err?.message || "An error occurred during payment");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        onReady={() => {
          setIsPaymentElementReady(true);
          console.log("✅ PaymentElement is ready");
        }}
        onLoadError={(error) => {
          console.error("❌ PaymentElement load error:", error);
          setMessage(error?.message || "Failed to load payment form. Please check your Stripe keys match.");
        }}
        options={{
          layout: "tabs"
        }}
      />
      <button
        type="submit"
        disabled={!stripe || isProcessing || !isPaymentElementReady}
        className={`mt-4 w-full flex justify-center items-center ${isProcessing || !isPaymentElementReady ? "bg-theme-blue/50" : "bg-theme-blue"
          }  font-youth font-bold text-white px-4 py-4 rounded`}
      >
        {isProcessing ? (
          <div className="flex items-center h-full">
            <Spinner
              classNames={{ label: "text-foreground" }}
              variant="simple"
            />
          </div>
        ) : intentMode === "setup" ? (
          "Save card"
        ) : (
          displayAmount ? `Pay Now ${displayAmount}` : "Pay Now"
        )}
      </button>
      {message && <div className="text-red-500 mt-2">{message}</div>}
    </form>
  );
};

const StripeCheckout = ({
  paymentMethod,
  setModal,
  modal,
  booking,
  totalAmount,
  onOpen,
  customerId,
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [intentMode, setIntentMode] = useState("payment"); // "payment" | "setup"
  const [intentId, setIntentId] = useState(""); // Payment Intent ID or Setup Intent ID extracted from client secret
  const [displayAmount, setDisplayAmount] = useState(""); // Formatted amount for button (empty for Setup Intent)
  const [createPaymentIntent, { data, isSuccess, isLoading }] =
    useCreateIntentMutation();

  const formatAmount = (value) => {
    if (value == null || value === "") return "";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (Number.isNaN(num)) return "";
    const dollars = num >= 1000 ? num / 100 : num;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dollars);
  };

  const getIntent = async () => {
    try {
      const res = await createPaymentIntent({
        amount: totalAmount,
        customerId,
      }).unwrap();

      if (res?.status === "1") {
        console.log("Payment Intent created:", res?.data);
        const clientSecret = res?.data?.clientSecret;

        // Accept Payment Intent (pi_) or Setup Intent (seti_) from API
        if (!clientSecret || (!clientSecret.startsWith('pi_') && !clientSecret.startsWith('seti_'))) {
          console.error("Invalid client secret format:", clientSecret);
          addToast({
            title: "Payment Error",
            description: "Invalid payment or setup intent received from server",
            color: "danger",
          });
          return;
        }

        const isSetupIntent = clientSecret.startsWith('seti_');
        // Extract Intent ID from client secret: "pi_xxx_secret_yyy" -> "pi_xxx" or "seti_xxx_secret_yyy" -> "seti_xxx"
        const extractedIntentId = clientSecret.split('_secret_')[0];
        console.log(isSetupIntent ? "Setup Intent ID:" : "Payment Intent ID:", extractedIntentId);
        console.log("Using Publishable Key:", stripePublishableKey?.substring(0, 30) + "...");
        console.log("⚠️ IMPORTANT: Ensure your backend uses the SECRET KEY that matches this publishable key!");

        setClientSecret(clientSecret);
        setIntentMode(isSetupIntent ? "setup" : "payment");
        setIntentId(extractedIntentId); // Store the extracted intent ID
        setDisplayAmount(res?.data?.amount != null ? formatAmount(res.data.amount) : "");
        setModal({ ...modal, page: "stripe" });
      } else {
        console.error("Failed to create payment intent:", res);
        addToast({
          title: "Payment Error",
          description: res?.message || "Failed to initialize payment",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      addToast({
        title: "Payment Error",
        description: error?.data?.message || error?.message || "Failed to initialize payment",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    if (totalAmount && customerId) {
      getIntent();
    }
  }, [totalAmount, customerId]);

  const appearance = { theme: "stripe" };
  const options = {
    clientSecret,
    appearance,
  };

  // Don't render Stripe if publishable key is not configured
  if (!stripePublishableKey) {
    return (
      <div className="mx-auto p-4 text-red-500">
        Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2 environment variable.
      </div>
    );
  }

  // Show loading state while creating payment intent
  if (isLoading) {
    return (
      <div className="mx-auto p-4 flex justify-center items-center">
        <Spinner size="lg" />
        <span className="ml-2">Initializing payment...</span>
      </div>
    );
  }

  // Show error if no client secret
  if (!clientSecret && !isLoading) {
    return (
      <div className="mx-auto p-4 text-red-500">
        Failed to initialize payment. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {clientSecret && stripePromise && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            setModal={setModal}
            modal={modal}
            booking={booking}
            onOpen={onOpen}
            intentMode={intentMode}
            intentId={intentId}
            displayAmount={displayAmount}
          />
        </Elements>
      )}
      {!stripePromise && (
        <div className="mx-auto p-4 text-red-500">
          Stripe is not initialized. Please check your configuration.
        </div>
      )}
    </div>
  );
};

export default StripeCheckout;
