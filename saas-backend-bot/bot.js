require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

const bot = new TelegramBot(token, {
  polling: true,
});

console.log("✅ Bot started...");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🚀 Login Bot Online");
});

bot.on("message", (msg) => {
  console.log("Message:", msg.text);
});