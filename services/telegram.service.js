// services/telegram.service.js
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

export function sendMessage(chatId, text) {
  return bot.sendMessage(chatId, text);
}

export function sendLead(chatId, lead) {
  return bot.sendMessage(
    chatId,
`🔥 NEW LEAD UNLOCKED

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
City: ${lead.city}
Price: $${lead.price}`
  );
}

export default bot;