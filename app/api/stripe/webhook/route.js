const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handleEvent(event) {
  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object;

  const leadId = session.metadata?.leadId;
  const plan = session.metadata?.plan;

  if (!leadId || !plan) {
    throw new Error("Missing leadId or plan in metadata");
  }

  const stripeCustomerId = session.customer || null;
  const email = session.customer_details?.email || null;

  if (!session.amount_total) {
    throw new Error("Missing amount_total");
  }

  const amount = session.amount_total / 100;

  // =========================
  // UPDATE LEAD
  // =========================
  const { error: leadError } = await supabase
    .from("leads")
    .update({
      paid: true,
      plan,
      status: "paid",
      stripe_customer_id: stripeCustomerId,
    })
    .eq("id", leadId.trim());

  if (leadError) throw leadError;

  // =========================
  // PAYMENT RECORD
  // =========================
  const { error: paymentError } = await supabase
    .from("payments")
    .upsert(
      {
        id: session.id,
        lead_id: leadId,
        stripe_customer_id: stripeCustomerId,
        amount,
        currency: session.currency || "usd",
        status: "paid",
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (paymentError) throw paymentError;
}

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        return res.status(400).json({
          error: "Missing Stripe signature",
        });
      }

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // =========================
      // IDEMPOTENCY CHECK
      // =========================
      const { data: existing } = await supabase
        .from("stripe_events")
        .select("status")
        .eq("id", event.id)
        .single();

      if (existing?.status === "completed") {
        return res.json({
          received: true,
          skipped: true,
        });
      }

      await supabase.from("stripe_events").upsert({
        id: event.id,
        type: event.type,
        status: "processing",
        created_at: new Date().toISOString(),
      });

      await handleEvent(event);

      await supabase
        .from("stripe_events")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      return res.json({ received: true });

    } catch (err) {
      console.error("Webhook error:", err);

      if (event?.id) {
        await supabase
          .from("stripe_events")
          .update({
            status: "failed",
            error: err.message,
          })
          .eq("id", event.id);
      }

      return res.status(500).json({
        error: "Webhook failed",
      });
    }
  }
);

module.exports = router;