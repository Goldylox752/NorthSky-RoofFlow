const crypto = require("crypto");
const stripe = require("../lib/stripe");
const { getOrCreateStripeCustomer } = require("../services/stripe/customer.service");

const PRICES = {
  starter: 1000,
  growth: 2000,
  elite: 5000,
};

const ALLOWED_PLANS = new Set(["starter", "growth", "elite"]);

async function createCheckoutSession({ authId, plan = "starter" }) {
  try {
    /* ===============================
       VALIDATION
    =============================== */
    if (!authId) throw new Error("Missing auth_id");
    if (!ALLOWED_PLANS.has(plan)) {
      throw new Error("Invalid plan");
    }

    const amount = PRICES[plan];

    /* ===============================
       CUSTOMER RESOLUTION
    =============================== */
    const customerId = await getOrCreateStripeCustomer({ id: authId });

    if (!customerId) {
      throw new Error("Stripe customer resolution failed");
    }

    /* ===============================
       IDEMPOTENCY
    =============================== */
    const idempotencyKey = crypto
      .createHash("sha256")
      .update(`${authId}:${plan}:${amount}`)
      .digest("hex");

    /* ===============================
       STRIPE SESSION
    =============================== */
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer: customerId,

        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Flow OS - ${plan.toUpperCase()}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],

        metadata: {
          auth_id: authId,
          plan,
        },

        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      },
      { idempotencyKey }
    );

    if (!session?.url) {
      throw new Error("Stripe session missing URL");
    }

    return {
      url: session.url,
      id: session.id,
    };

  } catch (err) {
    console.error("❌ Checkout Error:", {
      message: err.message,
      authId,
      plan,
    });

    throw err;
  }
}

module.exports = {
  createCheckoutSession,
};