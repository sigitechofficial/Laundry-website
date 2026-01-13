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

let amount = "";
const CheckoutForm = ({ setModal, modal, booking, onOpen }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  // const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe is not loaded. Please wait...");
      return;
    }

    // Check if PaymentElement is mounted and ready
    if (!isPaymentElementReady) {
      setMessage("Payment form is not ready. Please wait...");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        // confirmParams: {
        //   return_url: "http://localhost:3000/", // redirect after payment
        // },
        redirect: "if_required",
      });

      if (paymentIntent?.status === "requires_capture") {
        booking({
          paymentIntentId: paymentIntent?.id,
          paymentMethodId: paymentIntent?.payment_method,
        });
        amount = "";
        setProcessing(false);
        setMessage("");
        setModal({ page: "success", modType: "success" });
        onOpen();
      } else if (paymentIntent?.status === "succeeded") {
        booking({
          paymentIntentId: paymentIntent?.id,
          paymentMethodId: paymentIntent?.payment_method,
        });
        amount = "";
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
        ) : (
          `Pay Now ${amount}`
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
  const [createPaymentIntent, { data, isSuccess, isLoading }] =
    useCreateIntentMutation();

  const getIntent = async () => {
    try {
      const res = await createPaymentIntent({
        amount: totalAmount,
        customerId,
      }).unwrap();

      if (res?.status === "1") {
        console.log("Payment Intent created:", res?.data);
        const clientSecret = res?.data?.clientSecret;

        // Verify client secret format
        if (!clientSecret || !clientSecret.startsWith('pi_')) {
          console.error("Invalid client secret format:", clientSecret);
          addToast({
            title: "Payment Error",
            description: "Invalid payment intent received from server",
            color: "danger",
          });
          return;
        }

        // Extract payment intent ID for debugging
        const paymentIntentId = clientSecret.split('_secret_')[0];
        console.log("Payment Intent ID:", paymentIntentId);
        console.log("Using Publishable Key:", stripePublishableKey?.substring(0, 30) + "...");
        console.log("⚠️ IMPORTANT: Ensure your backend uses the SECRET KEY that matches this publishable key!");

        setClientSecret(clientSecret);
        amount = res?.data?.amount;
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
