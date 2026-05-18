export async function POST(req) {
  try {
    const update = await req.json();

    console.log("📩 Telegram update:", update);

    const chatId = update?.message?.chat?.id;
    const text = update?.message?.text;

    if (!chatId) {
      return Response.json({ ok: true });
    }

    const reply =
      text === "/start"
        ? "👋 Bot is live and connected"
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

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);

    // IMPORTANT: always return 200 so Telegram does NOT retry
    return Response.json({ ok: true });
  }
}