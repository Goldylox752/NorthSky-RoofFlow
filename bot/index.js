const bot = require("./client");
const { dispatchLead } = require("../../call-center/dispatch");

function bootstrapTelegram() {
  console.log("[telegram] booting");

  bot.on("message", async (msg) => {
    try {
      if (!msg.text) return;

      const lead = {
        source: "telegram",
        chatId: msg.chat.id,
        text: msg.text,
        user: {
          id: msg.from?.id,
          username: msg.from?.username,
        },
        created_at: new Date(),
      };

      // ONLY dispatch — no business logic here
      await dispatchLead(lead);

      // optional acknowledgment only
      bot.sendMessage(msg.chat.id, "Received.");

    } catch (err) {
      console.error("[telegram] handler error", err);

      bot.sendMessage(msg.chat.id, "Error processing request.");
    }
  });

  console.log("[telegram] ready");
}

module.exports = bootstrapTelegram;