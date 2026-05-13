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
   WEBHOOK PATH
=============================== */
const webhookPath = `/bot${token}`;

/* ===============================
   SET COMMANDS (TELEGRAM UI MENU)
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "help", description: "Help menu" },
  { command: "ping", description: "Check bot status" }
]);

/* ===============================
   SET WEBHOOK
=============================== */
bot.setWebHook(`${webhookUrl}${webhookPath}`);

console.log("Webhook set to:", `${webhookUrl}${webhookPath}`);

/* ===============================
   COMMAND HANDLERS
=============================== */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Webhook Bot Online (Production Mode)"
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Commands:\n/start\n/help\n/ping"
  );
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
   TELEGRAM WEBHOOK ENDPOINT
=============================== */
app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});