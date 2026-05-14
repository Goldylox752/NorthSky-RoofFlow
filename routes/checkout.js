const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const { createCheckoutSession } = require("../services/stripe/checkout.service");

/* ===============================
   CHECKOUT ROUTE (AUTH REQUIRED)
   - Creates Stripe checkout session
   - Returns redirect URL
=============================== */
router.post("/checkout", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const plan = req.body?.plan;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "unauthorized",
      });
    }

    if (!plan) {
      return res.status(400).json({
        success: false,
        error: "missing_plan",
      });
    }

    const session = await createCheckoutSession({
      authId: userId,
      plan,
    });

    if (!session || !session.url) {
      return res.status(500).json({
        success: false,
        error: "checkout_session_failed",
      });
    }

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("Checkout error:", err);

    return res.status(500).json({
      success: false,
      error: "internal_server_error",
    });
  }
});

module.exports = router;