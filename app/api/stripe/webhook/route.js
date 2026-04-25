import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.metadata?.email;
    const plan = session.metadata?.plan;
    const phone = session.metadata?.phone;

    // 🔥 SAVE REAL SAAS DATA
    if (email) {
      await supabase.from("leads").upsert({
        email,
        phone,
        plan,
        status: "active",
      });
    }
  }

  return new Response("OK");
}
