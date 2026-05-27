import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

const app = express();

/* ───────── MIDDLEWARE ───────── */
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests" }
}));

/* ───────── SUPABASE ───────── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ───────── INTENTS ───────── */
const intents = [
  { name: "website", keywords: ["website", "site", "landing"], reply: "We build high-converting websites for service businesses." },
  { name: "seo", keywords: ["seo", "rank", "google"], reply: "We help you rank on Google and generate organic leads." },
  { name: "pricing", keywords: ["price", "cost", "how much"], reply: "Most systems range from $300–$1500 depending on setup." },
  { name: "automation", keywords: ["automation", "ai", "bot", "crm"], reply: "We build AI systems that automate leads, follow-ups, and bookings." },
  { name: "contact", keywords: ["contact", "whatsapp", "call"], reply: "WhatsApp: +1 780-267-9673" }
];

/* ───────── INTENT ENGINE ───────── */
function detectIntent(msg = "") {
  const text = msg.toLowerCase();

  return intents.find(i =>
    i.keywords.some(k => text.includes(k))
  ) || null;
}

/* ───────── RESPONSE ENGINE ───────── */
function generateReply(intent) {
  if (!intent) {
    return {
      text: "What are you trying to build? I can help with websites, SEO, or AI automation systems.",
      type: "fallback"
    };
  }

  return {
    text: intent.reply,
    type: intent.name
  };
}

/* ───────── BOT ENDPOINT ───────── */
app.post("/api/bot", async (req, res) => {
  try {
    const { message, sessionId = crypto.randomUUID() } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const intent = detectIntent(message);
    const response = generateReply(intent);

    /* save lead */
    await supabase.from("leads").insert([
      {
        session_id: sessionId,
        message,
        reply: response.text,
        intent: response.type
      }
    ]);

    return res.json(response);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error"
    });
  }
});

/* ───────── HEALTH ───────── */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "RoofFlow API"
  });
});

/* ───────── START ───────── */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});