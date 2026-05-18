require("dotenv").config();

const express = require("express");
const app = express();

/* ===============================
   IMPORT BOOTSTRAP
=============================== */
const bootstrapApp = require("./app/bootstrap");

/* ===============================
   MIDDLEWARE (GLOBAL SAFE)
=============================== */
app.use(express.json({ limit: "1mb" }));

/* ===============================
   STRIPE RAW BODY
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "northsky-flow-os",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ===============================
   ROOT ROUTE
=============================== */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "NorthSky API running",
  });
});

/* ===============================
   TELEGRAM WEBHOOK (PUBLIC - MUST STAY OUTSIDE AUTH SYSTEM)
=============================== */
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const update = req.body;

    console.log("📩 Telegram webhook received:", update);

    const chatId = update?.message?.chat?.id;
    const text = update?.message?.text;

    if (!chatId) {
      return res.status(200).json({ ok: true });
    }

    const reply = text === "/start"
      ? "👋 Welcome! Your bot is live."
      : `You said: ${text}`;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      }
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return res.status(200).json({ ok: true });
  }
});

/* ===============================
   START SYSTEM (BOOTSTRAP AFTER PUBLIC ROUTES)
=============================== */
async function start() {
  try {
    console.log("Starting server...");

    // IMPORTANT: bootstrap runs AFTER public routes are defined
    await bootstrapApp(app);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("BOOTSTRAP FAILED:", err);
    process.exit(1);
  }
}

start();