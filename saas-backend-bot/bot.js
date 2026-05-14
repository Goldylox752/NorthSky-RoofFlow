require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");

/* ===============================
   ENV SAFETY
=============================== */
const REQUIRED = [
  "TELEGRAM_BOT_TOKEN",
  "STRIPE_SECRET_KEY",
  "CLIENT_URL",
];

for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

const {
  TELEGRAM_BOT_TOKEN,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  CLIENT_URL,
  PORT = 3000,
} = process.env;

/* ===============================
   INIT
=============================== */
const app = express();

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  maxNetworkRetries: 3,
});

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

/* ===============================
   MEMORY STORE (MVP DB)
   (Replace with Supabase later)
=============================== */
const store = {
  users: new Map(),
  leads: new Map(),
  locks: new Map(),
  purchases: new Map(),
};

/* ===============================
   USER SYSTEM
=============================== */
function getUser(tgUser) {
  const id = tgUser.id;

  if (!store.users.has(id)) {
    store.users.set(id, {
      id,
      username: tgUser.username || "unknown",
      createdAt: Date.now(),
      purchases: 0,
    });
  }

  return store.users.get(id);
}

/* ===============================
   LEAD CREATION (CORE INVENTORY)
=============================== */
function createLead(data) {
  const id = `lead_${Date.now()}`;

  const lead = {
    id,
    name: data.name || "Unknown",
    phone: data.phone || null,
    city: data.city,
    category: data.category || "general",
    price: data.price || 25,
    score: data.score || 50,
    status: "available",
    createdAt: Date.now(),
  };

  store.leads.set(id, lead);

  broadcastLead(lead);

  return lead;
}

/* ===============================
   LOCK SYSTEM (ANTI DOUBLE BUY)
=============================== */
function lockLead(leadId, userId) {
  const lead = store.leads.get(leadId);
  if (!lead) return null;

  if (lead.status !== "available") return null;

  const now = Date.now();

  lead.status = "locked";
  lead.lockedBy = userId;
  lead.lockedAt = now;
  lead.lockExpires = now + 10 * 60 * 1000;

  store.locks.set(leadId, {
    userId,
    expires: lead.lockExpires,
  });

  return lead;
}

/* ===============================
   BROADCAST SYSTEM (SALES ENGINE)
=============================== */
function broadcastLead(lead) {
  const msg = `
🔥 NEW HIGH-QUALITY LEAD

📍 City: ${lead.city}
🏷 Category: ${lead.category}
⭐ Score: ${lead.score}/100
💰 Price: $${lead.price}

⚡ First come, first served
Buy instantly:
/buy ${lead.id}
  `.trim();

  for (const user of store.users.values()) {
    bot.sendMessage(user.id, msg);
  }
}

/* ===============================
   STRIPE CHECKOUT
=============================== */
async function createCheckout(lead, userId) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Lead (${lead.city})`,
            description: `${lead.category} lead - Score ${lead.score}`,
          },
          unit_amount: lead.price * 100,
        },
        quantity: 1,
      },
    ],

    metadata: {
      leadId: lead.id,
      userId: String(userId),
    },

    success_url: `${CLIENT_URL}/success`,
    cancel_url: `${CLIENT_URL}/cancel`,
  });
}

/* ===============================
   COMMANDS
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start" },
  { command: "leads", description: "View leads" },
  { command: "buy", description: "Buy lead" },
  { command: "add", description: "Test lead" },
  { command: "stats", description: "Stats" },
]);

/* ===============================
   START FLOW (SALES FUNNEL)
=============================== */
bot.onText(/\/start/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
`
Welcome ${user.username}

🚀 Lead Marketplace Active
- High-quality verified leads
- Instant purchase via Stripe

Type /leads to see available leads
`
  );
});

/* ===============================
   LEADS LIST
=============================== */
bot.onText(/\/leads/, (msg) => {
  const leads = [...store.leads.values()]
    .filter(l => l.status === "available")
    .slice(-10);

  if (!leads.length) {
    return bot.sendMessage(msg.chat.id, "No leads available right now.");
  }

  const text = leads.map(l => `
ID: ${l.id}
📍 ${l.city}
🏷 ${l.category}
⭐ ${l.score}
💰 $${l.price}
`).join("\n----------------\n");

  bot.sendMessage(msg.chat.id, text);
});

/* ===============================
   ADD TEST LEAD
=============================== */
bot.onText(/\/add/, (msg) => {
  const lead = createLead({
    city: "Calgary",
    category: "roofing",
    price: 29,
    score: 85,
  });

  bot.sendMessage(msg.chat.id, `Created lead: ${lead.id}`);
});

/* ===============================
   BUY FLOW (CORE MONEY ENGINE)
=============================== */
bot.onText(/\/buy (.+)/, async (msg, match) => {
  const user = getUser(msg.from);
  const leadId = match[1];

  const lead = store.leads.get(leadId);

  if (!lead) {
    return bot.sendMessage(msg.chat.id, "Lead not found");
  }

  if (lead.status !== "available") {
    return bot.sendMessage(msg.chat.id, "Lead already sold or locked");
  }

  const locked = lockLead(leadId, user.id);

  if (!locked) {
    return bot.sendMessage(msg.chat.id, "Could not lock lead");
  }

  try {
    const session = await createCheckout(lead, user.id);

    bot.sendMessage(
      msg.chat.id,
      `💳 Complete payment:\n${session.url}`
    );
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "Payment error");
  }
});

/* ===============================
   STATS (BASIC SAAS METRICS)
=============================== */
bot.onText(/\/stats/, (msg) => {
  const total = store.leads.size;
  const sold = [...store.leads.values()].filter(l => l.status === "sold").length;

  bot.sendMessage(
    msg.chat.id,
`
📊 MARKETPLACE STATS

Total Leads: ${total}
Sold: ${sold}
Revenue Ready: ${sold * 29}
`
  );
});

/* ===============================
   STRIPE WEBHOOK (REVENUE ENGINE)
=============================== */
app.post("/stripe-webhook", express.raw({ type: "application/json" }), (req, res) => {
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
    const { leadId, userId } = session.metadata;

    const lead = store.leads.get(leadId);

    if (lead) {
      lead.status = "sold";

      store.purchases.set(leadId, {
        leadId,
        userId,
        time: Date.now(),
      });

      const user = store.users.get(Number(userId));
      if (user) user.purchases += 1;

      bot.sendMessage(
        Number(userId),
        `
🔥 LEAD DELIVERED

📍 ${lead.city}
🏷 ${lead.category}
⭐ ${lead.score}

Thank you for your purchase.
        `.trim()
      );
    }
  }

  res.sendStatus(200);
});

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    leads: store.leads.size,
    users: store.users.size,
    sold: [...store.leads.values()].filter(l => l.status === "sold").length,
    revenue_estimate: [...store.leads.values()]
      .filter(l => l.status === "sold")
      .reduce((a, b) => a + b.price, 0),
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`🚀 SaaS Lead Bot running on ${PORT}`);
});