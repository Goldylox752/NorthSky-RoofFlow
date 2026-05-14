require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");

/* ===============================
   ENV VALIDATION
=============================== */
const REQUIRED_ENV = [
  "TELEGRAM_BOT_TOKEN",
  "STRIPE_SECRET_KEY",
  "CLIENT_URL",
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`);
  }
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
  timeout: 30000,
});

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

/* ===============================
   MIDDLEWARE
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

/* ===============================
   LEAD MARKET DATABASE (MVP MEMORY)
=============================== */
const store = {
  users: new Map(),
  leads: new Map(),
  purchases: new Map(),
  state: new Map(),
};

/* ===============================
   USER
=============================== */
function getUser(tgUser) {
  const id = tgUser.id;

  if (!store.users.has(id)) {
    store.users.set(id, {
      id,
      username: tgUser.username || "unknown",
      createdAt: Date.now(),
    });
  }

  return store.users.get(id);
}

/* ===============================
   LEADS CORE
=============================== */
function createLead(data) {
  const id = `lead_${Date.now()}`;

  const lead = {
    id,
    name: data.name,
    phone: data.phone,
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

function broadcastLead(lead) {
  const text =
`NEW LEAD AVAILABLE

Category: ${lead.category}
City: ${lead.city}
Score: ${lead.score}
Price: $${lead.price}

BUY:
${CLIENT_URL}/buy/${lead.id}`;

  // broadcast to all users (MVP)
  for (const user of store.users.values()) {
    bot.sendMessage(user.id, text);
  }
}

/* ===============================
   BUY FLOW
=============================== */
async function createCheckout(leadId, userId) {
  const lead = store.leads.get(leadId);

  if (!lead || lead.status !== "available") {
    throw new Error("Lead not available");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Lead: ${lead.category}`,
          },
          unit_amount: lead.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      leadId,
      userId: String(userId),
    },
    success_url: `${CLIENT_URL}/success`,
    cancel_url: `${CLIENT_URL}/cancel`,
  });

  return session;
}

/* ===============================
   TELEGRAM COMMANDS
=============================== */
bot.setMyCommands([
  { command: "start", description: "Start" },
  { command: "leads", description: "View leads" },
  { command: "addlead", description: "Add test lead" },
]);

bot.onText(/\/start/, (msg) => {
  const user = getUser(msg.from);

  bot.sendMessage(
    msg.chat.id,
    `Welcome ${user.username}

This is a Lead Marketplace.
You can buy verified leads instantly.`
  );
});

/* ===============================
   LIST LEADS
=============================== */
bot.onText(/\/leads/, (msg) => {
  const leads = Array.from(store.leads.values())
    .filter(l => l.status === "available")
    .slice(-10);

  if (!leads.length) {
    return bot.sendMessage(msg.chat.id, "No leads available");
  }

  const text = leads.map(l =>
`ID: ${l.id}
City: ${l.city}
Score: ${l.score}
Price: $${l.price}
`).join("\n----------------\n");

  bot.sendMessage(msg.chat.id, text);
});

/* ===============================
   ADD TEST LEAD (MVP ONLY)
=============================== */
bot.onText(/\/addlead/, (msg) => {
  const lead = createLead({
    name: "Test Customer",
    phone: "hidden",
    city: "Calgary",
    category: "roofing",
    price: 29,
    score: 82,
  });

  bot.sendMessage(msg.chat.id, `Lead created: ${lead.id}`);
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
  } catch {
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const { leadId, userId } = session.metadata;

    const lead = store.leads.get(leadId);

    if (lead && lead.status === "available") {
      lead.status = "sold";

      store.purchases.set(leadId, {
        leadId,
        userId,
        purchasedAt: Date.now(),
      });

      bot.sendMessage(
        Number(userId),
        `Lead unlocked:

${lead.city} - ${lead.category}
Phone: hidden (unlock logic later)`
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
    status: "ok",
    leads: store.leads.size,
    users: store.users.size,
    sold: Array.from(store.leads.values()).filter(l => l.status === "sold").length,
  });
});

/* ===============================
   START
=============================== */
app.listen(PORT, () => {
  console.log(`Lead Marketplace running on port ${PORT}`);
});