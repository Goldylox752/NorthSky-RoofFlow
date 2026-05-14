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
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID,
  STRIPE_WEBHOOK_SECRET,
  CLIENT_URL,
  PORT = 3000,
} = process.env;

/* ===============================
   APP INIT
=============================== */
const app = express();

/* ===============================
   SAFE INIT (FAIL SOFT)
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
   USER SERVICE (SUPABASE)
=============================== */
async function getOrCreateUser(tgUser) {
  const { data: existing, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", tgUser.id)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("users")
    .insert({
      telegram_id: tgUser.id,
      username: tgUser.username || "unknown",
      plan: "free",
      subscription_status: "inactive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) throw createError;

  return created;
}

const isPro = (user) => user?.plan === "pro";

/* ===============================
   SAFE TELEGRAM SEND
=============================== */
function send(chatId, text) {
  if (!bot) return;
  return bot.sendMessage(chatId, text);
}

/* ===============================
   TELEGRAM COMMANDS
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

    send(msg.chat.id, `Welcome @${user.username}. Plan: ${user.plan}`);

    setTimeout(async () => {
      const latest = await getOrCreateUser(msg.from);

      if (!isPro(latest)) {
        send(msg.chat.id, "Upgrade to PRO for faster access.");
      }
    }, 30000);
  });

  bot.onText(/\/profile/, async (msg) => {
    const user = await getOrCreateUser(msg.from);

    send(
      msg.chat.id,
      `ID: ${user.telegram_id}\nUsername: ${user.username}\nPlan: ${user.plan}`
    );
  });

  bot.onText(/\/plan/, async (msg) => {
    const user = await getOrCreateUser(msg.from);

    send(msg.chat.id, `Plan: ${user.plan}`);
  });

  bot.onText(/\/upgrade/, async (msg) => {
    if (!stripe || !STRIPE_PRICE_ID || !CLIENT_URL) {
      return send(msg.chat.id, "Payments not configured");
    }

    const user = await getOrCreateUser(msg.from);

    try {
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

      send(msg.chat.id, `Payment link:\n${session.url}`);
    } catch (err) {
      console.error("Stripe error:", err);
      send(msg.chat.id, "Failed to create checkout session");
    }
  });
}

/* ===============================
   STRIPE WEBHOOK
=============================== */
app.post("/stripe-webhook", async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.sendStatus(500);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const telegramId = Number(session.metadata.telegramId);

    try {
      await supabase
        .from("users")
        .update({
          plan: "pro",
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", telegramId);

      send(telegramId, "PRO activated");
    } catch (err) {
      console.error("DB update error:", err);
    }
  }

  res.sendStatus(200);
});

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    services: {
      telegram: !!bot,
      stripe: !!stripe,
      supabase: true,
    },
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
  console.log(`Server running on port ${PORT}`);
});