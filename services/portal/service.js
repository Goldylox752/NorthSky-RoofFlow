const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");
const normalizeEmail = require("../utils/normalizeEmail");

exports.createPortalSession = async (email) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Missing email");

  const { data, error } = await supabase
    .from("leads")
    .select("stripe_customer_id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (error || !data?.stripe_customer_id) {
    throw new Error("Customer not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  return { success: true, url: session.url };
};

exports.cancelSubscription = async (email) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Missing email");

  const { data } = await supabase
    .from("leads")
    .select("stripe_customer_id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    throw new Error("Customer not found");
  }

  const subs = await stripe.subscriptions.list({
    customer: data.stripe_customer_id,
    limit: 1,
  });

  if (!subs.data.length) {
    return { success: true, message: "No active subscription" };
  }

  await stripe.subscriptions.update(subs.data[0].id, {
    cancel_at_period_end: true,
  });

  await supabase
    .from("leads")
    .update({ status: "canceled" })
    .eq("email", cleanEmail);

  return {
    success: true,
    message: "Subscription will cancel at period end",
  };
};