import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function aiScoreLead({ email, phone, answers }) {
  const prompt = `
You are a lead qualification system for a roofing lead generation company.

Score this lead from 0–100 based on:
- Buying intent
- Budget seriousness
- Business legitimacy
- Urgency
- Likelihood of closing deals

Reject "tire kickers", low-budget contractors, and casual inquiries.

Lead data:
Email: ${email}
Phone: ${phone}
Answers: ${JSON.stringify(answers)}

Return ONLY JSON:
{
  "score": number,
  "reason": "short explanation"
}
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    return JSON.parse(res.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI failed:", err.message);

    return {
      score: 0,
      reason: "AI unavailable (quota or API error)",
    };
  }
}
