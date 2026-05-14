const express = require("express");
const Stripe = require("stripe");

const { lockLeadPrice } = require("../lib/lockLeadPrice");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   CHARGE LEAD
   - PRICE IS LOCKED SERVER-SIDE
   - STRIPE PAYMENT INTENT CREATED
   - METADATA USED FOR WEBHOOK RECONCILIATION
=============================== */
router.post("/charge-lead", async (req, res) => {
  try {
    const { lead, contractor, cityRow, systemMetrics } = req.body;

    if (!lead || !contractor) {
      return res.status(400).json({
        success: false,
        error: "missing_required_fields",
      });
    }

    if (!lead.id || !contractor.id) {
      return res.status(400).json({
        success: false,
        error: "invalid_lead_or_contractor",
      });
    }

    /*
      1. LOCK PRICE (business logic layer)
      Ensures pricing cannot be manipulated from client side
    */
    const priceData = lockLeadPrice({
      lead,
      contractor,
      cityRow,
      systemMetrics,
    });

    if (!priceData || typeof priceData.finalPrice !== "number") {
      return res.status(500).json({
        success: false,
        error: "price_calculation_failed",
      });
    }

    const amount = Math.round(priceData.finalPrice);

    /*
      2. CREATE STRIPE PAYMENT INTENT
      - amount must be integer (cents)
      - metadata used for webhook reconciliation
    */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        leadId: String(lead.id),
        contractorId: String(contractor.id),
        price: String(amount),
      },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount,
      leadId: lead.id,
    });

  } catch (err) {
    console.error("Stripe charge-lead error:", err);

    return res.status(500).json({
      success: false,
      error: "payment_intent_failed",
    });
  }
});

module.exports = router;