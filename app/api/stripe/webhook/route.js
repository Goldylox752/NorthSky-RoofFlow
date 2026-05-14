const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const https = require("https");
const logger = require("../lib/logger");

/* ===============================
   ENV SAFETY
=============================== */
const getEnv = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
};

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
  maxNetworkRetries: 3,
});

const supabase = createClient(
  getEnv("SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

/* ===============================
   TELEGRAM SENDER (SAFE + REUSABLE)
=============================== */
function sendTelegram(text) {
  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) return;

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
  });

  const req = https.request(
    {
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    () => {}
  );

  req.on("error", (err) => {
    logger.errorLog(err, { context: "telegram_send" });
  });

  req.write(payload);
  req.end();
}

/* ===============================
   IDEMPOTENCY (STRONG GUARANTEE)
=============================== */
async function isProcessed(eventId) {
  const { data, error } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    logger.errorLog(error, { eventId });
    return false;
  }

  return !!data;
}

async function markEvent(eventId, payload) {
  const { error } = await supabase.from("stripe_events").upsert({
    id: eventId,
    ...payload,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    logger.errorLog(error, { eventId });
  }
}

/* ===============================
   CORE: LEAD UNLOCK ENGINE
=============================== */
async function unlockLead(leadId, session) {
  const update = {
    paid: true,
    status: "sold",
    stripe_customer_id: session.customer || null,
    customer_email: session.customer_details?.email || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("leads")
    .update(update)
    .eq("id", leadId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ===============================
   ORDER CREATION (SOURCE OF TRUTH)
=============================== */
async function createPaymentRecord(session, leadId) {
  const { error } = await supabase.from("payments").upsert({
    id: session.id,
    lead_id: leadId,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "usd",
    status: "paid",
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

/* ===============================
   EVENT HANDLERS
=============================== */
async function handleCheckout(session) {
  const leadId = session.metadata?.leadId;
  const plan = session.metadata?.plan || "starter";

  if (!leadId) {
    throw new Error("Missing leadId in metadata");
  }

  logger.stripe("checkout.session.completed", { leadId, plan });

  const lead = await unlockLead(leadId, session);
  await createPaymentRecord(session, leadId);

  sendTelegram(
    `💰 PAYMENT SUCCESS\nLead: ${leadId}\nPlan: ${plan}\nCity: ${lead.city || "N/A"}`
  );
}

/* ===============================
   SUBSCRIPTION SYNC
=============================== */
async function syncSubscription(sub) {
  const customerId = sub.customer;

  const plan =
    sub.items?.data?.[0]?.price?.metadata?.plan ||
    sub.items?.data?.[0]?.price?.nickname ||
    "starter";

  const status = mapStatus(sub.status);

  const { error } = await supabase
    .from("users")
    .update({
      plan: plan.toLowerCase(),
      status,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    logger.errorLog(error, { customerId });
  }

  logger.stripe("subscription.updated", { customerId, plan, status });
}

/* ===============================
   PAYMENT FAILED
=============================== */
async function handlePaymentFailed(invoice) {
  const customer = invoice.customer;

  await supabase
    .from("users")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customer);

  sendTelegram(`⚠️ PAYMENT FAILED\nCustomer: ${customer}`);
}

/* ===============================
   SUBSCRIPTION CANCELLED
=============================== */
async function handleCancel(sub) {
  const customer = sub.customer;

  await supabase
    .from("users")
    .update({
      status: "canceled",
      plan: "starter",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customer);

  sendTelegram(`❌ SUBSCRIPTION CANCELED\nCustomer: ${customer}`);
}

/* ===============================
   EVENT ROUTER (CLEAN + SCALABLE)
=============================== */
async function processEvent(event) {
  logger.info({ type: event.type, id: event.id }, "stripe_event");

  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckout(event.data.object);

    case "customer.subscription.created":
    case "customer.subscription.updated":
      return syncSubscription(event.data.object);

    case "invoice.payment_failed":
      return handlePaymentFailed(event.data.object);

    case "customer.subscription.deleted":
      return handleCancel(event.data.object);

    default:
      logger.warn({ type: event.type }, "unhandled_event");
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

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        getEnv("STRIPE_WEBHOOK_SECRET")
      );

      // IDEMPOTENCY CHECK
      if (await isProcessed(event.id)) {
        return res.json({ received: true, duplicate: true });
      }

      await markEvent(event.id, {
        type: event.type,
        status: "processing",
      });

      await processEvent(event);

      await markEvent(event.id, {
        status: "completed",
        processed_at: new Date().toISOString(),
      });

      return res.json({ received: true });
    } catch (err) {
      logger.errorLog(err, {
        stage: "stripe_webhook",
        eventId: event?.id,
      });

      if (event?.id) {
        await markEvent(event.id, {
          status: "failed",
          error: err.message,
        });
      }

      sendTelegram(`🔥 WEBHOOK ERROR\n${err.message}`);

      return res.status(500).json({
        success: false,
        error: "webhook_failed",
      });
    }
  }
);

/* ===============================
   HELPERS
=============================== */
function mapStatus(status) {
  const map = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    unpaid: "suspended",
    canceled: "canceled",
  };

  return map[status] || "unknown";
}

module.exports = router;