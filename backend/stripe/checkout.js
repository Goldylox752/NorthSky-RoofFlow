const crypto = require("crypto");

const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");

/* ===============================
   ENV CONFIG
=============================== */

const BASE_URL = process.env.CLIENT_URL?.trim();

if (!BASE_URL) {
  throw new Error("Missing CLIENT_URL environment variable");
}

/* ===============================
   PRICING (SERVER SOURCE OF TRUTH)
=============================== */

const PRICES = Object.freeze({
  starter: {
    amount: 1000,
    name: "Starter",
  },
  growth: {
    amount: 2000,
    name: "Growth",
  },
  elite: {
    amount: 5000,
    name: "Elite",
  },
});

/* ===============================
   HELPERS
=============================== */

const clean = (v) =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.ip ||
  null;

const generateIdempotencyKey = ({ userId, plan, amount }) =>
  crypto
    .createHash("sha256")
    .update(`${userId}:${plan}:${amount}`)
    .digest("hex");

/* ===============================
   GET STRIPE CUSTOMER
=============================== */

async function getStripeCustomer(authId) {
  const { data, error } = await supabase
    .from("users")
    .select("stripe_customer_id, email")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw new Error("Customer lookup failed");
  if (!data?.stripe_customer_id) throw new Error("Missing Stripe customer");

  return data;
}

/* ===============================
   CREATE STRIPE SESSION
=============================== */

async function createStripeSession({
  customerId,
  authId,
  plan,
  amount,
}) {
  const idempotencyKey = generateIdempotencyKey({
    userId: authId,
    plan,
    amount,
  });

  return stripe.checkout.sessions.create(
    {
      mode: "payment",

      customer: customerId,
      customer_creation: "always",

      payment_method_types: ["card"],

      billing_address_collection: "auto",
      allow_promotion_codes: true,

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: `Flow OS — ${plan.toUpperCase()}`,
              description: "SaaS access + automation platform",
            },
          },
        },
      ],

      metadata: {
        auth_id: authId,
        plan,
        amount: String(amount),
      },

      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel`,

      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    },
    {
      idempotencyKey,
    }
  );
}

/* ===============================
   CHECKOUT CONTROLLER
=============================== */

async function checkout(req, res) {
  const startedAt = Date.now();

  try {
    /* ===============================
       AUTH (MUST COME FROM MIDDLEWARE)
    =============================== */

    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    /* ===============================
       PLAN VALIDATION
    =============================== */

    const plan = clean(req.body?.plan)?.toLowerCase() || "starter";
    const pricing = PRICES[plan];

    if (!pricing) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan",
      });
    }

    /* ===============================
       GET STRIPE CUSTOMER
    =============================== */

    const customer = await getStripeCustomer(user.id);

    /* ===============================
       CREATE SESSION
    =============================== */

    const session = await createStripeSession({
      customerId: customer.stripe_customer_id,
      authId: user.id,
      plan,
      amount: pricing.amount,
    });

    if (!session?.url) {
      throw new Error("Stripe session failed");
    }

    /* ===============================
       AUDIT LOG (NON-BLOCKING)
    =============================== */

    supabase.from("checkout_logs").insert({
      auth_id: user.id,
      stripe_session_id: session.id,
      plan,
      amount: pricing.amount,
      ip_address: getIp(req),
      user_agent: req.headers["user-agent"] || null,
      created_at: new Date().toISOString(),
    });

    /* ===============================
       RESPONSE
    =============================== */

    return res.json({
      success: true,
      checkout: {
        url: session.url,
        sessionId: session.id,
        plan,
        amount: pricing.amount,
        currency: "usd",
      },
      meta: {
        processingTimeMs: Date.now() - startedAt,
      },
    });
  } catch (err) {
    console.error("Checkout error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Checkout failed",
    });
  }
}

module.exports = checkout;