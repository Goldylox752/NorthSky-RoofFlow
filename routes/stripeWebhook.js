const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    /* ===============================
       PAYMENT SUCCESS → UNLOCK LEAD
    =============================== */
    if (event.type === "payment_intent.succeeded") {
      const payment = event.data.object;

      const { leadId, contractorId } = payment.metadata;

      // 1. mark paid
      // 2. assign lead
      // 3. unlock system

      console.log("Paid lead:", leadId, contractorId);
    }

    res.json({ received: true });
  }
);

module.exports = router;