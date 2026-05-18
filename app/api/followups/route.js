import { NextResponse } from "next/server";
import OpenAI from "openai";
import twilio from "twilio";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sms = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const leads = globalThis.leads ?? new Map();
globalThis.leads = leads;

async function sendSMS(to, body) {
  if (!to) return;

  return sms.messages.create({
    from: process.env.TWILIO_PHONE,
    to,
    body,
  });
}

export async function GET() {
  try {
    const now = Date.now();
    const results = [];

    for (const [id, lead] of leads.entries()) {
      if (!lead) continue;

      const last = new Date(
        lead.lastContactAt || lead.createdAt || Date.now()
      );

      const hoursSince = (now - last.getTime()) / (1000 * 60 * 60);

      if (lead.status === "dead" || lead.followUpStage >= 3) continue;

      let shouldSend =
        (lead.followUpStage === 0 && hoursSince >= 24) ||
        (lead.followUpStage === 1 && hoursSince >= 72) ||
        (lead.followUpStage === 2 && hoursSince >= 168);

      if (!shouldSend) continue;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Write a short roofing follow-up message.`,
          },
        ],
      });

      const message =
        response.choices[0]?.message?.content || "Follow up";

      await sendSMS(lead.phone, message);

      lead.followUpStage = (lead.followUpStage || 0) + 1;
      lead.lastContactAt = new Date();

      leads.set(id, lead);

      results.push({ id, sent: true });
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}