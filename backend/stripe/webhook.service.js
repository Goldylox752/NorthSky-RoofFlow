const { createClient } = require("@supabase/supabase-js");

/* ===============================
   SUPABASE (SERVICE ROLE REQUIRED)
=============================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ===============================
   STRIPE WEBHOOK HANDLER
   (MATCHES checkout.service.js)
=============================== */
async function handleStripeEvent(event) {
  const eventId = event.id;
  const type = event.type;

  /* ===============================
     IDEMPOTENCY CHECK (CRITICAL)
  =============================== */
  const { data: existing } = await supabase
    .from("billing_events")
    .select("id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  if (existing) {
    console.log("⚠️ Duplicate event ignored:", eventId);
    return;
  }

  /* ===============================
     ROUTER
  =============================== */
  switch (type) {

    /* ===============================
       CHECKOUT COMPLETED
    =============================== */
    case "checkout.session.completed": {
      const session = event.data.object;

      const authId = session.metadata?.auth_id;
      const plan = session.metadata?.plan || "starter";
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (!authId) {
        throw new Error("Missing auth_id in metadata");
      }

      await supabase.from("subscriptions").upsert(
        {
          auth_id: authId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: "active",
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "auth_id" }
      );

      break;
    }

    /* ===============================
       SUBSCRIPTION UPDATED
    =============================== */
    case "customer.subscription.updated": {
      const sub = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: sub.status,
          active: sub.status === "active",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", sub.customer);

      break;
    }

    /* ===============================
       SUBSCRIPTION CANCELED
    =============================== */
    case "customer.subscription.deleted": {
      const sub = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", sub.customer);

      break;
    }

    /* ===============================
       INVOICE PAID (OPTIONAL TRACKING)
    =============================== */
    case "invoice.paid": {
      const invoice = event.data.object;

      console.log("💰 Invoice paid:", invoice.id);
      break;
    }

    default:
      console.log("Unhandled Stripe event:", type);
  }

  /* ===============================
     LOG EVENT (FINAL STEP)
  =============================== */
  await supabase.from("billing_events").insert({
    stripe_event_id: eventId,
    type,
    payload: event.data.object,
    created_at: new Date().toISOString(),
  });
}

module.exports = {
  handleStripeEvent,
};