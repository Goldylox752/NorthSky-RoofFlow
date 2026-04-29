require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// ENV
// =====================
const {
  OPENAI_API_KEY,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  BUSINESS_PHONE,
  PORT,
} = process.env;

// =====================
// CLIENTS
// =====================
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const smsClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// =====================
// MEMORY STORE (replace with DB later)
// =====================
const leads = new Map();

// =====================
// LEAD STRUCTURE
// =====================
// {
//   id,
//   name,
//   phone,
//   jobType,
//   location,
//   status,
//   messages,
//   createdAt,
//   lastContactAt,
//   followUpStage
// }

// =====================
// HELPERS
// =====================
const normalizePhone = (phone) => phone.replace(/\D/g, "");

const createLeadId = (phone) => normalizePhone(phone);

// =====================
// AI ENGINE
// =====================
async function generateAIMessage(lead, stage = 0) {
  const stages = [
    "First response: introduce yourself and ask ONE clear question.",
    "Follow-up: polite check-in, no pressure.",
    "Third follow-up: add urgency and mention limited availability.",
    "Final follow-up: friendly last message, close loop."
  ];

  const prompt = `
You are an AI roofing sales assistant.

Rules:
- 2–3 sentences max
- ONE question only
- Human, natural tone
- Focus: roofing repair, replacement, storm damage

Stage: ${stage}
Instruction: ${stages[stage] || stages[0]}

Lead Info:
Name: ${lead.name}
Job Type: ${lead.jobType}
Location: ${lead.location}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return res.choices[0].message.content;
}

// =====================
// SMS SENDER
// =====================
async function sendSMS(to, message) {
  return smsClient.messages.create({
    from: TWILIO_PHONE,
    to,
    body: message,
  });
}

// =====================
// SAVE LEAD
// =====================
function saveLead(lead) {
  leads.set(lead.id, lead);
}

// =====================
// FOLLOW-UP SYSTEM
// =====================
async function scheduleFollowUp(leadId, delayMs) {
  setTimeout(async () => {
    const lead = leads.get(leadId);
    if (!lead) return;
    if (lead.status === "dead") return;

    lead.followUpStage += 1;

    const message = await generateAIMessage(lead, lead.followUpStage);

    await sendSMS(lead.phone, message);

    lead.messages.push({
      type: "followup",
      stage: lead.followUpStage,
      message,
      at: new Date(),
    });

    lead.lastContactAt = new Date();
    saveLead(lead);

    // chain follow-ups
    const followUpSchedule = [
      24,   // 1 day
      48,   // 2 days
      72,   // 3 days
      168,  // 7 days
    ];

    if (lead.followUpStage < 3) {
      scheduleFollowUp(
        lead.id,
        followUpSchedule[lead.followUpStage] * 60 * 60 * 1000
      );
    }

  }, delayMs);
}

// =====================
// LEAD ENTRY POINT
// =====================
app.post("/lead", async (req, res) => {
  try {
    const { name, phone, jobType, location } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = createLeadId(phone);

    const lead = {
      id,
      name,
      phone,
      jobType,
      location,
      status: "new",
      messages: [],
      createdAt: new Date(),
      lastContactAt: null,
      followUpStage: 0,
    };

    saveLead(lead);

    // INITIAL AI MESSAGE
    const message = await generateAIMessage(lead, 0);

    await sendSMS(phone, message);

    lead.messages.push({
      type: "initial",
      message,
      at: new Date(),
    });

    lead.status = "contacted";
    lead.lastContactAt = new Date();

    saveLead(lead);

    // notify business
    if (BUSINESS_PHONE) {
      await sendSMS(
        BUSINESS_PHONE,
        `New Lead → ${name} | ${phone} | ${jobType || "N/A"}`
      );
    }

    // start follow-up chain
    scheduleFollowUp(id, 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      message: "AI lead system activated",
    });

  } catch (err) {
    console.error("LEAD ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =====================
// DEBUG ENDPOINT
// =====================
app.get("/leads", (req, res) => {
  res.json([...leads.values()]);
});

// =====================
// START SERVER
// =====================
const PORT_NUMBER = PORT || 5000;

app.listen(PORT_NUMBER, () => {
  console.log(`🚀 Roof Flow AI running on port ${PORT_NUMBER}`);
});