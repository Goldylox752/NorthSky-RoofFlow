module.exports = async (req, res) => {
  try {
    const update = req.body;

    const chatId = update?.message?.chat?.id;
    const text = update?.message?.text;

    if (!chatId) return res.sendStatus(200);

    const reply =
      text === "/start"
        ? "👋 Bot is live"
        : `You said: ${text}`;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(200);
  }
};