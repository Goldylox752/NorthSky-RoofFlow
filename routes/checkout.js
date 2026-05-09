const router = require("express").Router();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   PRICE IDS (Stripe recommended)
=============================== */
const prices = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  elite: process.env.STRIPE_ELITE_PRICE_ID,
};

/* ===============================
   CHECKOUT SESSION
=============================== */
router.post("/checkout", async (req, res) => {
  try {
    const { plan, email } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: "Plan is required",
      });
    }

    const priceId = prices[plan];

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan",
      });
    }

    /* ===============================
       CREATE STRIPE SESSION
    =============================== */
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

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("Checkout error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Checkout failed",
    });
  }
});

module.exports = router;