require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");

/* ===============================
   ENV
=============================== */
const {
  TELEGRAM_BOT_TOKEN,
  WEBHOOK_URL,
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID,
  STRIPE_WEBHOOK_SECRET,
  PORT = 3000,
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_URL || !STRIPE_SECRET_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

/* ===============================
   INIT SERVICES
=============================== */
const app = express();
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  maxNetworkRetries: 2,
  timeout: 30000,
});

/* IMPORTANT: Stripe raw body must come first */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

/* ===============================
   WEBHOOK CONFIG
=============================== */
const TELEGRAM_WEBHOOK_PATH = "/telegram-webhook";
const TELEGRAM_WEBHOOK_URL = `${WEBHOOK_URL}${TELEGRAM_WEBHOOK_PATH}`;

/* ===============================
   IN-MEMORY DB (REPLACE WITH SUPABASE LATER)
=============================== */
const users = new Map();

function getUser(tgUser) {
  if (!users.has(tgUser.id)) {
    users.set(tgUser.id, {
      telegramId: tgUser.id,
      username: tgUser.username || "unknown",
      plan: "free",
      stripeSessionId: null,
      createdAt: Date.now(),
    });
  }
  return users.get(tgUser.id);
}

const isPro = (user) => user.plan === "pro";

/* ===============================
   TELEGRAM COMMANDS
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "profile", description: "View profile" },
  { command: "plan", description: "View plan" },
  { command: "upgrade", description: "Upgrade to PRO" },
  { command: "help", description: "Help menu" },
]);

/* ===============================
   START WEBHOOK
=============================== */
(async () => {
  await bot.setWebHook(TELEGRAM_WEBHOOK_URL);
  console.log("Telegram webhook set:", TELEGRAM_WEBHOOK_URL);
})();

/* ===============================
   COMMANDS
=============================== */
bot.onText(/\/start/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Welcome ${user.username}

Plan: ${user.plan}

Commands:
/profile
/plan
/upgrade`
  );
});

bot.onText(/\/profile/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Profile
ID: ${user.telegramId}
Username: ${user.username}
Plan: ${user.plan}`
  );
});

bot.onText(/\/plan/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Current Plan: ${user.plan}

Free:
- Basic access

PRO:
- Full access`
  );
});

/* ===============================
   STRIPE CHECKOUT
=============================== */
bot.onText(/\/upgrade/, async (msg) => {
  const user = getUser(msg.from);

  if (isPro(user)) {
    return bot.sendMessage(msg.chat.id, "You are already PRO.");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${WEBHOOK_URL}/success`,
      cancel_url: `${WEBHOOK_URL}/cancel`,
      metadata: {
        telegramId: String(user.telegramId),
      },
    });

    user.stripeSessionId = session.id;

    bot.sendMessage(
      msg.chat.id,
      `Upgrade here:\n${session.url}`
    );
  } catch (err) {
    console.error("Stripe error:", err);
    bot.sendMessage(msg.chat.id, "Payment error. Try again later.");
  }
});

/* ===============================
   STRIPE WEBHOOK
=============================== */
app.post("/stripe-webhook", (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook failed:", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const telegramId = Number(session.metadata.telegramId);

    const user = users.get(telegramId);

    if (user) {
      user.plan = "pro";

      bot.sendMessage(
        telegramId,
        "Payment successful. You are now PRO."
      );
    }
  }

  res.sendStatus(200);
});

/* ===============================
   TELEGRAM WEBHOOK ENDPOINT
=============================== */
app.post(TELEGRAM_WEBHOOK_PATH, (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    res.sendStatus(500);
  }
});

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  const allUsers = Array.from(users.values());

  res.json({
    status: "ok",
    totalUsers: allUsers.length,
    proUsers: allUsers.filter((u) => u.plan === "pro").length,
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});