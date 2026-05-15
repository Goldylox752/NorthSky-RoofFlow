const bot = require("../../config/telegram");

const {
  requireUser,
  getOrCreateClerkUser,
} = require("../../services/clerk.service");

const {
  getLeads,
  upgradeUser,
} = require("../../services/user.service");

const { formatLeads } = require("../../services/leadFormatter");

/* ===============================
   START
=============================== */

bot.onText(/\/start/, async (msg) => {
  try {
    const user = await getOrCreateClerkUser(msg.from);

    await bot.sendMessage(
      msg.chat.id,
      `🚀 Welcome ${user.username || "User"}`
    );
  } catch (err) {
    console.error(err);
  }
});

/* ===============================
   PROFILE
=============================== */

bot.onText(/\/profile/, async (msg) => {
  try {
    const user = await requireUser(msg);

    if (!user) return;

    await bot.sendMessage(
      msg.chat.id,
      `👤 Profile\n\nID: ${user.id}\nUsername: ${user.username || "N/A"}`
    );
  } catch (err) {
    console.error(err);
  }
});

/* ===============================
   LEADS
=============================== */

bot.onText(/\/leads/, async (msg) => {
  try {
    const user = await requireUser(msg);
    if (!user) return;

    const leads = await getLeads(5);

    await bot.sendMessage(
      msg.chat.id,
      formatLeads(leads)
    );
  } catch (err) {
    console.error(err);
  }
});

/* ===============================
   UPGRADE
=============================== */

bot.onText(/\/upgrade/, async (msg) => {
  try {
    const user = await requireUser(msg);
    if (!user) return;

    await upgradeUser(user.id);

    await bot.sendMessage(
      msg.chat.id,
      "✅ PRO upgrade complete"
    );
  } catch (err) {
    console.error(err);
  }
});

/* ===============================
   ERRORS
=============================== */

bot.on("polling_error", console.error);

module.exports = bot;