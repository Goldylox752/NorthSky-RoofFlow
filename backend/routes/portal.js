const router = require("express").Router();
const stripe = require("../lib/stripe");
const supabase = require("../lib/supabase");

const auth = require("../../middleware/auth.middleware");

/* ===============================
   STRIPE BILLING PORTAL
=============================== */
router.post("/portal", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    /* ===============================
       GET STRIPE CUSTOMER
    =============================== */
    const { data: user, error } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("auth_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Database error",
      });
    }

    if (!user?.stripe_customer_id) {
      return res.status(404).json({
        success: false,
        error: "Stripe customer not found",
      });
    }

    /* ===============================
       SAFETY CHECK
    =============================== */
    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({
        success: false,
        error: "Missing FRONTEND_URL env",
      });
    }

    /* ===============================
       CREATE PORTAL SESSION
    =============================== */
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.FRONTEND_URL,
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("Billing portal error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "server_error",
    });
  }
});

module.exports = router;