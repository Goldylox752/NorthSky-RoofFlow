require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");

// =========================
// INIT
// =========================
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("RoofFlow AI API is running 🚀");
});

// =========================
// STRIPE CHECKOUT
// =========================
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoofFlow AI - Roofing Pipeline System",
            },
            unit_amount: 49700,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// STRIPE WEBHOOK
// =========================
app.post(
  "/api/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(err.message);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_details?.email;

      console.log("💰 Payment success:", email);

      if (email) {
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (existing) {
          await supabase
            .from("users")
            .update({
              status: "active",
              plan: "growth",
              updated_at: new Date().toISOString(),
            })
            .eq("email", email);
        } else {
          await supabase.from("users").insert([
            {
              email,
              stripe_session_id: session.id,
              status: "active",
              plan: "growth",
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    }

    res.json({ received: true });
  }
);

// =========================
// TWILIO LEAD SENDER
// =========================
async function sendLeadSMS(lead) {
  try {
    await client.messages.create({
      body: `🔥 New Roofing Lead:\n${lead.name}\n${lead.phone}\n${lead.address}`,
      from: process.env.TWILIO_NUMBER,
      to: process.env.RECEIVER_NUMBER,
    });

    console.log("📲 SMS sent:", lead.name);
  } catch (err) {
    console.error("SMS error:", err.message);
  }
}

// =========================
// HOT LEAD LOGGER (FIXED)
// =========================
function logHotLead(lead) {
  console.log(`🔥 HOT LEAD | ${lead.name} | SCORE: ${lead.score}`);
}

// =========================
// SAVE LEAD (CENTRAL FUNCTION)
// =========================
async function saveLead(lead) {
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", lead.phone)
    .single();

  if (existing) return;

  await supabase.from("leads").insert([lead]);

  logHotLead(lead);

  if (lead.score >= 80) {
    await sendLeadSMS(lead);
  }
}

// =========================
// CRON: GOOGLE LEAD ENGINE
// =========================
const { runGoogleLeadEngine } = require("./googleLeads");

cron.schedule("0 */6 * * *", async () => {
  console.log("🧠 Running Google Maps Lead Engine...");
  await runGoogleLeadEngine(saveLead);
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
