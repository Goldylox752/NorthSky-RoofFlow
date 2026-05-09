const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");

exports.createStripeCustomer = async (user) => {
  const { id, email } = user;

  if (!id || !email) return;

  // check if already exists
  const { data: existing } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("auth_id", id)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // create Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      auth_id: id,
    },
  });

  // store in DB
  await supabase.from("users").upsert({
    auth_id: id,
    email,
    stripe_customer_id: customer.id,
    status: "active",
  });

  return customer.id;
};