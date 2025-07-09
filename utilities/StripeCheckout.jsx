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

// Stripe public key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2
);

let amount = "";
const CheckoutForm = ({ setModal, modal, booking, onOpen }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  // const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

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
    } else {
      setMessage(`Payment status: ${paymentIntent?.status}`);
    }

    if (error) {
      setMessage(error.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`mt-4 w-full flex justify-center items-center ${
          isProcessing ? "bg-theme-blue/50" : "bg-theme-blue"
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
    const res = await createPaymentIntent({
      amount: totalAmount,
      customerId,
    }).unwrap();

    if (res?.status === "1") {
      console.log(res?.data, "res?.datares?.data");
      setClientSecret(res?.data?.clientSecret);
      amount = res?.data?.amount;
      setModal({ ...modal, page: "stripe" });
    }
  };
  useEffect(() => {
    getIntent();
  }, []);

  const appearance = { theme: "stripe" };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="mx-auto">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            setModal={setModal}
            modal={modal}
            booking={booking}
            onOpen={onOpen}
          />
        </Elements>
      )}
    </div>
  );
};

export default StripeCheckout;
