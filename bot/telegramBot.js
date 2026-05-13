require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getUser, getLeads } = require("../services/userService");
const { upgradeUser } = require("../services/userService");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

const bot = new TelegramBot(token, { polling: true });

console.log("Telegram bot connected");

/* ===============================
   COMMANDS
=============================== */

bot.onText(/\/start/, async (msg) => {
  const user = await getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Welcome ${user.username || "user"}

Plan: ${user.plan}
Use /leads to view leads`
  );
});

bot.onText(/\/profile/, async (msg) => {
  const user = await getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Profile:
ID: ${user.id}
Username: ${user.username}
Plan: ${user.plan}`
  );
});

bot.onText(/\/leads/, async (msg) => {
  const leads = await getLeads(5);

  const text = leads
    .map(
      (l) =>
        `• ${l.name || "No name"} | ${l.city || "N/A"} | $${l.price}`
    )
    .join("\n");

  bot.sendMessage(msg.chat.id, `Latest Leads:\n\n${text}`);
});

bot.onText(/\/upgrade/, async (msg) => {
  const user = await getUser(msg.from);

  await upgradeUser(user.id);

  bot.sendMessage(msg.chat.id, "User upgraded to PRO");
});

module.exports = bot;