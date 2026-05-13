async function handleStripeEvent(event) {
  const eventId = event.id;
  const type = event.type;
  const payload = event.data?.object;

  try {
    /* ===============================
       IDEMPOTENCY CHECK (CRITICAL FIX)
    =============================== */

    const { data: existing } = await supabase
      .from("billing_events")
      .select("stripe_event_id")
      .eq("stripe_event_id", eventId)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate event ignored:", eventId);
      return;
    }

    /* ===============================
       PROCESS EVENT
    =============================== */

    switch (type) {

      /* ===============================
         CHECKOUT COMPLETED
      =============================== */

      case "checkout.session.completed": {
        const session = payload;

        const authId = session.metadata?.auth_id;
        const plan = session.metadata?.plan || "starter";

        if (!authId) {
          await logBillingEvent(eventId, type, payload, "failed_auth_missing");

          console.error("Missing auth_id:", session.id);
          return;
        }

        const customerId = session.customer;
        const subscriptionId = session.subscription || null;

        /* ===============================
           UPSERT SUBSCRIPTION (SOURCE OF TRUTH)
        =============================== */

        const { error } = await supabase
          .from("subscriptions")
          .upsert(
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

        if (error) throw error;

        break;
      }

      /* ===============================
         SUBSCRIPTION UPDATED
      =============================== */

      case "customer.subscription.updated": {
        const sub = payload;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            active: sub.status === "active",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", sub.customer);

        if (error) throw error;

        break;
      }

      /* ===============================
         SUBSCRIPTION CANCELED
      =============================== */

      case "customer.subscription.deleted": {
        const sub = payload;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", sub.customer);

        if (error) throw error;

        break;
      }

      /* ===============================
         INVOICE PAID (IMPORTANT ADDITION)
      =============================== */

      case "invoice.paid": {
        const invoice = payload;

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", invoice.customer);

        break;
      }

      /* ===============================
         DEFAULT
      =============================== */

      default:
        console.log("Unhandled event:", type);
    }

    /* ===============================
       EVENT LOG (SUCCESS)
    =============================== */

    await logBillingEvent(eventId, type, payload, "processed");

  } catch (err) {
    console.error("Webhook handler error:", err);

    await logBillingEvent(
      eventId,
      type,
      payload,
      "failed",
      err.message
    );

    throw err;
  }
}

/* ===============================
   SAFE EVENT LOGGER (REUSABLE)
=============================== */

async function logBillingEvent(eventId, type, payload, status, error = null) {
  return supabase.from("billing_events").insert({
    stripe_event_id: eventId,
    type,
    payload,
    status,
    error,
    created_at: new Date().toISOString(),
  });
}