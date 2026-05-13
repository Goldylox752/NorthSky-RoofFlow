const express = require("express");
const Stripe = require("stripe");
const { lockLeadPrice } = require("../lib/lockLeadPrice");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   CHARGE FOR LEAD
=============================== */
router.post("/charge-lead", async (req, res) => {
  try {
    const { lead, contractor, cityRow, systemMetrics } = req.body;

    if (!lead || !contractor) {
      return res.status(400).json({
        success: false,
        error: "Missing lead or contractor",
      });
    }

    /* ===============================
       1. LOCK PRICE (YOUR ENGINE)
    =============================== */
    const priceData = lockLeadPrice({
      lead,
      contractor,
      cityRow,
      systemMetrics,
    });

    const amount = priceData.finalPrice;

    /* ===============================
       2. CREATE STRIPE PAYMENT INTENT
    =============================== */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency: "usd",
      metadata: {
        leadId: lead.id,
        contractorId: contractor.id,
        price: amount,
      },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount,
      leadId: lead.id,
    });
  } catch (err) {
    console.error("Stripe charge error:", err);

    return res.status(500).json({
      success: false,
      error: "Payment failed",
    });
  }
});

module.exports = router;