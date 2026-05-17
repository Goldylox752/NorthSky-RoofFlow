const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   STRIPE WEBHOOK ROUTE
   - RAW BODY REQUIRED
   - SIGNATURE VERIFIED
   - IDEMPOTENT READY (hook this into DB later)
   - FORWARDS EVENTS TO CALL CENTER
=============================== */

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: "missing_signature",
      });
    }

    let event;

    /* ===============================
       VERIFY STRIPE SIGNATURE
    =============================== */
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("[stripe webhook] invalid signature:", err.message);

      return res.status(400).json({
        success: false,
        error: "invalid_signature",
      });
    }

    try {
      const data = event.data.object;

      /* ===============================
         EVENT ROUTING LAYER
         (send EVERYTHING to call center)
      =============================== */
      const { dispatchLead } = require("../../call-center/dispatch");

      switch (event.type) {
        case "checkout.session.completed":
          await dispatchLead({
            source: "stripe",
            type: "checkout.session.completed",
            data,
          });
          break;

        case "payment_intent.succeeded":
          await dispatchLead({
            source: "stripe",
            type: "payment_intent.succeeded",
            data,
          });
          break;

        case "customer.subscription.updated":
          await dispatchLead({
            source: "stripe",
            type: "customer.subscription.updated",
            data,
          });
          break;

        case "customer.subscription.deleted":
          await dispatchLead({
            source: "stripe",
            type: "customer.subscription.deleted",
            data,
          });
          break;

        case "invoice.paid":
          await dispatchLead({
            source: "stripe",
            type: "invoice.paid",
            data,
          });
          break;

        default:
          console.log("[stripe webhook] unhandled event:", event.type);
      }

      return res.json({
        success: true,
        received: true,
      });
    } catch (err) {
      console.error("[stripe webhook] processing error:", err);

      return res.status(500).json({
        success: false,
        error: "webhook_processing_failed",
      });
    }
  }
);

module.exports = router;