const bot = require("./client");
const { dispatchLead } = require("../../call-center/dispatch");

function bootstrapTelegram() {
  console.log("[telegram] booting");

  bot.on("message", async (msg) => {
    try {
      const lead = {
        source: "telegram",
        chatId: msg.chat.id,
        text: msg.text,
        user: msg.from,
        created_at: new Date(),
      };

      await dispatchLead(lead);

    } catch (err) {
      console.error("[telegram] error", err);
    }
  });

  console.log("[telegram] ready");
}

module.exports = bootstrapTelegram;