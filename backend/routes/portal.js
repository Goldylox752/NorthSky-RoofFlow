const router = require("express").Router();
const stripe = require("../lib/stripe");
const supabase = require("../lib/supabase");

/* ===============================
   CREATE BILLING PORTAL SESSION
=============================== */
router.post("/portal", async (req, res) => {
  try {
    const { email } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!email) {
      return res.status(400).json({
        success: false,
        stage: "validation",
        error: "Missing email",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    /* ===============================
       GET STRIPE CUSTOMER
    =============================== */
    const { data: user, error: userError } = await supabase
      .from("leads")
      .select("stripe_customer_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error("Supabase error:", userError);
      return res.status(500).json({
        success: false,
        stage: "database_error",
        error: "Failed to fetch user",
      });
    }

    if (!user?.stripe_customer_id) {
      return res.status(404).json({
        success: false,
        stage: "not_found",
        error: "No Stripe customer found for this email",
      });
    }

    /* ===============================
       CREATE BILLING PORTAL SESSION
    =============================== */
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.FRONTEND_URL,
    });

    if (!session?.url) {
      return res.status(500).json({
        success: false,
        stage: "stripe_error",
        error: "Failed to create portal session",
      });
    }

    /* ===============================
       RESPONSE
    =============================== */
    return res.json({
      success: true,
      stage: "portal_created",
      url: session.url,
    });

  } catch (err) {
    console.error("Billing portal error:", err);

    return res.status(500).json({
      success: false,
      stage: "server_error",
      error: err.message || "Unexpected error",
    });
  }
});

module.exports = router;