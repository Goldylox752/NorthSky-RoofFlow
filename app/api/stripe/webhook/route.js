import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return Response.json({ error: "Invalid webhook" }, { status: 400 });
  }

  // =========================
  // 💰 PAYMENT SUCCESS
  // =========================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;

    const amount = session.amount_total;

    let role = "contractor_basic";

    if (amount >= 9900) role = "contractor_pro";
    if (amount >= 24900) role = "contractor_premium";

    // 🔐 UPDATE USER ACCESS
    await supabase
      .from("profiles")
      .update({
        role,
        subscription_status: "active",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      })
      .eq("id", userId);
  }

  // =========================
  // ❌ PAYMENT FAILED / CANCELED
  // =========================
  if (
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;

    await supabase
      .from("profiles")
      .update({
        subscription_status: "inactive",
        role: "buyer",
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return Response.json({ received: true });
}