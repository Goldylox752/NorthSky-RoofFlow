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
  CLIENT_URL,
  PORT = 3000,
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_URL || !STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
  throw new Error("Missing required environment variables");
}

/* ===============================
   INIT
=============================== */
const app = express();

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  maxNetworkRetries: 2,
  timeout: 30000,
});

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

/* ===============================
   MIDDLEWARE
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

/* ===============================
   USERS + STATE SYSTEM
=============================== */
const users = new Map();
const state = new Map();
const timers = new Map();

function getUser(tgUser) {
  let user = users.get(tgUser.id);

  if (!user) {
    user = {
      id: tgUser.id,
      username: tgUser.username || "unknown",
      plan: "free",
      stripeSessionId: null,
      createdAt: Date.now(),
    };
    users.set(tgUser.id, user);
  }

  return user;
}

const isPro = (u) => u.plan === "pro";

/* ===============================
   STATE HELPERS
=============================== */
function setState(id, s) {
  state.set(id, s);
}

function getState(id) {
  return state.get(id) || "new";
}

function clearTimer(id) {
  const t = timers.get(id);
  if (t) clearTimeout(t);
}

/* ===============================
   SALES MESSAGE
=============================== */
function salesMessage(user) {
  return `
🔥 YOUR ACCESS IS READY

Hi @${user.username}

You're currently on FREE.

━━━━━━━━━━━━━━
FREE:
• Limited access
• Lower priority
• Slower results
━━━━━━━━━━━━━━

💎 PRO — $19/month

UNLOCK:
⚡ Instant priority access
🎯 Better results first
🚀 Faster processing
📈 More opportunities

━━━━━━━━━━━━━━
WHY PRO WORKS:
Users who upgrade get results before everyone else.

👉 Upgrade here:
${CLIENT_URL}/checkout?plan=pro
`;
}

/* ===============================
   TELEGRAM MENU
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start" },
  { command: "plan", description: "Plan" },
  { command: "profile", description: "Profile" },
  { command: "upgrade", description: "Upgrade" },
  { command: "help", description: "Help" },
]);

/* ===============================
   START + FOLLOW-UP FLOW
=============================== */
bot.onText(/\/start/, (msg) => {
  const user = getUser(msg.from);

  setState(user.id, "started");

  bot.sendMessage(msg.chat.id, salesMessage(user));

  clearTimer(user.id);

  // FOLLOW UP #1 (30s)
  const t1 = setTimeout(() => {
    if (!isPro(user)) {
      bot.sendMessage(
        user.id,
        `Quick question 👀

Do you want me to show you why PRO users get better results?`
      );
    }
  }, 30000);

  timers.set(user.id, t1);

  // FOLLOW UP #2 (3 min)
  const t2 = setTimeout(() => {
    if (!isPro(user)) {
      bot.sendMessage(
        user.id,
        `Still thinking?

Most users upgrade because they don’t want to miss better opportunities.

Upgrade anytime here:
${CLIENT_URL}/checkout?plan=pro`
      );
    }
  }, 180000);

  timers.set(user.id, t2);
});

/* ===============================
   PLAN / PROFILE
=============================== */
bot.onText(/\/plan/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
`PLAN: ${user.plan.toUpperCase()}

FREE:
- Basic access

PRO:
- Priority system access
- Faster results`
  );
});

bot.onText(/\/profile/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
`PROFILE
ID: ${user.id}
User: ${user.username}
Plan: ${user.plan}`
  );
});

/* ===============================
   UPGRADE (STRIPE)
=============================== */
bot.onText(/\/upgrade/, async (msg) => {
  const user = getUser(msg.from);

  setState(user.id, "checkout_started");

  if (isPro(user)) {
    return bot.sendMessage(msg.chat.id, "You already have PRO.");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],

      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/cancel`,

      metadata: {
        telegramId: String(user.id),
      },
    });

    user.stripeSessionId = session.id;

    bot.sendMessage(
      msg.chat.id,
      `💳 Complete your upgrade:

${session.url}`
    );

    clearTimer(user.id);

    // ABANDONMENT FOLLOW-UP (10 min)
    const t3 = setTimeout(() => {
      if (!isPro(user)) {
        bot.sendMessage(
          user.id,
          `You still haven't finished upgrading.

Your PRO access is waiting.

👉 ${session.url}`
        );
      }
    }, 600000);

    timers.set(user.id, t3);

  } catch (err) {
    console.error(err);
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
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = Number(session.metadata.telegramId);

    const user = users.get(userId);

    if (user) {
      user.plan = "pro";
      setState(userId, "pro");

      clearTimer(userId);

      bot.sendMessage(
        userId,
        "🎉 PRO activated instantly. Welcome!"
      );
    }
  }

  res.sendStatus(200);
});

/* ===============================
   TELEGRAM WEBHOOK
=============================== */
app.post("/telegram-webhook", (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

/* ===============================
   HEALTH
=============================== */
app.get("/health", (req, res) => {
  const all = Array.from(users.values());

  res.json({
    status: "ok",
    users: all.length,
    proUsers: all.filter(u => u.plan === "pro").length,
  });
});

/* ===============================
   START
=============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});