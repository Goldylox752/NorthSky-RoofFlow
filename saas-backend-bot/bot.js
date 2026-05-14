require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");
const twilio = require("twilio");

/* ===============================
   ENV SAFETY
=============================== */
const REQUIRED = [
  "TELEGRAM_BOT_TOKEN",
  "STRIPE_SECRET_KEY",
  "CLIENT_URL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
];

for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

const {
  TELEGRAM_BOT_TOKEN,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  CLIENT_URL,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  PORT = 3000,
} = process.env;

/* ===============================
   INIT SERVICES
=============================== */
const app = express();

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  maxNetworkRetries: 3,
});

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/* ===============================
   MEMORY STORE (MVP DB)
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
      phone: null,
      createdAt: Date.now(),
      purchases: 0,
    });
  }

  return store.users.get(id);
}

/* ===============================
   SAFE SEND HELPERS
=============================== */
function sendTG(chatId, text) {
  try {
    return bot.sendMessage(chatId, text);
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
}

async function sendSMS(phone, message) {
  if (!phone) return;

  try {
    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (err) {
    console.error("Twilio error:", err.message);
  }
}

/* ===============================
   LEAD ENGINE
=============================== */
function createLead(data) {
  const id = `lead_${Date.now()}`;

  const lead = {
    id,
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
  if (!lead || lead.status !== "available") return null;

  lead.status = "locked";
  lead.lockedBy = userId;
  lead.lockedAt = Date.now();
  lead.lockExpires = Date.now() + 10 * 60 * 1000;

  store.locks.set(leadId, userId);

  return lead;
}

/* ===============================
   SALES BROADCAST ENGINE
=============================== */
function broadcastLead(lead) {
  const msg = `
🔥 NEW HIGH-CONVERTING LEAD

📍 City: ${lead.city}
🏷 Category: ${lead.category}
⭐ Score: ${lead.score}/100
💰 Price: $${lead.price}

👉 Buy instantly:
/buy ${lead.id}
  `.trim();

  for (const user of store.users.values()) {
    sendTG(user.id, msg);
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
            name: `Lead - ${lead.city}`,
            description: `${lead.category} lead`,
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
   TELEGRAM COMMANDS
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "leads", description: "View leads" },
  { command: "add", description: "Generate test lead" },
  { command: "buy", description: "Buy lead" },
  { command: "stats", description: "Marketplace stats" },
]);

/* ===============================
   START
=============================== */
bot.onText(/\/start/, (msg) => {
  const user = getUser(msg.from);

  sendTG(
    msg.chat.id,
`Welcome ${user.username}

🚀 Lead Marketplace Active
Use /leads to browse leads`
  );
});

/* ===============================
   LIST LEADS
=============================== */
bot.onText(/\/leads/, (msg) => {
  const leads = [...store.leads.values()]
    .filter(l => l.status === "available")
    .slice(-10);

  if (!leads.length) {
    return sendTG(msg.chat.id, "No leads available right now.");
  }

  const text = leads
    .map(
      (l) => `
ID: ${l.id}
📍 ${l.city}
🏷 ${l.category}
⭐ ${l.score}
💰 $${l.price}
`
    )
    .join("\n----------------\n");

  sendTG(msg.chat.id, text);
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

  sendTG(msg.chat.id, `Created lead:\n${lead.id}`);
});

/* ===============================
   BUY FLOW (CORE REVENUE ENGINE)
=============================== */
bot.onText(/\/buy (.+)/, async (msg, match) => {
  const user = getUser(msg.from);
  const leadId = match[1];

  const lead = store.leads.get(leadId);

  if (!lead) return sendTG(msg.chat.id, "Lead not found");

  const locked = lockLead(leadId, user.id);

  if (!locked) return sendTG(msg.chat.id, "Lead already taken");

  try {
    const session = await createCheckout(lead, user.id);

    sendTG(msg.chat.id, `💳 Pay here:\n${session.url}`);
  } catch (err) {
    console.error(err);
    sendTG(msg.chat.id, "Payment error occurred");
  }
});

/* ===============================
   STATS (SAAS METRICS)
=============================== */
bot.onText(/\/stats/, (msg) => {
  const total = store.leads.size;
  const sold = [...store.leads.values()].filter(l => l.status === "sold").length;

  sendTG(
    msg.chat.id,
`📊 MARKETPLACE STATS

Total Leads: ${total}
Sold: ${sold}
Revenue Estimate: $${sold * 29}`
  );
});

/* ===============================
   STRIPE WEBHOOK (MONEY CONFIRMATION)
=============================== */
app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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
      const { leadId, userId } = session.metadata;

      const lead = store.leads.get(leadId);

      if (lead) {
        lead.status = "sold";

        const user = store.users.get(Number(userId));
        if (user) user.purchases += 1;

        const message = `
🔥 LEAD DELIVERED

📍 ${lead.city}
🏷 ${lead.category}
⭐ ${lead.score}
        `.trim();

        // Telegram delivery
        sendTG(Number(userId), message);

        // Twilio SMS delivery (NEW SALES CHANNEL)
        if (user?.phone) {
          await sendSMS(user.phone, message);
        }
      }
    }

    res.sendStatus(200);
  }
);

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    leads: store.leads.size,
    users: store.users.size,
    sold: [...store.leads.values()].filter(l => l.status === "sold").length,
  });
});

/* ===============================
   START SERVER
=============================== */
app.listen(PORT, () => {
  console.log(`🚀 Lead SaaS + Twilio + Stripe running on ${PORT}`);
});