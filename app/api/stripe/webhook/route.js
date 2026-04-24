import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const signature = headers().get("stripe-signature");
    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // =========================
    // PAYMENT SUCCESS
    // =========================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await supabase.from("subscriptions").upsert({
        user_id: session.metadata?.user_id || null,
        stripe_customer_id: session.customer,
        plan: session.metadata?.plan || "starter",
        status: "active",
        updated_at: new Date().toISOString()
      });
    }

    // =========================
    // RENEWALS
    // =========================
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_customer_id", invoice.customer);
    }

    // =========================
    // CANCEL
    // =========================
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_customer_id", sub.customer);
    }

    return Response.json({ received: true });

  } catch (err) {
    console.error("Webhook Error:", err);

    return new Response(
      "Webhook Error",
      { status: 400 }
    );
  }
}