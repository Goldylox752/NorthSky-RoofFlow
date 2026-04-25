import Stripe from "stripe";
import { getPlan } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, plan, leadScore = 0 } = body;

    // 🔒 Validation
    if (!email || !phone || !plan) {
      return Response.json(
        { error: "email, phone, and plan are required" },
        { status: 400 }
      );
    }

    // 🔥 SINGLE SOURCE OF TRUTH
    const planData = getPlan(plan);

    if (!planData) {
      return Response.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    if (!planData.stripePriceId) {
      return Response.json(
        { error: `Missing Stripe price for plan: ${plan}` },
        { status: 500 }
      );
    }

    // 🚀 Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,

      line_items: [
        {
          price: planData.stripePriceId,
          quantity: 1,
        },
      ],

      metadata: {
        phone,
        plan,
        leadScore: String(leadScore),
      },

      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/apply`,
    });

    return Response.json({ url: session.url }, { status: 200 });

  } catch (err) {
    console.error("Stripe Checkout Error:", err);

    return Response.json(
      {
        error: "Checkout session creation failed",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
