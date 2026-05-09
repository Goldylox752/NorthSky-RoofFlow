const router = require("express").Router();
const stripe = require("../lib/stripe");

/* ===============================
   VALIDATION HELPERS
=============================== */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ===============================
   CHECKOUT SESSION
=============================== */
router.post("/checkout", async (req, res) => {
  try {
    const { email, name = "Guest User", plan = "starter" } = req.body || {};

    // ===============================
    // VALIDATION
    // ===============================
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Missing email",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email",
      });
    }

    // ===============================
    // PRICE CONFIG (temporary)
    // Replace with Stripe Price IDs later
    // ===============================
    const prices = {
      starter: 100,
      pro: 200,
    };

    const amount = prices[plan] || prices.starter;

    // ===============================
    // CREATE STRIPE SESSION
    // ===============================
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: cleanEmail,

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Flow OS - ${plan}`,
              description: "Automated lead system access",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        email: cleanEmail,
        name,
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
      error: err.message || "checkout_failed",
    });
  }
});

/* ===============================
   VERIFY (READ-ONLY ONLY)
   ⚠️ DO NOT USE FOR PAYMENT TRUTH
=============================== */
router.get("/verify", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        paid: false,
        error: "Missing session_id",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const paid = session.payment_status === "paid";

    return res.json({
      success: true,
      paid,
      email:
        session.customer_details?.email ||
        session.customer_email ||
        session.metadata?.email ||
        null,
    });
  } catch (err) {
    console.error("Verify error:", err);

    return res.status(500).json({
      success: false,
      paid: false,
      error: err.message || "verification_failed",
    });
  }
});

module.exports = router;