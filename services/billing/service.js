const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");
const normalizeEmail = require("../utils/normalizeEmail");

/* ===============================
   GET STRIPE CUSTOMER ID
=============================== */
async function getCustomerId(email) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Missing email");

  const { data, error } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (error || !data?.stripe_customer_id) {
    throw new Error("Customer not found");
  }

  return data.stripe_customer_id;
}

/* ===============================
   GET ACTIVE SUBSCRIPTION
=============================== */
async function getActiveSubscription(customerId) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });

  return subs.data[0] || null;
}

/* ===============================
   PORTAL SESSION
=============================== */
exports.createPortalSession = async (email) => {
  const customerId = await getCustomerId(email);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  return {
    success: true,
    url: session.url,
  };
};

/* ===============================
   CANCEL SUBSCRIPTION
=============================== */
exports.cancelSubscription = async (email) => {
  const customerId = await getCustomerId(email);

  const subscription = await getActiveSubscription(customerId);

  if (!subscription) {
    return {
      success: true,
      message: "No active subscription",
    };
  }

  await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });

  await supabase
    .from("users")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  return {
    success: true,
    message: "Subscription will cancel at period end",
  };
};