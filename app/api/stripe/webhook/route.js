import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/sendSMS";
import { scoreLeadAsync } from "@/lib/scoreLeadAsync";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// safe Supabase (server only)
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event;

  // ✅ verify webhook
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response("Webhook Error", { status: 400 });
  }

  // 🎯 ONLY handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_details?.email;
    const phone = session.metadata?.phone;

    const supabase = getSupabase();

    // ✅ update DB (non-blocking safe)
    if (supabase && email) {
      const { error } = await supabase
        .from("leads")
        .update({ status: "active" })
        .eq("email", email);

      if (error) {
        console.error("Supabase update error:", error.message);
      }
    }

    // 📲 SMS (isolated failure-safe)
    if (phone) {
      try {
        await sendSMS(
          phone,
          "RoofFlow Approved 🎉 Book onboarding: https://calendly.com/your-link"
        );
      } catch (smsError) {
        console.error("SMS failed:", smsError.message);
      }
    }

    // 🤖 AI (NEVER blocks Stripe)
    scoreLeadAsync(session.metadata);
  }

  return new Response("OK", { status: 200 });
}
