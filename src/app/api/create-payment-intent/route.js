import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod } = body; // e.g. 5000 for $50
    const stripeAmount = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "usd",
      payment_method_types: ["card"],
      capture_method: "manual",
      setup_future_usage: "off_session",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total: amount,
    });
  } catch (err) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
