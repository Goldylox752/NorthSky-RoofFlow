const express = require("express");
const router = express.Router();

const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");

/* ===============================
   STRIPE WEBHOOK
=============================== */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      /* ===============================
         CHECKOUT PAID
      =============================== */
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const email = session.customer_email;

        if (email) {
          await supabase
            .from("leads")
            .update({
              paid: true,
              status: "paid",
              stripe_session_id: session.id,
            })
            .eq("email", email.toLowerCase().trim());
        }
      }

      /* ===============================
         SUBSCRIPTION RENEWED
      =============================== */
      if (event.type === "invoice.paid") {
        const invoice = event.data.object;

        const email = invoice.customer_email;

        if (email) {
          await supabase
            .from("leads")
            .update({
              paid: true,
              status: "active",
              stripe_customer_id: invoice.customer,
            })
            .eq("email", email.toLowerCase().trim());
        }
      }

      return res.json({ received: true });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
);

module.exports = router;