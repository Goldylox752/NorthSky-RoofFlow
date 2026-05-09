const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   PRICE IDS
=============================== */
const prices = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  elite: process.env.STRIPE_ELITE_PRICE_ID,
};

/* ===============================
   CREATE CHECKOUT SESSION
=============================== */
async function createCheckoutSession({ plan, email }) {
  if (!plan) throw new Error("Plan is required");

  const priceId = prices[plan];

  if (!priceId) throw new Error("Invalid plan");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,

    metadata: {
      plan,
      email: email?.toLowerCase()?.trim() || null,
    },
  });

  return session;
}

module.exports = {
  createCheckoutSession,
};