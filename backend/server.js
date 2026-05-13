require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");
const supabase = require("./lib/supabase");

/* ===============================
   ENV VALIDATION
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

const required = {
  TELEGRAM_BOT_TOKEN,
  WEBHOOK_URL,
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID,
  CLIENT_URL,
};

for (const [k, v] of Object.entries(required)) {
  if (!v) throw new Error(`Missing env: ${k}`);
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

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

/* ===============================
   MIDDLEWARE
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

/* ===============================
   HELPERS (SUPABASE USER LAYER)
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
   SALES MESSAGE (HIGH CONVERSION)
=============================== */
function salesMessage(user) {
  return `
🔥 ACCESS READY

Hi @${user.username}

You are currently on the FREE plan.

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
WHY PRO:
PRO users move faster and get better outcomes.

👉 Upgrade:
${CLIENT_URL}/checkout?plan=pro
`;
}

/* ===============================
   TELEGRAM MENU
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "plan", description: "View plan" },
  { command: "profile", description: "Profile" },
  { command: "upgrade", description: "Upgrade to PRO" },
]);

/* ===============================
   START FLOW
=============================== */
bot.onText(/\/start/, async (msg) => {
  const user = await getOrCreateUser(msg.from);

  bot.sendMessage(msg.chat.id, salesMessage(user));

  /* FOLLOW-UP #1 (30s) */
  setTimeout(async () => {
    const latest = await getOrCreateUser(msg.from);
    if (!isPro(latest)) {
      bot.sendMessage(
        msg.chat.id,
        "👀 Quick question:\n\nWant to see why PRO users get better results?"
      );
    }
  }, 30000);

  /* FOLLOW-UP #2 (3 min) */
  setTimeout(async () => {
    const latest = await getOrCreateUser(msg.from);
    if (!isPro(latest)) {
      bot.sendMessage(
        msg.chat.id,
        `Still thinking?\n\nMost users upgrade to avoid missing opportunities.\n\n👉 ${CLIENT_URL}/checkout?plan=pro`
      );
    }
  }, 180000);
});

/* ===============================
   PROFILE
=============================== */
bot.onText(/\/profile/, async (msg) => {
  const user = await getOrCreateUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
`PROFILE
ID: ${user.telegram_id}
Username: ${user.username}
Plan: ${user.plan}`
  );
});

/* ===============================
   PLAN
=============================== */
bot.onText(/\/plan/, async (msg) => {
  const user = await getOrCreateUser(msg.from);

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

/* ===============================
   UPGRADE (STRIPE CHECKOUT)
=============================== */
bot.onText(/\/upgrade/, async (msg) => {
  const user = await getOrCreateUser(msg.from);

  if (isPro(user)) {
    return bot.sendMessage(msg.chat.id, "You already have PRO access.");
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
      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/cancel`,
      metadata: {
        telegramId: String(user.telegram_id),
      },
    });

    await supabase
      .from("users")
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", user.telegram_id);

    bot.sendMessage(
      msg.chat.id,
      `💳 Complete your upgrade:\n\n${session.url}`
    );

    /* ABANDONMENT FOLLOW-UP (10 min) */
    setTimeout(async () => {
      const latest = await getOrCreateUser(msg.from);
      if (!isPro(latest)) {
        bot.sendMessage(
          msg.chat.id,
          `⏳ Your PRO access is still waiting.\n\n👉 ${session.url}`
        );
      }
    }, 600000);

  } catch (err) {
    console.error("Stripe error:", err);
    bot.sendMessage(msg.chat.id, "Payment error. Try again later.");
  }
});

/* ===============================
   STRIPE WEBHOOK
=============================== */
app.post("/stripe-webhook", async (req, res) => {
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
    const telegramId = Number(session.metadata.telegramId);

    const { error } = await supabase
      .from("users")
      .update({
        plan: "pro",
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId);

    if (!error) {
      bot.sendMessage(
        telegramId,
        "🎉 Payment confirmed — PRO activated instantly."
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
    console.error(err);
    res.sendStatus(500);
  }
});

/* ===============================
   ANALYTICS (FOR DASHBOARD)
=============================== */
app.get("/api/analytics/revenue", async (req, res) => {
  const { data } = await supabase.from("users").select("plan");

  const totalLeads = data.length;
  const paidLeads = data.filter(u => u.plan === "pro").length;

  const totalRevenue = paidLeads * 1900;
  const conversionRate =
    totalLeads === 0 ? 0 : (paidLeads / totalLeads) * 100;

  res.json({
    totalRevenue,
    totalLeads,
    paidLeads,
    conversionRate: conversionRate.toFixed(2),
  });
});

/* ===============================
   DASHBOARD ACCESS CHECK
=============================== */
app.get("/api/dashboard", async (req, res) => {
  const email = req.headers["x-user-email"];

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!data || data.plan !== "pro") {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json({ ok: true });
});

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", async (req, res) => {
  const { data } = await supabase.from("users").select("plan");

  res.json({
    status: "ok",
    users: data.length,
    proUsers: data.filter(u => u.plan === "pro").length,
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`🚀 SaaS server running on port ${PORT}`);
});