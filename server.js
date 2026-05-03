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

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// ENV
// =====================
const {
  OPENAI_API_KEY,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  BUSINESS_PHONE,
  PORT,
} = process.env;

// =====================
// INIT
// =====================
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// =====================
// SIMPLE LEAD STORE (MVP CRM)
// =====================
const leads = new Map();

// =====================
// DRIP SYSTEM
// =====================
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

function dripSequence() {
  return [
    {
      delay: 0,
      text: "Thanks — we received your request and are reviewing it now.",
    },
    {
      delay: 60 * 60 * 1000,
      text: "Quick update: we only accept a limited number of contractors per area.",
    },
    {
      delay: 24 * 60 * 60 * 1000,
      text: "Still interested in exclusive leads in your area?",
    },
    {
      delay: 48 * 60 * 60 * 1000,
      text: "Final reminder — availability is limited today.",
    },
  ];
}

// =====================
// HOME PAGE (FIXES ERROR)
// =====================
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; text-align:center; padding:50px;">
        <h1>🚀 AI Lead System Live</h1>
        <p>SMS + AI + Drip system running</p>
      </body>
    </html>
  `);
});

// =====================
// LEAD CAPTURE (🔥 MONEY ROUTE)
// =====================
app.post("/api/lead", async (req, res) => {
  try {
    const { email, phone, plan } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const lead = {
      email,
      phone,
      plan,
      time: Date.now(),
    };

    leads.set(phone, lead);

    console.log("📥 New Lead:", lead);

    // 1. instant SMS
    await twilioClient.messages.create({
      body: "Thanks — we received your request and will review it shortly.",
      from: TWILIO_PHONE,
      to: phone,
    });

    // 2. start drip
    sendDrip(phone, dripSequence());

    res.json({ success: true });
  } catch (err) {
    console.error("Lead error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================
// SMS AI REPLY (your existing feature)
// =====================
app.post("/sms", async (req, res) => {
  try {
    const incomingMsg = req.body?.Body;
    const from = req.body?.From;

    if (!incomingMsg || !from) return res.sendStatus(200);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a short helpful business assistant." },
        { role: "user", content: incomingMsg },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content || "Thanks — we’ll follow up.";

    await twilioClient.messages.create({
      body: reply,
      from: TWILIO_PHONE,
      to: from,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("SMS error:", err);
    res.sendStatus(500);
  }
});

// =====================
// START SERVER
// =====================
const port = PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on ${port}`);
});