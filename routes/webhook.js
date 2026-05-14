const express = require("express");
const router = express.Router();

const stripe = require("../lib/stripe");

const handleInvoicePaid = require("../services/stripe/handleInvoicePaid");
const handleCheckoutCompleted = require("../services/stripe/handleCheckoutCompleted");
const handleSubscriptionUpdated = require("../services/stripe/handleSubscriptionUpdated");

/* ===============================
   STRIPE WEBHOOK ROUTE
   - RAW BODY REQUIRED
   - SIGNATURE VERIFICATION REQUIRED
   - IDEMPOTENCY READY
=============================== */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).json({
        success: false,
        error: "missing_signature",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Invalid Stripe signature:", err.message);

      return res.status(400).json({
        success: false,
        error: "invalid_signature",
      });
    }

    try {
      console.log("Stripe event received:", event.type);

      const eventId = event.id;
      const data = event.data.object;

      /*
        Idempotency layer (recommended):
        Store eventId in DB and skip if already processed
      */

      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(data);
          break;

        case "invoice.paid":
          await handleInvoicePaid(data);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(data);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionUpdated(data);
          break;

        default:
          console.log("Unhandled Stripe event:", event.type);
      }

      return res.json({
        received: true,
        eventId,
      });
    } catch (err) {
      console.error("Webhook handler error:", err);

      return res.status(500).json({
        success: false,
        error: "webhook_processing_failed",
      });
    }
  }
);

module.exports = router;