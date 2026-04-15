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
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("🚀 RoofFlow Backend Running");
});

// =========================
// STRIPE CHECKOUT SESSION
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
            recurring: { interval: "month" }
          },
          quantity: 1
        }
      ],
      metadata: {
        email,
        name: name || "",
        phone: phone || "",
        city: city || ""
      },
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel"
    });

    return res.json({ id: session.id });

  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: "Stripe session failed" });
  }
});

// =========================
// STRIPE WEBHOOK (RAW BODY REQUIRED)
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
      console.error("❌ Stripe signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const email = session.metadata?.email;
        const customerId = session.customer;

        if (!email) {
          return res.json({ received: true });
        }

        // Activate contractor account
        const { error } = await supabase
          .from("contractors")
          .update({
            active: true,
            stripe_customer_id: customerId
          })
          .eq("email", email);

        if (error) {
          console.error("Supabase update error:", error.message);
        } else {
          console.log("✅ Contractor activated:", email);
        }
      }

      return res.json({ received: true });

    } catch (err) {
      console.error("Webhook processing error:", err.message);
      return res.status(500).json({ error: "Webhook failed" });
    }
  }
);

// =========================
// NEW LEAD ROUTER
// =========================
app.post("/api/new-lead", async (req, res) => {
  try {
    const { name, phone, city, issue } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Save lead
    const { data: lead, error: leadError } = await supabase
      .from("homeowner_leads")
      .insert([{ name, phone, city, issue }])
      .select()
      .single();

    if (leadError) {
      console.error("Lead insert error:", leadError.message);
    }

    // 2. Find active contractors
    const { data: contractors, error: contractorError } = await supabase
      .from("contractors")
      .select("*")
      .eq("city", city)
      .eq("active", true);

    if (contractorError) {
      console.error("Contractor fetch error:", contractorError.message);
      return res.json({ success: true, note: "Lead saved but routing failed" });
    }

    if (!contractors || contractors.length === 0) {
      return res.json({ success: true, note: "No active contractors" });
    }

    // 3. Route to ONE contractor (fair distribution)
    for (const c of contractors) {

      if ((c.leads_received || 0) >= (c.max_leads || 20)) continue;

      try {
        // SMS SEND
        await fetch(process.env.SMS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: c.phone,
            message: `🔥 New Roofing Lead\n📍 ${city}\n🛠️ ${issue}\n📞 ${phone}`
          })
        });

        // Update lead count
        await supabase
          .from("contractors")
          .update({
            leads_received: (c.leads_received || 0) + 1
          })
          .eq("id", c.id);

        console.log("📤 Lead sent to:", c.phone);
        break;

      } catch (err) {
        console.error("SMS routing error:", err.message);
      }
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Lead route error:", err.message);
    return res.status(500).json({ error: "Lead routing failed" });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 RoofFlow running on port ${PORT}`);
});