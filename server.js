// =====================
// ENV SETUP
// =====================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const OpenAI = require("openai");
const Stripe = require("stripe");

const app = express();

// =====================
// ENV
// =====================
const {
  OPENAI_API_KEY,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  STRIPE_SECRET_KEY,
  PORT,
} = process.env;

// =====================
// SAFETY CHECK
// =====================
const required = [
  "OPENAI_API_KEY",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE",
  "STRIPE_SECRET_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing env: ${key}`);
    process.exit(1);
  }
}

// =====================
// INIT SERVICES
// =====================
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
const stripe = new Stripe(STRIPE_SECRET_KEY);

// =====================
// MIDDLEWARE ORDER (IMPORTANT)
// =====================
app.use(cors());
app.use(express.json());

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
    { delay: 60 * 60 * 1000, text: "We only take limited contractors per area." },
    { delay: 24 * 60 * 60 * 1000, text: "Still want exclusive roofing leads?" },
    { delay: 48 * 60 * 60 * 1000, text: "Final reminder — spots are filling fast." },
  ];
}

function sendDrip(phone, messages) {
  messages.forEach((msg, i) => {
    setTimeout(async () => {
      try {
        await twilioClient.messages.create({
          body: msg.text,
          from: TWILIO_PHONE,
          to: phone,
        });

        console.log(`📤 Drip ${i + 1} sent to ${phone}`);
      } catch (err) {
        console.error("Drip error:", err.message);
      }
    }, msg.delay);
  });
}

// =====================
// 🔥 HIGH-CONVERTING LANDING PAGE
// =====================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>AI Roofing Leads</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />

<style>
body {
  margin:0;
  font-family: Arial;
  background:#0b1220;
  color:white;
}

.container {
  max-width:1000px;
  margin:auto;
  padding:80px 20px;
  text-align:center;
}

h1 {
  font-size:48px;
}

p {
  color:#cbd5e1;
  font-size:18px;
  line-height:1.6;
}

.card {
  background:#111827;
  padding:30px;
  border-radius:12px;
  margin-top:40px;
  border:1px solid #1f2937;
}

.btn {
  margin-top:20px;
  padding:14px 24px;
  background:#22c55e;
  border:none;
  color:black;
  font-weight:bold;
  border-radius:8px;
  cursor:pointer;
  font-size:16px;
}

.btn:hover {
  opacity:0.9;
}

.badge {
  display:inline-block;
  background:#1f2937;
  padding:8px 14px;
  border-radius:20px;
  font-size:12px;
  color:#a5b4fc;
  margin-bottom:20px;
}
</style>
</head>

<body>

<div class="container">

  <div class="badge">🚀 AI POWERED LEAD GENERATION</div>

  <h1>Exclusive Roofing Leads<br/>Delivered to Your Phone</h1>

  <p>
    We generate high-intent homeowner leads and deliver them directly to contractors via SMS using AI automation.
    No ads, no cold calling, no wasted time.
  </p>

  <div class="card">
    <h2>💰 What You Get</h2>
    <p>
      ✔ Exclusive leads in your area<br/>
      ✔ Instant SMS notifications<br/>
      ✔ AI follow-up system<br/>
      ✔ Automated lead qualification<br/>
    </p>

    <button class="btn" onclick="checkout('growth')">
      Get Access Now
    </button>
  </div>

</div>

<script>
async function checkout(plan) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan,
      email: 'test@test.com',
      phone: '0000000000'
    })
  });

  const data = await res.json();
  window.location.href = data.url;
}
</script>

</body>
</html>
  `);
});

// =====================
// STRIPE CHECKOUT
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
              name: `AI Roofing Leads - ${plan}`,
            },
            unit_amount: PLANS[plan],
          },
          quantity: 1,
        },
      ],

      success_url: `${req.headers.origin}`,
      cancel_url: `${req.headers.origin}`,

      metadata: { email, phone, plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =====================
// STRIPE WEBHOOK (FIXED)
// =====================
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;

    try {
      event = JSON.parse(req.body.toString());
    } catch (err) {
      return res.status(400).send("Invalid webhook");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const phone = session.metadata?.phone;

      console.log("💰 PAYMENT SUCCESS:", session.metadata);

      if (phone) {
        sendDrip(phone, dripSequence());
      }
    }

    res.json({ received: true });
  }
);

// =====================
// LEAD CAPTURE
// =====================
app.post("/api/lead", async (req, res) => {
  try {
    const { phone } = req.body;

    await twilioClient.messages.create({
      body: "Thanks — we’ll be in touch shortly.",
      from: TWILIO_PHONE,
      to: phone,
    });

    sendDrip(phone, dripSequence());

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Lead error" });
  }
});

// =====================
// SMS AI BOT
// =====================
app.post("/sms", async (req, res) => {
  try {
    const msg = req.body?.Body;
    const from = req.body?.From;

    if (!msg || !from) return res.sendStatus(200);

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Short helpful business assistant." },
        { role: "user", content: msg },
      ],
    });

    const reply = ai.choices?.[0]?.message?.content || "Thanks — we’ll follow up.";

    await twilioClient.messages.create({
      body: reply,
      from: TWILIO_PHONE,
      to: from,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// =====================
// START SERVER
// =====================
app.listen(PORT || 3000, () => {
  console.log("🚀 AI Lead System running");
});