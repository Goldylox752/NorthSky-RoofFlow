export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const update = req.body;

    console.log("📩 Telegram webhook received:", update);

    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    if (!chatId) {
      return res.status(200).json({ ok: true });
    }

    let reply = "I didn't understand that.";

    if (text === "/start") {
      reply = "👋 Welcome! Your bot is live.";
    } else if (text) {
      reply = `You said: ${text}`;
    }

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ ok: true });
  }
}