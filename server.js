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

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// ENV VARIABLES
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
// SAFETY CHECK (prevents silent crashes)
// =====================
const requiredEnv = [
  "OPENAI_API_KEY",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE",
  "BUSINESS_PHONE",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing env variable: ${key}`);
    process.exit(1);
  }
}

// =====================
// INIT SERVICES
// =====================
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// =====================
// HOME ROUTE (FIXES "Cannot GET /")
// =====================
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>AI SMS Server</title>
      </head>
      <body style="font-family: Arial; text-align:center; padding:50px;">
        <h1>🚀 AI SMS Server Online</h1>
        <p>Twilio + OpenAI backend is running successfully</p>
      </body>
    </html>
  `);
});

// =====================
// SMS WEBHOOK (TWILIO)
// =====================
app.post("/sms", async (req, res) => {
  try {
    const incomingMsg = req.body?.Body;
    const from = req.body?.From;

    if (!incomingMsg || !from) {
      return res.status(400).send("Invalid request");
    }

    console.log("📩 Incoming SMS:", incomingMsg);

    // OpenAI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful business assistant." },
        { role: "user", content: incomingMsg },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content || "Sorry, try again.";

    // Send SMS back
    await twilioClient.messages.create({
      body: reply,
      from: TWILIO_PHONE,
      to: from,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ SMS ERROR:", err);
    res.status(500).send("Server error");
  }
});

// =====================
// START SERVER
// =====================
const port = PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// =====================
// ERROR HANDLERS
// =====================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});