const stripe = require("../../lib/stripe");
const supabase = require("../../lib/supabase");

/* ===============================
   GET USER BY AUTH ID
=============================== */
async function getUser(authId) {
  if (!authId) throw new Error("Missing auth_id");

  const { data, error } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error || !data?.stripe_customer_id) {
    throw new Error("Stripe customer not found");
  }

  return data.stripe_customer_id;
}

/* ===============================
   PORTAL SESSION
=============================== */
exports.createPortalSession = async (authId) => {
  const customerId = await getUser(authId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  return {
    success: true,
    url: session.url,
  };
};