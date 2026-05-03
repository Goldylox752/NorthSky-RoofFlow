// =====================
// ENV SETUP
// =====================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const Stripe = require("stripe");

const app = express();

// =====================
// ENV
// =====================
const {
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  STRIPE_SECRET_KEY,
  FRONTEND_URL,
} = process.env;

// =====================
// SAFETY CHECK (Vercel-safe)
// =====================
const requiredEnv = [
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE",
  "STRIPE_SECRET_KEY",
  "FRONTEND_URL",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn("⚠️ Missing env:", key);
  }
});

// =====================
// INIT SERVICES
// =====================
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
const stripe = new Stripe(STRIPE_SECRET_KEY);

// =====================
// MIDDLEWARE
// =====================
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// =====================
// OLLAMA AI FUNCTION
// =====================
async function askOllama(prompt) {
  try {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          { role: "system", content: "You are a short, helpful assistant." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    const data = await res.json();
    return data?.message?.content || "Sorry, no response.";
  } catch (err) {
    console.error("Ollama error:", err.message);
    return "AI temporarily unavailable.";
  }
}

// =====================
// PRICING
// =====================
const PLANS = {
  starter: 49900,
  growth: 99900,
  domination: 199900,
};

// =====================
// DRIP SYSTEM
// =====================
function dripSequence() {
  return [
    { delay: 0, text: "Thanks — we received your request." },
    { delay: 3600000, text: "We only accept limited contractors per area." },
    { delay: 86400000, text: "Still interested in exclusive roofing leads?" },
    { delay: 172800000, text: "Final reminder — spots are almost full." },
  ];
}

function sendDrip(phone, messages) {
  messages.forEach((msg) => {
    setTimeout(async () => {
      try {
        await twilioClient.messages.create({
          body: msg.text,
          from: TWILIO_PHONE,
          to: phone,
        });
      } catch (err) {
        console.error("Drip error:", err.message);
      }
    }, msg.delay);
  });
}

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.send("🚀 RoofFlow API LIVE (Ollama Mode)");
});

// =====================
// EVENT TRACKING
// =====================
app.post("/api/event", (req, res) => {
  console.log("EVENT:", req.body);
  res.json({ success: true });
});

// =====================
// CHECKOUT (Stripe)
// =====================
app.post("/api/checkout", async (req, res) => {
  try {
    const { plan, email, phone } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `RoofFlow AI - ${plan}`,
            },
            unit_amount: PLANS[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/success`,
      cancel_url: `${FRONTEND_URL}/cancel`,
      metadata: { email, phone, plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err.message);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =====================
// STRIPE WEBHOOK
// =====================
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;

    try {
      event = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).send("Invalid webhook");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const phone = session.metadata?.phone;

      console.log("💰 PAYMENT:", session.metadata);

      if (phone) sendDrip(phone, dripSequence());
    }

    res.json({ received: true });
  }
);

// =====================
// LEADS
// =====================
app.post("/api/lead", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ error: "Missing phone" });

    await twilioClient.messages.create({
      body: "Thanks — we’ll follow up shortly.",
      from: TWILIO_PHONE,
      to: phone,
    });

    sendDrip(phone, dripSequence());

    res.json({ success: true });
  } catch (err) {
    console.error("Lead error:", err.message);
    res.status(500).json({ error: "Lead error" });
  }
});

// =====================
// SMS BOT (OLLAMA AI)
// =====================
app.post("/sms", async (req, res) => {
  try {
    const msg = req.body?.Body;
    const from = req.body?.From;

    if (!msg || !from) return res.sendStatus(200);

    const reply = await askOllama(msg);

    await twilioClient.messages.create({
      body: reply,
      from: TWILIO_PHONE,
      to: from,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("SMS error:", err.message);
    res.sendStatus(200); // never break webhook
  }
});

module.exports = app;