const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

/* =========================
   ENV VALIDATION
========================= */

const requiredEnv = (key) => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

const stripe = new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
);

/* =========================
   HELPERS
========================= */

async function markEvent(event, status, extra = {}) {
  await supabase.from("stripe_events").upsert({
    id: event.id,
    type: event.type,
    status,
    updated_at: new Date().toISOString(),
    ...extra,
  });
}

/* =========================
   BUSINESS LOGIC
========================= */

async function handleCheckoutCompleted(session) {
  const leadId = session.metadata?.leadId;
  const plan = session.metadata?.plan;

  if (!leadId || !plan) {
    throw new Error("Missing metadata (leadId or plan)");
  }

  const payload = {
    paid: true,
    status: "paid",
    plan,
    customer_email: session.customer_details?.email || null,
    stripe_customer_id: session.customer || null,
    updated_at: new Date().toISOString(),
  };

  /* =========================
     UPDATE LEAD (SAFE UPDATE)
  ========================= */

  const { error: leadError } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId.trim());

  if (leadError) throw leadError;

  /* =========================
     UPSERT PAYMENT
  ========================= */

  const { error: paymentError } = await supabase
    .from("payments")
    .upsert(
      {
        id: session.id,
        lead_id: leadId,
        stripe_customer_id: session.customer || null,
        customer_email: session.customer_details?.email || null,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || "usd",
        status: "paid",
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (paymentError) throw paymentError;
}

/* =========================
   EVENT ROUTER
========================= */

async function processEvent(event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    default:
      console.log(`Unhandled event: ${event.type}`);
  }
}

/* =========================
   WEBHOOK ROUTE
========================= */

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const sig = req.headers["stripe-signature"];
      if (!sig) return res.status(400).send("Missing signature");

      /* =========================
         VERIFY STRIPE SIGNATURE
      ========================= */

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        requiredEnv("STRIPE_WEBHOOK_SECRET")
      );

      console.log("Stripe event:", event.type);

      /* =========================
         IDEMPOTENCY CHECK (IMPORTANT FIX)
      ========================= */

      const { data: existing } = await supabase
        .from("stripe_events")
        .select("status")
        .eq("id", event.id)
        .maybeSingle();

      if (existing?.status === "completed") {
        return res.json({ received: true, duplicate: true });
      }

      /* =========================
         MARK PROCESSING
      ========================= */

      await markEvent(event, "processing");

      /* =========================
         PROCESS EVENT
      ========================= */

      await processEvent(event);

      /* =========================
         MARK COMPLETED
      ========================= */

      await markEvent(event, "completed", {
        processed_at: new Date().toISOString(),
      });

      return res.json({ received: true });

    } catch (err) {
      console.error("Webhook Error:", err.message);

      if (event?.id) {
        await markEvent(event, "failed", {
          error: err.message,
          failed_at: new Date().toISOString(),
        });
      }

      return res.status(500).json({
        success: false,
        error: "Webhook failed",
      });
    }
  }
);

module.exports = router;