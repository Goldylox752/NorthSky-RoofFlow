const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const https = require("https");
const logger = require("../lib/logger"); // IMPORTANT ADD

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
});

const supabase = createClient(
  getEnv("SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

/* ===============================
   TELEGRAM (SAFE FALLBACK)
=============================== */
const sendTelegram = (text) => {
  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) return;

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  });

  const req = https.request(
    {
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    () => {}
  );

  req.on("error", () => {});
  req.write(payload);
  req.end();
};

/* ===============================
   IDEMPOTENCY CHECK
=============================== */
async function isProcessed(eventId) {
  try {
    const { data } = await supabase
      .from("stripe_events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    return !!data;
  } catch (err) {
    logger.errorLog(err, { eventId });
    return false; // fail open for Stripe retries
  }
}

async function markEvent(eventId, payload) {
  try {
    await supabase.from("stripe_events").upsert({
      id: eventId,
      ...payload,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    logger.errorLog(err, { eventId });
  }
}

/* ===============================
   CHECKOUT HANDLER
=============================== */
async function handleCheckout(session) {
  const leadId = session.metadata?.leadId;
  const plan = session.metadata?.plan;

  if (!leadId || !plan) {
    throw new Error("Missing Stripe metadata (leadId, plan)");
  }

  logger.stripe("checkout.session.completed", {
    leadId,
    plan,
  });

  const update = {
    paid: true,
    status: "active",
    plan: (plan || "starter").toLowerCase(),
    stripe_customer_id: session.customer || null,
    customer_email: session.customer_details?.email || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("leads")
    .update(update)
    .eq("id", leadId);

  if (error) throw error;

  await supabase.from("payments").upsert({
    id: session.id,
    lead_id: leadId,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "usd",
    status: "paid",
    created_at: new Date().toISOString(),
  });

  sendTelegram(`Payment success\nLead: ${leadId}\nPlan: ${plan}`);
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

  logger.stripe("subscription.updated", {
    customerId,
    plan,
    status,
  });

  await supabase
    .from("users")
    .update({
      plan: (plan || "starter").toLowerCase(),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/* ===============================
   PAYMENT FAILED
=============================== */
async function handlePaymentFailed(invoice) {
  logger.stripe("payment.failed", {
    customer: invoice.customer,
  });

  await supabase
    .from("users")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", invoice.customer);

  sendTelegram(`Payment failed\nCustomer: ${invoice.customer}`);
}

/* ===============================
   CANCEL
=============================== */
async function handleCancel(sub) {
  logger.stripe("subscription.canceled", {
    customer: sub.customer,
  });

  await supabase
    .from("users")
    .update({
      status: "canceled",
      plan: "starter",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", sub.customer);

  sendTelegram(`Subscription canceled\nCustomer: ${sub.customer}`);
}

/* ===============================
   PROCESSOR (SAFE WRAPPER)
=============================== */
async function processEvent(event) {
  try {
    logger.info(
      { type: event.type, id: event.id },
      "processing_stripe_event"
    );

    switch (event.type) {
      case "checkout.session.completed":
        return await handleCheckout(event.data.object);

      case "customer.subscription.created":
      case "customer.subscription.updated":
        return await syncSubscription(event.data.object);

      case "invoice.payment_failed":
        return await handlePaymentFailed(event.data.object);

      case "customer.subscription.deleted":
        return await handleCancel(event.data.object);

      default:
        logger.warn({ type: event.type }, "unhandled_event");
    }
  } catch (err) {
    logger.errorLog(err, {
      eventType: event.type,
      eventId: event.id,
    });

    throw err;
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

      sendTelegram(`Webhook error\n${err.message}`);

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