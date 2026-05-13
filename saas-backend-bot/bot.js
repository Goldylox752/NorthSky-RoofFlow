require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

/* ===============================
   ENV
=============================== */
const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

if (!token || !webhookUrl) {
  console.error("Missing TELEGRAM_BOT_TOKEN or WEBHOOK_URL");
  process.exit(1);
}

/* ===============================
   EXPRESS APP
=============================== */
const app = express();
app.use(express.json());

/* ===============================
   BOT (NO POLLING)
=============================== */
const bot = new TelegramBot(token);

/* ===============================
   SECURE WEBHOOK PATH (FIXED)
   - NO TOKEN IN URL
=============================== */
const webhookPath = "/telegram-webhook";

/* ===============================
   SET TELEGRAM COMMANDS
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "help", description: "Help menu" },
  { command: "ping", description: "Check bot status" }
]);

/* ===============================
   SET WEBHOOK
=============================== */
const fullWebhookUrl = `${webhookUrl}${webhookPath}`;

bot.setWebHook(fullWebhookUrl);

console.log("Webhook set to:", fullWebhookUrl);

/* ===============================
   COMMAND HANDLERS
=============================== */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Webhook Bot Online (Production Mode)");
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, "Commands:\n/start\n/help\n/ping");
});

bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, "Pong! Bot is alive.");
});

/* ===============================
   MESSAGE LOGGER
=============================== */
bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  console.log(`[${msg.chat.id}] ${msg.text}`);
});

/* ===============================
   WEBHOOK ENDPOINT
=============================== */
app.post(webhookPath, (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});