require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

/* ===============================
   ENV CHECK
=============================== */
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

/* ===============================
   BOT INIT
=============================== */
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

console.log("🤖 Telegram bot is running...");

/* ===============================
   START COMMAND
=============================== */
bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const username = msg.from?.username || "there";

    await bot.sendMessage(
      chatId,
      `🚀 Welcome ${username}\n\nLogin Bot Online and ready.`
    );
  } catch (err) {
    console.error("Start command error:", err);
  }
});

/* ===============================
   MESSAGE HANDLER
=============================== */
bot.on("message", (msg) => {
  try {
    if (!msg.text) return;

    console.log(`[MESSAGE] ${msg.from?.id}: ${msg.text}`);
  } catch (err) {
    console.error("Message handler error:", err);
  }
});

/* ===============================
   ERROR HANDLING
=============================== */
bot.on("polling_error", (err) => {
  console.error("⚠️ Polling error:", err.code || err.message);
});

bot.on("error", (err) => {
  console.error("❌ Bot error:", err);
});

/* ===============================
   GRACEFUL SHUTDOWN
=============================== */
process.on("SIGINT", () => {
  console.log("🔻 Shutting down bot...");
  bot.stopPolling();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🔻 SIGTERM received...");
  bot.stopPolling();
  process.exit(0);
});