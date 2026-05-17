const { createClient } = require("@supabase/supabase-js");

/* =========================================
   SINGLETON SUPABASE ADMIN CLIENT
========================================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================================
   BILLING EVENT HANDLER
========================================= */
async function handleEvent(event) {
  try {
    console.log(`⚡ Stripe Event: ${event.type}`);

    switch (event.type) {
      /* =========================================
         CHECKOUT COMPLETED
      ========================================= */
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object);
        break;
      }

      /* =========================================
         SUBSCRIPTION UPDATED
      ========================================= */
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object);
        break;
      }

      /* =========================================
         SUBSCRIPTION CANCELLED
      ========================================= */
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }

      /* =========================================
         PAYMENT FAILED
      ========================================= */
      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object);
        break;
      }

      default:
        console.log(`Unhandled Stripe Event: ${event.type}`);
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("❌ Stripe Webhook Failure:", err);

    await logBillingError(event, err);

    throw err;
  }
}

/* =========================================
   CHECKOUT SUCCESS
========================================= */
async function handleCheckoutCompleted(session) {
  const email = session.customer_details?.email;
  const customerId = session.customer;
  const subscriptionId = session.subscription || null;

  const plan =
    session.metadata?.plan ||
    session.metadata?.tier ||
    "starter";

  if (!email) {
    throw new Error("Missing customer email");
  }

  /* UPSERT CUSTOMER SUB */
  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        email,
        plan,

        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,

        status: "active",
        active: true,

        activated_at: new Date(),
        updated_at: new Date(),
      },
      {
        onConflict: "email",
      }
    );

  if (error) throw error;

  /* BILLING AUDIT */
  await insertBillingEvent({
    type: "checkout.completed",
    email,
    customerId,
    payload: session,
  });

  console.log(`✅ Subscription Activated: ${email}`);
}

/* =========================================
   SUB UPDATED
========================================= */
async function handleSubscriptionUpdated(subscription) {
  const status = subscription.status;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      active: status === "active",

      current_period_start: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null,

      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,

      updated_at: new Date(),
    })
    .eq("stripe_customer_id", subscription.customer);

  if (error) throw error;

  await insertBillingEvent({
    type: "subscription.updated",
    customerId: subscription.customer,
    payload: subscription,
  });

  console.log(`🔄 Subscription Updated: ${subscription.customer}`);
}

/* =========================================
   SUB CANCELLED
========================================= */
async function handleSubscriptionDeleted(subscription) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      active: false,
      status: "canceled",

      canceled_at: new Date(),
      updated_at: new Date(),
    })
    .eq("stripe_customer_id", subscription.customer);

  if (error) throw error;

  await insertBillingEvent({
    type: "subscription.deleted",
    customerId: subscription.customer,
    payload: subscription,
  });

  console.log(`❌ Subscription Cancelled: ${subscription.customer}`);
}

/* =========================================
   PAYMENT FAILED
========================================= */
async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date(),
    })
    .eq("stripe_customer_id", customerId);

  await insertBillingEvent({
    type: "invoice.payment_failed",
    customerId,
    payload: invoice,
  });

  console.log(`⚠️ Payment Failed: ${customerId}`);
}

/* =========================================
   BILLING EVENT LOGGER
========================================= */
async function insertBillingEvent({
  type,
  email = null,
  customerId = null,
  payload,
}) {
  const { error } = await supabase
    .from("billing_events")
    .insert({
      type,
      email,
      stripe_customer_id: customerId,
      payload,
      created_at: new Date(),
    });

  if (error) {
    console.error("Failed billing event insert:", error);
  }
}

/* =========================================
   GLOBAL ERROR LOGGER
========================================= */
async function logBillingError(event, err) {
  try {
    await supabase
      .from("billing_errors")
      .insert({
        event_type: event?.type,
        error_message: err.message,
        payload: event,
        created_at: new Date(),
      });
  } catch (logErr) {
    console.error("Failed billing error log:", logErr);
  }
}

module.exports = {
  handleEvent,
};