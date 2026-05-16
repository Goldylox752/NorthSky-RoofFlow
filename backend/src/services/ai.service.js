const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===============================
   AI LEAD ANALYSIS (REAL)
=============================== */
async function aiAnalyzeLead(lead) {
  const prompt = `
You are a SaaS revenue optimization engine.

Analyze this lead and return ONLY valid JSON:

Lead:
- email: ${lead.email}
- phone: ${lead.phone}
- city: ${lead.city}

Return:
{
  "score": number (0-100),
  "tier": "starter | pro | elite",
  "price_multiplier": number,
  "conversion_probability": number (0-1),
  "recommendation": "nurture | standard_offer | upsell_elite",
  "sales_angle": string
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("AI parse error:", err);
    return {
      score: 50,
      tier: "starter",
      price_multiplier: 1,
      conversion_probability: 0.3,
      recommendation: "nurture",
      sales_angle: "Generic offer",
    };
  }
}

module.exports = { aiAnalyzeLead };