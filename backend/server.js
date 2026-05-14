require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");
const supabase = require("./lib/supabase");

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

/* ===============================
   SAFE ENV CHECK (NO CRASH)
=============================== */
function warnMissing(name, value) {
  if (!value) {
    console.warn(`⚠️ Missing ENV: ${name}`);
    return false;
  }
  return true;
}

const ENV_OK = {
  TELEGRAM_BOT_TOKEN: warnMissing("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN),
  STRIPE_SECRET_KEY: warnMissing("STRIPE_SECRET_KEY", STRIPE_SECRET_KEY),
  STRIPE_PRICE_ID: warnMissing("STRIPE_PRICE_ID", STRIPE_PRICE_ID),
  CLIENT_URL: warnMissing("CLIENT_URL", CLIENT_URL),
};

/* ===============================
   INIT APP (ALWAYS RUNS)
=============================== */
const app = express();

/* ===============================
   SERVICES (SAFE INIT)
=============================== */
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
      maxNetworkRetries: 2,
      timeout: 30000,
    })
  : null;

const bot = TELEGRAM_BOT_TOKEN
  ? new TelegramBot(TELEGRAM_BOT_TOKEN)
  : null;

/* ===============================
   MIDDLEWARE
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

/* ===============================
   HELPERS
=============================== */
async function getOrCreateUser(tgUser) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", tgUser.id)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      telegram_id: tgUser.id,
      username: tgUser.username || "unknown",
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return created;
}

const isPro = (u) => u.plan === "pro";

/* ===============================
   TELEGRAM SAFETY WRAPPER
=============================== */
function send(chatId, text) {
  if (!bot) return console.warn("Telegram bot not configured");
  return bot.sendMessage(chatId, text);
}

/* ===============================
   BOT COMMANDS
=============================== */
if (bot) {
  bot.setMyCommands([
    { command: "start", description: "Start bot" },
    { command: "plan", description: "View plan" },
    { command: "profile", description: "Profile" },
    { command: "upgrade", description: "Upgrade to PRO" },
  ]);

  bot.onText(/\/start/, async (msg) => {
    const user = await getOrCreateUser(msg.from);

    send(msg.chat.id, `Welcome @${user.username} — plan: ${user.plan}`);

    setTimeout(async () => {
      const latest = await getOrCreateUser(msg.from);
      if (!isPro(latest)) {
        send(msg.chat.id, "Want faster access? Upgrade to PRO.");
      }
    }, 30000);
  });

  bot.onText(/\/profile/, async (msg) => {
    const user = await getOrCreateUser(msg.from);

    send(
      msg.chat.id,
      `ID: ${user.telegram_id}\nUser: ${user.username}\nPlan: ${user.plan}`
    );
  });

  bot.onText(/\/plan/, async (msg) => {
    const user = await getOrCreateUser(msg.from);

    send(
      msg.chat.id,
      `PLAN: ${user.plan}\nFREE vs PRO features available.`
    );
  });

  bot.onText(/\/upgrade/, async (msg) => {
    if (!stripe) return send(msg.chat.id, "Stripe not configured");

    const user = await getOrCreateUser(msg.from);

    if (!STRIPE_PRICE_ID || !CLIENT_URL) {
      return send(msg.chat.id, "Payment system not configured");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/cancel`,
      metadata: {
        telegramId: String(user.telegram_id),
      },
    });

    send(msg.chat.id, `Pay here:\n${session.url}`);
  });
}

/* ===============================
   STRIPE WEBHOOK
=============================== */
app.post("/stripe-webhook", async (req, res) => {
  if (!stripe) return res.sendStatus(500);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const telegramId = Number(session.metadata.telegramId);

    await supabase
      .from("users")
      .update({
        plan: "pro",
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId);

    send(telegramId, "🎉 PRO activated!");
  }

  res.sendStatus(200);
});

/* ===============================
   HEALTH CHECK (RENDER SAFE)
=============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    telegram: !!bot,
    stripe: !!stripe,
    missingEnv: {
      TELEGRAM_BOT_TOKEN: !TELEGRAM_BOT_TOKEN,
      STRIPE_SECRET_KEY: !STRIPE_SECRET_KEY,
      STRIPE_PRICE_ID: !STRIPE_PRICE_ID,
      CLIENT_URL: !CLIENT_URL,
    },
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});