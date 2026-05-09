const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { createCheckoutSession } = require("../services/stripe/checkout.service");

/* ===============================
   CHECKOUT (PROTECTED)
=============================== */
router.post("/checkout", auth, async (req, res) => {
  try {
    const session = await createCheckoutSession({
      authId: req.user.id,
      plan: req.body.plan,
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("Checkout error:", err);

    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;