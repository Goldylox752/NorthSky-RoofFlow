const stripe = require("../lib/stripe");
const supabase = require("../lib/supabase");

/* ===============================
   CREATE PORTAL SESSION
=============================== */
exports.createPortalSession = async (email) => {
  if (!email) throw new Error("Missing email");

  const cleanEmail = email.toLowerCase().trim();

  const { data, error } = await supabase
    .from("leads")
    .select("stripe_customer_id")
    .eq("email", cleanEmail)
    .single();

  if (error || !data?.stripe_customer_id) {
    throw new Error("Customer not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  return {
    success: true,
    url: session.url,
  };
};

/* ===============================
   GET CUSTOMER
=============================== */
exports.getCustomer = async (email) => {
  if (!email) throw new Error("Missing email");

  const cleanEmail = email.toLowerCase().trim();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("email", cleanEmail)
    .single();

  if (error) throw error;

  return {
    success: true,
    customer: data,
  };
};

/* ===============================
   CANCEL SUBSCRIPTION
=============================== */
exports.cancelSubscription = async (email) => {
  if (!email) throw new Error("Missing email");

  const cleanEmail = email.toLowerCase().trim();

  const { data } = await supabase
    .from("leads")
    .select("stripe_customer_id")
    .eq("email", cleanEmail)
    .single();

  if (!data?.stripe_customer_id) {
    throw new Error("Customer not found");
  }

  const subs = await stripe.subscriptions.list({
    customer: data.stripe_customer_id,
    limit: 1,
  });

  if (!subs.data.length) {
    throw new Error("No active subscription");
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