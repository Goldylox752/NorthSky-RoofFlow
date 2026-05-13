require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");

/* ===============================
   ENV
=============================== */
const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 3000;

if (!token || !webhookUrl) {
  console.error("Missing TELEGRAM_BOT_TOKEN or WEBHOOK_URL");
  process.exit(1);
}

/* ===============================
   EXPRESS APP
=============================== */
const app = express();
app.use(express.json({ limit: "1mb" }));

/* ===============================
   BOT (NO POLLING)
=============================== */
const bot = new TelegramBot(token);

/* ===============================
   WEBHOOK PATH
=============================== */
const webhookPath = "/telegram-webhook";
const fullWebhookUrl = `${webhookUrl}${webhookPath}`;

/* ===============================
   COMMAND MENU
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "help", description: "Help menu" },
  { command: "ping", description: "Check bot status" },
  { command: "profile", description: "View profile" },
  { command: "plan", description: "View plan" },
  { command: "upgrade", description: "Upgrade to PRO" }
]);

/* ===============================
   SET WEBHOOK
=============================== */
async function initWebhook() {
  try {
    await bot.setWebHook(fullWebhookUrl);
    console.log("Webhook set to:", fullWebhookUrl);
  } catch (err) {
    console.error("Failed to set webhook:", err);
  }
}

initWebhook();

/* ===============================
   SAAS USER STORE (TEMP DB)
=============================== */
const users = new Map();

function getOrCreateUser(tgUser) {
  let user = users.get(tgUser.id);

  if (!user) {
    user = {
      telegramId: tgUser.id,
      username: tgUser.username || "unknown",
      plan: "free",
      stripeSessionId: null,
      createdAt: new Date()
    };

    users.set(tgUser.id, user);
  }

  return user;
}

/* ===============================
   UPGRADE SYSTEM (LOCAL FALLBACK)
=============================== */
function upgradeUser(user) {
  user.plan = "pro";
  users.set(user.telegramId, user);
}

/* ===============================
   START
=============================== */
bot.onText(/\/start/, (msg) => {
  const user = getOrCreateUser(msg.from);

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

/* ===============================
   PROFILE
=============================== */
bot.onText(/\/profile/, (msg) => {
  const user = getOrCreateUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Profile:
ID: ${user.telegramId}
Username: ${user.username}
Plan: ${user.plan}`
  );
});

/* ===============================
   PLAN
=============================== */
bot.onText(/\/plan/, (msg) => {
  const user = getOrCreateUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Current Plan: ${user.plan}

Free:
- Basic features

PRO:
- Full access`
  );
});

/* ===============================
   UPGRADE (REAL STRIPE)
=============================== */
bot.onText(/\/upgrade/, async (msg) => {
  const user = getOrCreateUser(msg.from);

  if (user.plan === "pro") {
    return bot.sendMessage(msg.chat.id, "You are already PRO.");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${webhookUrl}/success`,
      cancel_url: `${webhookUrl}/cancel`,
      metadata: {
        telegramId: user.telegramId
      }
    });

    user.stripeSessionId = session.id;

    bot.sendMessage(
      msg.chat.id,
      `Upgrade to PRO here:\n${session.url}`
    );
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "Payment error occurred.");
  }
});

/* ===============================
   STRIPE WEBHOOK (AUTO UPGRADE)
=============================== */
app.post("/stripe-webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const telegramId = session.metadata.telegramId;

    const user = Array.from(users.values()).find(
      (u) => u.telegramId == telegramId
    );

    if (user) {
      user.plan = "pro";

      bot.sendMessage(
        user.telegramId,
        "Payment successful. You are now PRO."
      );
    }
  }

  res.sendStatus(200);
});

/* ===============================
   HELP
=============================== */
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Commands:\n/start\n/profile\n/plan\n/upgrade\n/help\n/ping"
  );
});

/* ===============================
   PING
=============================== */
bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, "Pong! Bot is alive.");
});

/* ===============================
   MESSAGE LOGGER
=============================== */
bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  console.log(`[USER ${msg.from.id}] ${msg.text}`);
});

/* ===============================
   WEBHOOK ENDPOINT
=============================== */
app.post(webhookPath, (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    users: users.size,
    proUsers: Array.from(users.values()).filter(u => u.plan === "pro").length
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});