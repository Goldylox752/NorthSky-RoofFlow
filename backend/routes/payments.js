const router = require("express").Router();
const stripe = require("../lib/stripe");
const auth = require("../../middleware/auth.middleware");

/* ===============================
   PLAN CONFIG (FIXED MODEL)
   NOTE: Stripe expects unit_amount in cents
=============================== */
const PRICES = {
  starter: 10000,
  pro: 20000,
};

/* ===============================
   CREATE CHECKOUT SESSION
=============================== */
router.post("/checkout", auth, async (req, res) => {
  try {
    const user = req.user;
    const { plan = "starter" } = req.body;

    const unitAmount = PRICES[plan];

    if (!unitAmount) {
      return res.status(400).json({
        success: false,
        error: "invalid_plan",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: user.email || undefined,

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Flow OS - ${plan}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        auth_id: user.id,
        plan,
      },

      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (err) {
    console.error("Checkout error:", err);

    return res.status(500).json({
      success: false,
      error: "checkout_failed",
    });
  }
});

/* ===============================
   VERIFY SESSION (READ-ONLY CHECK)
=============================== */
router.get("/verify", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        paid: false,
        error: "missing_session_id",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return res.json({
      success: true,
      paid: session.payment_status === "paid",
      email: session.customer_email || null,
      plan: session.metadata?.plan || null,
    });
  } catch (err) {
    console.error("Verify error:", err);

    return res.status(500).json({
      success: false,
      paid: false,
      error: "verify_failed",
    });
  }
});

module.exports = router;