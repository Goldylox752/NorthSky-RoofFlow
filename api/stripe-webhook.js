import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";
import { assignTerritory } from "../services/assignmentEngine.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    const rawBody = await buffer(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("📩 Stripe event received:", event.type);

  try {
    /* =========================
       CHECKOUT COMPLETE
    ========================= */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email = session.customer_details?.email;
      const plan = session.metadata?.plan || "unknown";

      if (!email) {
        console.error("❌ No email found in session");
        return res.status(400).send("Missing email");
      }

      console.log("💰 Payment confirmed:", { email, plan });

      /* =========================
         1. CREATE / UPDATE USER
      ========================= */
      const { error: userError } = await supabase
        .from("users")
        .upsert({
          email,
          plan,
          paid: true,
          stripe_session: session.id,
          stripe_customer: session.customer,
          updated_at: new Date().toISOString(),
        });

      if (userError) {
        console.error("❌ Supabase user upsert failed:", userError);
        return res.status(500).json({ error: "User insert failed" });
      }

      /* =========================
         2. ASSIGNMENT ENGINE (FIXED MISSING PIECE)
      ========================= */
      const assignmentResult = await assignTerritory(email, plan);

      if (!assignmentResult) {
        console.warn("⚠️ Assignment returned empty result");
      }

      console.log("✅ User + assignment complete:", email);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}