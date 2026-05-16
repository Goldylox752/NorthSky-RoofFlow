const store = require("../core/store");
const { isAdmin, deny } = require("../core/guard");

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `SaaS Panel\n\n/users\n/leads\n/revenue\n/upgrade <id>`
    );
  });

  bot.onText(/\/users/, (msg) => {
    if (!isAdmin(msg.from.id)) return deny(bot, msg);
    bot.sendMessage(msg.chat.id, `Users: ${store.users.length}`);
  });

  bot.onText(/\/leads/, (msg) => {
    if (!isAdmin(msg.from.id)) return deny(bot, msg);

    const leads = store.leads.slice(-5);

    if (!leads.length) {
      return bot.sendMessage(msg.chat.id, "No leads");
    }

    const text = leads
      .map(
        (l, i) =>
          `Lead ${i + 1}\nEmail: ${l.email || "N/A"}\nScore: ${l.score || 0}`
      )
      .join("\n\n---\n\n");

    bot.sendMessage(msg.chat.id, text);
  });

  bot.onText(/\/revenue/, (msg) => {
    if (!isAdmin(msg.from.id)) return deny(bot, msg);
    bot.sendMessage(msg.chat.id, `Revenue: $${store.revenue}`);
  });

  bot.onText(/\/upgrade (\d+)/, (msg, match) => {
    if (!isAdmin(msg.from.id)) return deny(bot, msg);

    const userId = match?.[1];
    bot.sendMessage(msg.chat.id, `User ${userId} upgraded`);
  });
};