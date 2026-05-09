const router = require("express").Router();
const stripe = require("../lib/stripe");
const {
  handleCheckoutCompleted,
  handleInvoicePaid,
} = require("../services/billing.service");

router.post(
  "/",
  require("express").raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(event.data.object);
          break;

        case "invoice.paid":
          await handleInvoicePaid(event.data.object);
          break;

        default:
          break;
      }

      return res.json({ received: true });

    } catch (err) {
      console.error("Webhook error:", err);

      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
);

module.exports = router;