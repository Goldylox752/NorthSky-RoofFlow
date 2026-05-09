const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");

/* ===============================
   CANCEL SUBSCRIPTION (AUTH BASED)
=============================== */
exports.cancelSubscription = async (authId) => {
  if (!authId) throw new Error("Missing auth_id");

  const { data } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("auth_id", authId)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    throw new Error("Customer not found");
  }

  const subs = await stripe.subscriptions.list({
    customer: data.stripe_customer_id,
    status: "active",
    limit: 1,
  });

  if (!subs.data.length) {
    return {
      success: true,
      message: "No active subscription",
    };
  }

  await stripe.subscriptions.update(subs.data[0].id, {
    cancel_at_period_end: true,
  });

  await supabase
    .from("users")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("auth_id", authId);

  return {
    success: true,
    message: "Subscription will cancel at period end",
  };
};