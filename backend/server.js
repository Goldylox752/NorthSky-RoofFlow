import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

/* ─────────────────────────
   MIDDLEWARE
───────────────────────── */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ─────────────────────────
   SUPABASE SETUP
───────────────────────── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ─────────────────────────
   SIMPLE SESSION MEMORY
   (upgrade later → Redis / Supabase)
───────────────────────── */
const sessions = {};

/* ─────────────────────────
   INTENT MAP (SMART BOT CORE)
───────────────────────── */
const intents = [
  {
    name: "website",
    keywords: ["website", "web", "landing", "site", "build"],
    reply:
      "We build high-converting websites designed to turn visitors into paying customers. What type of business are you running?"
  },
  {
    name: "seo",
    keywords: ["seo", "google", "rank", "traffic"],
    reply:
      "We help businesses rank higher on Google and generate consistent organic leads without ads."
  },
  {
    name: "pricing",
    keywords: ["price", "cost", "how much", "pricing"],
    reply:
      "Most projects range from $300–$1500 depending on features. What are you looking to build?"
  },
  {
    name: "automation",
    keywords: ["automation", "ai", "bot", "crm", "system"],
    reply:
      "We build automation systems that handle leads, follow-ups, and client conversion automatically."
  },
  {
    name: "contact",
    keywords: ["contact", "whatsapp", "call", "talk"],
    reply:
      "You can reach us on WhatsApp at +1 780-267-9673 for the fastest response."
  }
];

/* ─────────────────────────
   INTENT DETECTOR (IMPROVED)
───────────────────────── */
function detectIntent(message = "") {
  const msg = message.toLowerCase();

  return (
    intents.find((intent) =>
      intent.keywords.some((k) => msg.includes(k))
    ) || null
  );
}

/* ─────────────────────────
   AI RESPONSE ENGINE
───────────────────────── */
function generateReply(intent, message) {
  if (!intent) {
    return "Got it — what are you trying to build? I can help with websites, SEO, or automation systems.";
  }

  let reply = intent.reply;

  // smart contextual upgrades
  if (intent.name === "pricing") {
    reply += " What budget range are you working with?";
  }

  if (intent.name === "website") {
    reply += " What industry is your business in?";
  }

  if (intent.name === "seo") {
    reply += " Are you currently getting any traffic?";
  }

  return reply;
}

/* ─────────────────────────
   BOT API ROUTE
───────────────────────── */
app.post("/api/bot", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    /* session tracking */
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        step: 0,
        createdAt: Date.now()
      };
    }

    const intent = detectIntent(message);
    const reply = generateReply(intent, message);

    /* ───────── SAVE LEAD TO SUPABASE ───────── */
    const { error } = await supabase.from("leads").insert([
      {
        session_id: sessionId,
        message,
        reply,
        intent: intent?.name || "unknown"
      }
    ]);

    if (error) {
      console.error("Supabase error:", error.message);
    }

    /* ───────── RESPONSE ───────── */
    return res.json({
      reply,
      intent: intent?.name || "unknown"
    });

  } catch (err) {
    console.error("Server error:", err);

    return res.status(500).json({
      reply: "Server error — please try again later."
    });
  }
});

/* ─────────────────────────
   HEALTH CHECK
───────────────────────── */
app.get("/", (req, res) => {
  res.send("🚀 RoofFlow AI Bot + Supabase Running");
});

/* ─────────────────────────
   START SERVER
───────────────────────── */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});