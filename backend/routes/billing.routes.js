const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const {
  createCheckoutSession,
} = require("../services/stripe/checkout.service");

/* ===============================
   CREATE CHECKOUT SESSION
=============================== */
router.post("/checkout", auth, async (req, res) => {
  try {
    const session = await createCheckoutSession({
      user: req.user,
      plan: req.body.plan,
    });

    res.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("Checkout error:", err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;