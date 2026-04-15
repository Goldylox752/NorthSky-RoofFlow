require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// =========================
// INIT
// =========================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());

// =========================
// HEALTH
// =========================
app.get("/", (_, res) => {
  res.send("🚀 RoofFlow Backend Running");
});

// =========================
// STRIPE CHECKOUT
// =========================
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { email, name, phone, city } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoofFlow Lead System",
            },
            unit_amount: 49700,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { email, name, phone, city },
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =========================
// STRIPE WEBHOOK (SAFE)
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
      console.error("Stripe signature error:", err.message);
      return res.status(400).send("Invalid webhook");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { email } = session.metadata || {};
      const customerId = session.customer;

      if (email) {
        await supabase
          .from("contractors")
          .update({
            active: true,
            stripe_customer_id: customerId,
          })
          .eq("email", email);

        console.log("✅ Contractor activated:", email);
      }
    }

    res.json({ received: true });
  }
);

// =========================
// LEAD SCORING (SERVER SIDE)
// =========================
function scoreLead(issue = "") {
  const text = issue.toLowerCase();

  if (text.includes("leak")) return 95;
  if (text.includes("storm")) return 90;
  if (text.includes("replacement")) return 85;

  return 75;
}

// =========================
// NEW LEAD (SCALED ROUTER)
// =========================
app.post("/api/new-lead", async (req, res) => {
  try {
    const { name, phone, city, issue } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const score = scoreLead(issue);

    // 1. Save lead
    const { data: lead } = await supabase
      .from("homeowner_leads")
      .insert([{ name, phone, city, issue, score }])
      .select()
      .single();

    // 2. Get active contractors
    const { data: contractors } = await supabase
      .from("contractors")
      .select("*")
      .eq("city", city)
      .eq("active", true)
      .order("leads_received", { ascending: true }); // FAIR DISTRIBUTION

    if (!contractors?.length) {
      return res.json({ success: true, message: "No contractors available" });
    }

    // 3. Pick BEST AVAILABLE contractor
    const contractor = contractors.find(
      (c) => (c.leads_received || 0) < (c.max_leads || 20)
    );

    if (!contractor) {
      return res.json({ success: true, message: "All contractors full" });
    }

    // 4. Async SMS (non-blocking future scaling upgrade ready)
    fetch(process.env.SMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: contractor.phone,
        message: `🔥 Lead (${score}/100)\n📍 ${city}\n🛠️ ${issue}\n📞 ${phone}`,
      }),
    }).catch(console.error);

    // 5. Update contractor usage safely
    await supabase
      .from("contractors")
      .update({
        leads_received: (contractor.leads_received || 0) + 1,
      })
      .eq("id", contractor.id);

    return res.json({ success: true, routed: contractor.phone });
  } catch (err) {
    console.error("Lead error:", err.message);
    return res.status(500).json({ error: "Lead routing failed" });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 RoofFlow scaled backend running on ${PORT}`);
});