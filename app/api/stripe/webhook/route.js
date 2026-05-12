const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

/* ===============================
   ENV SAFETY
=============================== */

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

/* ===============================
   OPTIONAL TELEGRAM MODE HOOK
=============================== */

const sendTelegram = async (text) => {
  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Telegram error:", err);
  }
};

/* ===============================
   EVENT LOGGER (SAFE UPSERT)
=============================== */

async function markEvent(eventId, data) {
  await supabase.from("stripe_events").upsert({
    id: eventId,
    ...data,
    updated_at: new Date().toISOString(),
  });
}

/* ===============================
   CORE BUSINESS LOGIC
=============================== */

async function handleCheckoutCompleted(session) {
  const leadId = session.metadata?.leadId;
  const plan = session.metadata?.plan;

  if (!leadId || !plan) {
    throw new Error("Missing metadata: leadId or plan");
  }

  const updatePayload = {
    paid: true,
    status: "paid",
    plan,

    customer_email: session.customer_details?.email || null,
    stripe_customer_id: session.customer || null,

    updated_at: new Date().toISOString(),
  };

  /* ===============================
     UPDATE LEAD (SAFE)
  =============================== */

  const { error: leadError } = await supabase
    .from("leads")
    .update(updatePayload)
    .eq("id", leadId);

  if (leadError) throw leadError;

  /* ===============================
     PAYMENT RECORD
  =============================== */

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

  /* ===============================
     TELEGRAM MODE EVENT
  =============================== */

  await sendTelegram(
    `💰 *PAYMENT SUCCESS*\n\n` +
    `Lead: ${leadId}\n` +
    `Plan: ${plan}\n` +
    `Amount: $${(session.amount_total || 0) / 100}`
  );
}

/* ===============================
   EVENT ROUTER
=============================== */

async function processEvent(event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    default:
      console.log("Unhandled event:", event.type);
  }
}

/* ===============================
   WEBHOOK ROUTE
=============================== */

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const signature = req.headers["stripe-signature"];

      if (!signature) {
        return res.status(400).send("Missing signature");
      }

      /* ===============================
         VERIFY STRIPE SIGNATURE
      =============================== */

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        requiredEnv("STRIPE_WEBHOOK_SECRET")
      );

      console.log("Stripe event:", event.type);

      /* ===============================
         IDEMPOTENCY CHECK (FIXED)
      =============================== */

      const { data: existing } = await supabase
        .from("stripe_events")
        .select("id, status")
        .eq("id", event.id)
        .maybeSingle();

      if (existing?.status === "completed") {
        return res.json({
          received: true,
          duplicate: true,
        });
      }

      /* ===============================
         MARK PROCESSING
      =============================== */

      await markEvent(event.id, {
        type: event.type,
        status: "processing",
      });

      /* ===============================
         PROCESS EVENT
      =============================== */

      await processEvent(event);

      /* ===============================
         MARK COMPLETED
      =============================== */

      await markEvent(event.id, {
        type: event.type,
        status: "completed",
        processed_at: new Date().toISOString(),
      });

      return res.json({ received: true });

    } catch (err) {
      console.error("Webhook error:", err);

      if (event?.id) {
        await markEvent(event.id, {
          status: "failed",
          error: err.message,
          failed_at: new Date().toISOString(),
        });
      }

      await sendTelegram(
        `❌ *STRIPE WEBHOOK ERROR*\n\n${err.message}`
      );

      return res.status(500).json({
        success: false,
        error: "Webhook failed",
      });
    }
  }
);

module.exports = router;