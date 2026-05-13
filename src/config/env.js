require("dotenv").config();

module.exports = {
  TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  PORT: process.env.PORT || 3000,
};