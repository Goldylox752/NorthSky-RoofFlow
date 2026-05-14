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

const twilioClient = twilio(
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN
);

/* ===============================
   MEMORY STORE (MVP DATABASE)
=============================== */
const store = {
  users: new Map(),
  leads: new Map(),
  locks: new Map(),
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
      purchases: 0,
      createdAt: Date.now(),
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
  } catch (e) {
    console.error("Telegram error:", e.message);
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
  } catch (e) {
    console.error("SMS error:", e.message);
  }
}

/* ===============================
   📞 VOICE CALL ENGINE
=============================== */
async function sendVoiceCall(phone, lead) {
  if (!phone) return;

  try {
    await twilioClient.calls.create({
      to: phone,
      from: TWILIO_PHONE_NUMBER,
      twiml: `
        <Response>
          <Say voice="alice">
            Hello. This is your automated sales system.
            You just purchased a ${lead.category} lead in ${lead.city}.
            Score is ${lead.score} out of 100.
            Please check your Telegram or dashboard for full details.
          </Say>
        </Response>
      `,
    });
  } catch (e) {
    console.error("Voice call error:", e.message);
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
   LEAD LOCK SYSTEM
=============================== */
function lockLead(leadId, userId) {
  const lead = store.leads.get(leadId);
  if (!lead || lead.status !== "available") return null;

  lead.status = "locked";
  lead.lockedBy = userId;
  lead.lockedAt = Date.now();

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
⭐ Score: ${lead.score}
💰 Price: $${lead.price}

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
            description: lead.category,
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
  { command: "start", description: "Start" },
  { command: "leads", description: "View leads" },
  { command: "add", description: "Test lead" },
  { command: "buy", description: "Buy lead" },
  { command: "stats", description: "Stats" },
]);

bot.onText(/\/start/, (msg) => {
  const user = getUser(msg.from);

  sendTG(msg.chat.id,
`Welcome ${user.username}

🚀 AI Sales Marketplace Active`
  );
});

/* ===============================
   LEADS LIST
=============================== */
bot.onText(/\/leads/, (msg) => {
  const leads = [...store.leads.values()]
    .filter(l => l.status === "available")
    .slice(-10);

  if (!leads.length) return sendTG(msg.chat.id, "No leads available");

  sendTG(msg.chat.id,
    leads.map(l =>
`ID: ${l.id}
📍 ${l.city}
🏷 ${l.category}
⭐ ${l.score}
💰 $${l.price}`
    ).join("\n\n---\n")
  );
});

/* ===============================
   ADD LEAD
=============================== */
bot.onText(/\/add/, (msg) => {
  const lead = createLead({
    city: "Calgary",
    category: "roofing",
    price: 29,
    score: 85,
  });

  sendTG(msg.chat.id, `Created: ${lead.id}`);
});

/* ===============================
   BUY FLOW
=============================== */
bot.onText(/\/buy (.+)/, async (msg, match) => {
  const user = getUser(msg.from);
  const leadId = match[1];

  const lead = store.leads.get(leadId);
  if (!lead) return sendTG(msg.chat.id, "Not found");

  const locked = lockLead(leadId, user.id);
  if (!locked) return sendTG(msg.chat.id, "Already taken");

  const session = await createCheckout(lead, user.id);

  sendTG(msg.chat.id, `💳 Pay here:\n${session.url}`);
});

/* ===============================
   STRIPE WEBHOOK + SMS + VOICE
=============================== */
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
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
    const user = store.users.get(Number(userId));

    if (lead) {
      lead.status = "sold";

      const msg = `
🔥 LEAD DELIVERED

📍 ${lead.city}
🏷 ${lead.category}
⭐ ${lead.score}
      `.trim();

      sendTG(Number(userId), msg);

      if (user?.phone) {
        await sendSMS(user.phone, msg);

        // 📞 VOICE CALL (AUTOMATED CLOSING TOUCH)
        await sendVoiceCall(user.phone, lead);
      }
    }
  }

  res.sendStatus(200);
});

/* ===============================
   STATS
=============================== */
bot.onText(/\/stats/, (msg) => {
  const total = store.leads.size;
  const sold = [...store.leads.values()].filter(l => l.status === "sold").length;

  sendTG(msg.chat.id,
`📊 STATS

Total: ${total}
Sold: ${sold}
Revenue: $${sold * 29}`
  );
});

/* ===============================
   HEALTH
=============================== */
app.get("/health", (req, res) => {
  res.json({
    leads: store.leads.size,
    users: store.users.size,
  });
});

/* ===============================
   START
=============================== */
app.listen(PORT, () => {
  console.log(`🚀 AI Sales SaaS + Voice + SMS running on ${PORT}`);
});