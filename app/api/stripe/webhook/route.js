import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function env(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

export async function POST(req) {
  let event;

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env("STRIPE_WEBHOOK_SECRET")
    );

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const leadId = session.metadata?.leadId;

        if (!leadId) throw new Error("Missing leadId");

        await supabase
          .from("leads")
          .update({
            paid: true,
            status: "sold",
            stripe_customer_id: session.customer || null,
            customer_email: session.customer_details?.email || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", leadId);

        await supabase.from("payments").upsert({
          id: session.id,
          lead_id: leadId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          status: "paid",
          created_at: new Date().toISOString(),
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        await supabase
          .from("users")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", invoice.customer);

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;

        await supabase
          .from("users")
          .update({
            status: "canceled",
            plan: "starter",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", sub.customer);

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;

        const plan =
          sub.items?.data?.[0]?.price?.metadata?.plan ||
          sub.items?.data?.[0]?.price?.nickname ||
          "starter";

        const statusMap = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          unpaid: "suspended",
          canceled: "canceled",
        };

        await supabase
          .from("users")
          .update({
            plan: plan.toLowerCase(),
            status: statusMap[sub.status] || "unknown",
            stripe_customer_id: sub.customer,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", sub.customer);

        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: "webhook_failed",
      }),
      { status: 500 }
    );
  }
}