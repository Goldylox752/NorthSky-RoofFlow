const router = require("express").Router();
const stripe = require("../lib/stripe");
const supabase = require("../lib/supabase");

const auth = require("../../middleware/auth.middleware");

/* ===============================
   CREATE BILLING PORTAL SESSION
=============================== */
router.post("/portal", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    /* ===============================
       VALIDATION
    =============================== */
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    /* ===============================
       GET STRIPE CUSTOMER ID
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
        error: "No Stripe customer found",
      });
    }

    /* ===============================
       CREATE STRIPE PORTAL SESSION
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