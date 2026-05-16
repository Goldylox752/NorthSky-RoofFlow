const {
  requireUser,
  getOrCreateClerkUser,
} = require("../../services/clerk.service");

const {
  getLeads,
  upgradeUser,
} = require("../../services/user.service");

const { formatLeads } = require("../../services/leadFormatter");

module.exports = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    try {
      const user = await getOrCreateClerkUser(msg.from);

      bot.sendMessage(
        msg.chat.id,
        `Welcome ${user.username || "User"} 🚀`
      );
    } catch (err) {
      console.error(err);
    }
  });

  bot.onText(/\/profile/, async (msg) => {
    try {
      const user = await requireUser(msg);
      if (!user) return;

      bot.sendMessage(
        msg.chat.id,
        `Profile\nID: ${user.id}\nUser: ${user.username || "N/A"}`
      );
    } catch (err) {
      console.error(err);
    }
  });

  bot.onText(/\/leads/, async (msg) => {
    try {
      const user = await requireUser(msg);
      if (!user) return;

      const leads = await getLeads(5);

      bot.sendMessage(msg.chat.id, formatLeads(leads));
    } catch (err) {
      console.error(err);
    }
  });

  bot.onText(/\/upgrade/, async (msg) => {
    try {
      const user = await requireUser(msg);
      if (!user) return;

      await upgradeUser(user.id);

      bot.sendMessage(msg.chat.id, "✅ Upgraded to PRO");
    } catch (err) {
      console.error(err);
    }
  });
};