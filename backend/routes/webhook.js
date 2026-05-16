const express = require("express");
const router = express.Router();

const stripe = require("../lib/stripe");
const supabase = require("../lib/supabase");

/* ===============================
   SAFE SUPABASE WRAPPER
=============================== */
const db = {
  upsertUser: async (payload) => {
    const { error } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "email" });

    if (error) throw error;
  },

  updateUserByCustomer: async (customerId, data) => {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("stripe_customer_id", customerId);

    if (error) throw error;
  },
};

/* ===============================
   EMAIL EXTRACTOR
=============================== */
const getEmail = (session) =>
  session?.customer_details?.email ||
  session?.customer_email ||
  session?.metadata?.email ||
  null;

/* ===============================
   WEBHOOK ROUTE
=============================== */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: "Missing Stripe signature",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Invalid Stripe signature:", err.message);

      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }

    try {
      const type = event.type;
      const data = event.data.object;

      /* ===============================
         CHECKOUT COMPLETED
      =============================== */
      if (type === "checkout.session.completed") {
        const email = getEmail(data);

        if (!email) return res.json({ received: true });

        const payload = {
          email: email.toLowerCase().trim(),
          name: data.metadata?.name || "Unknown",
          plan: data.metadata?.plan || "starter",
          status: "active",

          stripe_customer_id: data.customer,
          stripe_session_id: data.id,

          activated_at: new Date().toISOString(),
        };

        // ✅ FIXED (NO ARRAY)
        await db.upsertUser(payload);

        console.log("User activated:", email);
      }

      /* ===============================
         SUBSCRIPTION UPDATED
      =============================== */
      if (
        type === "customer.subscription.created" ||
        type === "customer.subscription.updated"
      ) {
        const plan =
          data?.items?.data?.[0]?.price?.nickname ||
          data?.items?.data?.[0]?.price?.id ||
          "starter";

        await db.updateUserByCustomer(data.customer, {
          plan,
          status: data.status === "active" ? "active" : "inactive",
          stripe_subscription_id: data.id,
        });
      }

      /* ===============================
         SUBSCRIPTION CANCELED
      =============================== */
      if (type === "customer.subscription.deleted") {
        await db.updateUserByCustomer(data.customer, {
          status: "canceled",
          plan: "starter",
        });
      }

      /* ===============================
         PAYMENT FAILED
      =============================== */
      if (type === "invoice.payment_failed") {
        await db.updateUserByCustomer(data.customer, {
          status: "past_due",
        });
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("Webhook processing error:", err);

      return res.status(500).json({
        success: false,
        error: "Webhook processing failed",
      });
    }
  }
);

module.exports = router;