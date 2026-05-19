import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const BASE_URL = process.env.CLIENT_URL?.trim();

/* ===============================
   SAFETY CHECK (fail fast)
=============================== */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!BASE_URL) {
  throw new Error("Missing CLIENT_URL");
}

/* ===============================
   PRICING (SERVER TRUTH)
=============================== */

const PRICES = Object.freeze({
  starter: { amount: 1000, name: "Starter" },
  growth: { amount: 2000, name: "Growth" },
  elite: { amount: 5000, name: "Elite" },
});

/* ===============================
   HELPERS
=============================== */

const cleanPlan = (plan) =>
  typeof plan === "string" ? plan.trim().toLowerCase() : "starter";

/* ===============================
   ROUTE
=============================== */

export async function POST(req) {
  const startedAt = Date.now();

  try {
    /* ===============================
       PARSE REQUEST SAFELY
    =============================== */

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { success: false, error: "invalid_json" },
        { status: 400 }
      );
    }

    const plan = cleanPlan(body.plan);
    const userId = body.userId;

    /* ===============================
       VALIDATION
    =============================== */

    if (!userId) {
      return Response.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const pricing = PRICES[plan];

    if (!pricing) {
      return Response.json(
        { success: false, error: "invalid_plan" },
        { status: 400 }
      );
    }

    /* ===============================
       CREATE CHECKOUT SESSION
    =============================== */

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: pricing.amount,
            product_data: {
              name: `RoofFlow — ${pricing.name}`,
              description: "AI Roofing Pipeline Platform",
            },
          },
        },
      ],

      metadata: {
        userId,
        plan,
        amount: String(pricing.amount),
      },

      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel`,

      // prevents stale sessions hanging around
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });

    if (!session?.url) {
      throw new Error("Stripe session creation failed");
    }

    /* ===============================
       RESPONSE
    =============================== */

    return Response.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      meta: {
        plan,
        amount: pricing.amount,
        processingTimeMs: Date.now() - startedAt,
      },
    });
  } catch (err) {
    console.error("[checkout error]", err);

    return Response.json(
      {
        success: false,
        error: "checkout_failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}