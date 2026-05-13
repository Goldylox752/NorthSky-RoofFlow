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
app.use(express.json({ limit: "1mb" }));

/* ===============================
   BOT (NO POLLING)
=============================== */
const bot = new TelegramBot(token);

/* ===============================
   WEBHOOK PATH (SECURE STATIC ROUTE)
=============================== */
const webhookPath = "/telegram-webhook";
const fullWebhookUrl = `${webhookUrl}${webhookPath}`;

/* ===============================
   TELEGRAM COMMANDS (UI MENU)
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "help", description: "Help menu" },
  { command: "ping", description: "Check bot status" },
  { command: "profile", description: "View your profile" }
]);

/* ===============================
   SET WEBHOOK
=============================== */
async function initWebhook() {
  try {
    await bot.setWebHook(fullWebhookUrl);
    console.log("Webhook set to:", fullWebhookUrl);
  } catch (err) {
    console.error("Failed to set webhook:", err);
  }
}

initWebhook();

/* ===============================
   BASIC SAAS USER STORE (TEMP MEMORY)
   (Replace with MongoDB later)
=============================== */
const users = new Map();

function getOrCreateUser(tgUser) {
  let user = users.get(tgUser.id);

  if (!user) {
    user = {
      telegramId: tgUser.id,
      username: tgUser.username || null,
      plan: "free",
      createdAt: new Date()
    };

    users.set(tgUser.id, user);
  }

  return user;
}

/* ===============================
   COMMAND HANDLERS
=============================== */
bot.onText(/\/start/, (msg) => {
  const user = getOrCreateUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Welcome ${user.username || "user"}
Plan: ${user.plan}

Commands:
/profile
/help
/ping`
  );
});

bot.onText(/\/profile/, (msg) => {
  const user = getOrCreateUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Profile:
ID: ${user.telegramId}
Username: ${user.username || "N/A"}
Plan: ${user.plan}`
  );
});

bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, "Pong! Bot is alive.");
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Commands:\n/start\n/help\n/ping\n/profile"
  );
});

/* ===============================
   MESSAGE LOGGER (SAFETY FILTERED)
=============================== */
bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  console.log(`[USER ${msg.from.id}] ${msg.text}`);
});

/* ===============================
   WEBHOOK ENDPOINT (ROBUST)
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
   HEALTH CHECK (IMPORTANT FOR SAAS)
=============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});