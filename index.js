require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");

const { runGoogleLeadEngine } = require("./googleLeads");

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
  res.send("RoofFlow AI SaaS Engine Running 🚀");
});


// ======================================================
// STRIPE CHECKOUT (TENANT CREATION FLOW)
// ======================================================
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const email = req.body.email;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RoofFlow AI - Roofing Lead System",
            },
            unit_amount: 49700,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        email,
      },
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
// STRIPE WEBHOOK → CREATE TENANT
// ======================================================
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
      const email = session.metadata?.email;

      console.log("💰 Payment success:", email);

      if (!email) return res.json({ received: true });

      // Check existing tenant
      const { data: existing } = await supabase
        .from("tenants")
        .select("*")
        .eq("email", email)
        .single();

      if (existing) {
        await supabase
          .from("tenants")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);
      } else {
        await supabase.from("tenants").insert([
          {
            email,
            stripe_customer_id: session.customer,
            plan: "growth",
            status: "active",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }

    res.json({ received: true });
  }
);


// ======================================================
// SMS SYSTEM
// ======================================================
async function sendLeadSMS(tenant, lead) {
  try {
    await client.messages.create({
      body: `🔥 New Lead\n${lead.name}\n${lead.phone}\n${lead.address}`,
      from: process.env.TWILIO_NUMBER,
      to: process.env.RECEIVER_NUMBER,
    });

    console.log(`📲 SMS sent to ${tenant.email}`);
  } catch (err) {
    console.error("SMS error:", err.message);
  }
}


// ======================================================
// HOT LEAD LOGGER
// ======================================================
function logHotLead(lead) {
  console.log(`🔥 HOT LEAD | ${lead.name} | SCORE: ${lead.score}`);
}


// ======================================================
// SAVE LEAD (TENANT-AWARE)
// ======================================================
async function saveLead(tenantId, lead) {
  const { data: settings } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();

  const minScore = settings?.max_lead_score || 60;

  if (lead.score < minScore) return;

  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", lead.phone)
    .eq("tenant_id", tenantId)
    .single();

  if (existing) return;

  await supabase.from("leads").insert([
    {
      tenant_id: tenantId,
      ...lead,
    },
  ]);

  logHotLead(lead);

  if (lead.score >= 80) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    await sendLeadSMS(tenant, lead);
  }
}


// ======================================================
// RUN ENGINE FOR ONE TENANT
// ======================================================
async function runEngineForTenant(tenant) {
  const settings = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single();

  if (!settings.data) return;

  for (const city of settings.data.cities || []) {
    for (const type of settings.data.job_types || []) {
      const leads = await runGoogleLeadEngine(`${type} in ${city}`);

      for (const lead of leads) {
        const score =
          (lead.rating || 0) * 20 +
          (lead.reviews_count || 0) * 0.1;

        await saveLead(tenant.id, {
          name: lead.name,
          phone: lead.phone,
          address: lead.address,
          category: type,
          source: "google_maps",
          score: Math.min(Math.floor(score), 100),
        });
      }
    }
  }
}


// ======================================================
// CRON (MULTI-TENANT ENGINE)
// ======================================================
cron.schedule("0 */6 * * *", async () => {
  console.log("🧠 Running Multi-Tenant Lead Engine...");

  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .eq("status", "active");

  for (const tenant of tenants || []) {
    await runEngineForTenant(tenant);
  }
});


// ======================================================
// START SERVER
// ======================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 SaaS Server running on port ${PORT}`);
});
